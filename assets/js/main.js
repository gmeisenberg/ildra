import { logger, createElement, container } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  setClock();
  fetchData();
});

const appendElement = async (options = {}, type = 'div', selector = 'main') => {
  try {
    const container = document.querySelector(selector);
    if (!container) {
      logger.error(`Element with selector "${selector}" not found.`);
    } else {
      const element = await createElement(type, options);
      container.append(element);
      logger.log('Appended:', element);
    }
  } catch (error) {
    logger.error(error);
  }
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

  appendElement({ id: 'clock' }).then(() => {
    updateClock();
    setInterval(updateClock, 1000);
  });
}

const fetchData = async () => {
  try {
    const ipData = await getIPData();
    container.appendChild(await createElement('div', {
      id: 'ip',
      textContent: ipData.ip
    }));
    logger.log(ipData);
    
    const coords = await getGPSData()
      .then(pos => {
        return { lat: pos.latitude, lon: pos.longitude }
      }).catch(error => {
        logger.log(error);
        return { lat: ipData.latitude, lon: ipData.longitude }
      });
    container.appendChild(await createElement('div', {
      id: 'coords',
      textContent: Object.values(coords).map(n => n.toFixed(5)).join(' ')
    }));
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
