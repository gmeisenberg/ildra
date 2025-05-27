const logger = {};
logger.log = (msg, ...rest) => (typeof debug != 'undefined' && debug) ? console.log(msg, ...rest) : '';
logger.error = (msg, ...rest) => console.error(msg, ...rest);

document.addEventListener('DOMContentLoaded', () => {
  setClock();
  fetchData();
});

const render = (content, ...rest) => {
  const selector = 'main';
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (!el) {
      reject(`Element with selector "${selector}" not found.`);
    } else {
      el.append(content, ...rest);
      resolve('Content rendered.');
    }
  });
}

const setClock = () => {
  const updateClock = () => {
    const d = new Date();
    const datestring = [
      d.toLocaleDateString('en-US', { weekday: 'short' }),
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      d.toLocaleTimeString('en-US', { hour12: false })
    ].join(' ');
    document.getElementById('clock').textContent = datestring;
  }

  const el = Object.assign(document.createElement('div'), { id: 'clock' });
  render(el)
    .then((result) => {
      setInterval(updateClock, 1000);
      logger.log(result, el.outerHTML);
    })
    .catch(error => logger.error(error));
}

const fetchData = async () => {
  try {
    const ipData = await getIPData();
    logger.log(ipData);
    
    const coords = await getGPSData()
      .then(pos => {
        return { lat: pos.latitude, lon: pos.longitude }
      }).catch(error => {
        return { lat: ipData.latitude, lon: ipData.longitude }
        logger.log(error);
      });
    logger.log(coords);
    
    const weatherData = await getWeatherData(coords);
    logger.log(weatherData);
  } catch (error) {
    logger.error(error);
  }
}

const getIPData = async () => {
  const response = await fetch('https://ipwho.is');
  return await response.json();
}

const getGPSData = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords), reject);
    } else {
      reject("Geolocation not supported.");
    }
  });
}

const getWeatherData = async (coords) => {
  const data = new FormData();
  data.append('lat', coords.lat);
  data.append('lon', coords.lon);

  const response = await fetch('/api/weather/', {
    method: 'POST',
    body: data 
  });
  return await response.json();
}
