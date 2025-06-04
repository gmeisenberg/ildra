import { logger, showLoader, getById, createElement, kToC } from './utils.js';

const DOM = {
  clock: getById('clock'),
  ip: getById('ip'),
  coords: getById('coords'),
  locate: getById('locate'),
  city: getById('city'),
  conditions: getById('conditions')
}

const init = async () => {
  renderClock();
  
  const ipData = await getIPData();

  const position = {
    lat: ipData.latitude,
    lon: ipData.longitude
  }
  await getLocationData(position);
  renderIP(ipData.ip);
}
document.addEventListener('DOMContentLoaded', init);

const renderClock = () => {
  const updateClock = () => {
    const d = new Date();
    const datestring = [
      d.toLocaleDateString('en-US', { weekday: 'short' }),
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      d.toLocaleTimeString('en-US', { hour12: false })
    ].join(' ');
    DOM.clock.textContent = datestring;
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

const renderIP = async (data) => {
  await showLoader(DOM.ip);
  DOM.ip.textContent = data;
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

  await showLoader(DOM.coords);
  DOM.coords.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  
  renderLocationBtn();
}

const renderLocationBtn = async () => {
  if ('prompt' === await getGeolocationPermission()) {
    const btn = createElement('button', {
      id: 'geolocate',
      onclick: () => updateLocationData()
    });
    DOM.locate.appendChild(btn);
  }
}

const removeLocationBtn = () => {
  DOM.locate.textContent = '';
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
  DOM.conditions.textContent = '';
  await showLoader(DOM.city);

  const data = await getWeatherData(pos);
  const city = data.name;
  const temp = kToC(data.main.temp);
  const description = data.weather[0].main;
  const icon = data.weather[0].icon;
  
  DOM.city.textContent = city;

  const img = createElement('img', {
    id: 'weather-icon',
    alt: description,
    src: `https://openweathermap.org/img/wn/${icon}@2x.png`
  });
  DOM.conditions.innerHTML = `<span>${temp}&deg;C</span>`;
  DOM.conditions.prepend(img);
}
