import { logger, timeout, createElement, kToC } from './utils.js';

const init = async () => {
  displayClock();
  
  const ipData = await getIPData();

  const position = {
    lat: ipData.latitude,
    lon: ipData.longitude
  }
  await getLocationData(position);
  await timeout(800);
  displayIP(ipData.ip);
}
document.addEventListener('DOMContentLoaded', init);

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

const getLocationData = async (position, geolocate = false) => {
  try {
    if (geolocate || 'granted' === await getGeolocationPermission()) {
      await getGeolocationData()
        .then(pos => Object.assign(position, { lat: pos.latitude, lon: pos.longitude }))
        .catch(error => logger.log(error));
    }
    await timeout(800);
    await updateWeather(position);
    await timeout(800);
    const showLocationBtn = ('prompt' === await getGeolocationPermission());
    updatePosition(position, showLocationBtn)
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

const getGeolocationPermission = () => {
  return navigator.permissions.query({name: 'geolocation'})
    .then(result => {
      logger.log(result);
      return result.state;
    });
}

const getGeolocationData = async () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(position => resolve(position.coords), reject);
  });
}

const updatePosition = async (pos, showLocationBtn) => {
  const nodeCoords = document.getElementById('coords');
  nodeCoords.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  logger.log(pos);
  
  const nodeBtn = document.getElementById('geolocation');
  nodeBtn.textContent = '';

  if (showLocationBtn) {
    const btn = createElement('button', {
      id: 'geolocate',
      innerHTML: '<span>&#x27A4;</span>',
      onclick: () => getLocationData(pos, true)
    });
    nodeBtn.appendChild(btn);
  }
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
  
  const nodeCity = document.getElementById('city');
  nodeCity.innerHTML = city;

  const nodeConditions = document.getElementById('conditions');
  nodeConditions.innerHTML = `${temp}&deg;C`;

  const img = createElement('img', {
    id: 'weather-icon',
    alt: description,
    src: `https://openweathermap.org/img/wn/${icon}@2x.png`
  });
  nodeConditions.prepend(img);
}
