import { logger, timeout, getById, createElement, kToC } from './utils.js';

const elClock = getById('clock');
const elIp = getById('ip');
const elCoords = getById('coords');
const elLocation = getById('location');
const elCity = getById('city');
const elConditions = getById('conditions');

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
  const updateClock = () => {
    const d = new Date();
    const datestring = [
      d.toLocaleDateString('en-US', { weekday: 'short' }),
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      d.toLocaleTimeString('en-US', { hour12: false })
    ].join(' ');
    elClock.textContent = datestring;
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
  elIp.textContent = 'loading...';
  await timeout(500);
  elIp.textContent = data;
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

  elCoords.textContent = 'loading...';
  await timeout(800);
  elCoords.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  
  displayLocationBtn();
}

const displayLocationBtn = async () => {
  if ('prompt' === await getGeolocationPermission()) {
    const btn = createElement('button', {
      id: 'geolocate',
      innerHTML: '<span>&#x27A4;</span>',
      onclick: () => updateLocationData()
    });
    elLocation.appendChild(btn);
  }
}

const removeLocationBtn = () => {
  elLocation.textContent = '';
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
  elCity.textContent = 'loading...';
  elConditions.textContent = '';

  const data = await getWeatherData(pos);
  const city = data.name;
  const temp = kToC(data.main.temp);
  const description = data.weather[0].main;
  const icon = data.weather[0].icon;
  
  await timeout(800);
  elCity.textContent = city;

  const img = createElement('img', {
    id: 'weather-icon',
    alt: description,
    src: `https://openweathermap.org/img/wn/${icon}@2x.png`
  });
  elConditions.innerHTML = `${temp}&deg;C`;
  elConditions.prepend(img);
}
