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

    /*
    await getGPSData()
      .then(pos => {
        return { lat: pos.latitude, lon: pos.longitude }
      }).catch(error => {
        logger.log(error);
        return { lat: ipData.latitude, lon: ipData.longitude }
      });
    */
    const position = {
      lat: ipData.latitude,
      lon: ipData.longitude
    }
    displayPosition(position);
    
    const weatherData = await getWeatherData(position);
    displayWeather(weatherData);
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

const getGPSData = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => resolve(pos.coords), reject);
    } else {
      reject("Geolocation not supported.");
    }
  });
}

const displayPosition = (pos) => {
  const node = document.getElementById('position');
  node.textContent = Object.values(pos).map(n => n.toFixed(5)).join(' ');
  logger.log(pos);

  const btn = createElement('button', {
    textContent: 'Geolocation',
    onclick: geolocate
  });
  //node.appendChild(btn);
}

const geolocate = () => {
  console.log('geolocate');
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

const displayWeather = (data) => {
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
