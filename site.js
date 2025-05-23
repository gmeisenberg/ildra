const fetchData = async () => {
  try {
    const ipData = await getIPData();
    console.log(ipData);
    
    const coords = await getGPSData().then(pos => {
      return { lat: pos.latitude, lon: pos.longitude }
    }).catch(error => {
      console.log(error);
      return { lat: ipData.latitude, lon: ipData.longitude }
    });
    console.log(coords);
    
    const weatherData = await getWeatherData(coords);
    console.log(weatherData);

    printData(ipData.ip);
  } catch (error) {
    console.error(error);
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
  const apiKey = '7b75455de10dd6e742784781ec827118';
  const lat = coords.lat;
  const lon = coords.lon;
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  return await response.json();
}

const printData = (data) => {
  const el = document.createElement('code');
  el.innerHTML = data;
  document.body.appendChild(el);
};

document.addEventListener('DOMContentLoaded', fetchData);
