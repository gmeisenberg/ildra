import { logger, createElement, kToC } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  displayClock();
  getData();
});

const displayClock = () => {
  const node = document.getElementById('clock');
  const updateClock = () => {
    const d = new Date();
    const datestring = [
      d.toLocaleDateString('en-US', { weekday: 'short' }),
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      d.toLocaleTimeString('en-US', { hour12: false })
    ].join(' ');
    node.textContent = datestring;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

const getData = async () => {
  try {
    const ipData = await getIPData();
    displayIP(ipData.ip);

    const position = await getGeolocationData()
      .then(pos => {
        return { lat: pos.latitude, lon: pos.longitude }
      }).catch(error => {
        logger.log(error);
        return { lat: ipData.latitude, lon: ipData.longitude }
      });

    updatePosition(position);
    updateWeather(position);
  } catch (error) {
    logger.error(error);
  }
}

const getIPData = () => {
  return fetch('https://ipwho.is')
    .then(response => response.json())
    .then(data => {
      logger.log(data);
      return data;
    });
}

const displayIP = (data) => {
  const node = document.getElementById('ip');
  node.textContent = data;
}

const getGeolocationData = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords), reject);
  });
}

const getGeolocationPermission = () => {
  return navigator.permissions.query({name: 'geolocation'})
    .then(result => {
      logger.log(result);
      return result.state;
    });
}

const updatePosition = (pos) => {
  const node = document.getElementById('position');
  node.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  logger.log(pos);
}

const getWeatherData = (pos) => {
  const url = '/api/weather/';
  const data = new FormData();
  data.append('lat', pos.lat);
  data.append('lon', pos.lon);

  const options = {
    method: 'POST',
    body: data 
  }

  return fetch(url, options)
    .then(response => response.json())
    .then(data => {
      logger.log(data);
      return data;
    });
}

const updateWeather = async (pos) => {
  const data = await getWeatherData(pos);
  const city = data.name;
  const temp = kToC(data.main.temp);
  const description = data.weather[0].main;
  const icon = data.weather[0].icon;
  
  const node = document.getElementById('weather');
  node.innerHTML = `${temp}&deg;C ${city}`;

  const img = createElement('img', {
    alt: description,
    src: `https://openweathermap.org/img/wn/${icon}@2x.png`
  });
  node.prepend(img);
}
