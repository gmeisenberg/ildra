import { logger, timeout, createElement, kToC } from './utils.js';

const init = async () => {
  displayClock();
  
  const ipData = await getIPData();

  const position = {
    lat: ipData.latitude,
    lon: ipData.longitude
  }
  await getLocationData(position);
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

const getIPData = () => {
  return fetch('https://ipwho.is')
    .then(response => response.json())
    .then(data => {
      logger.log(data);
      return data;
    });
}

const displayIP = async (data) => {
  const node = document.getElementById('ip');
  node.textContent = 'loading...';
  await timeout(500);
  node.textContent = data;
}

const getLocationData = async (position) => {
  try {
    if ('granted' === await getGeolocationPermission()) {
      await getGeolocationData()
        .then(pos => Object.assign(position, { lat: pos.latitude, lon: pos.longitude }))
        .catch(error => logger.log(error));
    }
    await updateWeather(position);
    await updatePosition(position);
    logger.log(position);
  } catch (error) {
    logger.error(error);
  }
}

const updateLocationData = () => {
  getGeolocationData()
    .then(async pos => { 
      const position = { lat: pos.latitude, lon: pos.longitude }
      logger.log(position);
      updatePosition(position);
      updateWeather(position);
    })
    .catch(error => {
      removeLocationBtn();
      logger.log(error);
    });
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

const updatePosition = async (pos) => {
  removeLocationBtn();

  const nodeCoords = document.getElementById('coords');
  nodeCoords.textContent = 'loading...';
  await timeout(800);
  nodeCoords.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  
  displayLocationBtn();
}

const displayLocationBtn = async () => {
  if ('prompt' === await getGeolocationPermission()) {
    const nodeBtn = document.getElementById('location');
    const btn = createElement('button', {
      id: 'geolocate',
      innerHTML: '<span>&#x27A4;</span>',
      onclick: () => updateLocationData()
    });
    nodeBtn.appendChild(btn);
  }
}

const removeLocationBtn = () => {
  const nodeBtn = document.getElementById('location');
  nodeBtn.textContent = '';
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
  const nodeCity = document.getElementById('city');
  const nodeConditions = document.getElementById('conditions');
  nodeCity.textContent = 'loading...';
  nodeConditions.textContent = '';

  const data = await getWeatherData(pos);
  const city = data.name;
  const temp = kToC(data.main.temp);
  const description = data.weather[0].main;
  const icon = data.weather[0].icon;
  
  await timeout(800);
  nodeCity.textContent = city;

  const img = createElement('img', {
    id: 'weather-icon',
    alt: description,
    src: `https://openweathermap.org/img/wn/${icon}@2x.png`
  });
  nodeConditions.innerHTML = `${temp}&deg;C`;
  nodeConditions.prepend(img);
}
