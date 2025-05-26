const logger = {};
logger.log = (msg, ...rest) => (typeof debug != 'undefined' && debug) ? console.log(msg, ...rest) : '';
logger.error = (msg, ...rest) => console.error(msg, ...rest);

document.addEventListener('DOMContentLoaded', () => {
  setClock();
  fetchData();
});

const setClock = () => {
  const updateClock = () => {
    const d = new Date();
    document.getElementById('clock').textContent = d;
  }
  const el = Object.assign(document.createElement('div'), { id: 'clock' });
  printData(el);
  setInterval(updateClock, 1000);
}

const fetchData = async () => {
  try {
    const ipData = await getIPData();
    logger.log(ipData);
    
    const coords = await getGPSData().then(pos => {
      return { lat: pos.latitude, lon: pos.longitude }
    }).catch(error => {
      logger.log(error);
      return { lat: ipData.latitude, lon: ipData.longitude }
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

const printData = (data, ...rest) => {
  document.querySelector('main').append(data, ...rest);
}
