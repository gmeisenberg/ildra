const ipApi = 'https://ipwho.is';
const weatherApi = 'https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m&timezone=auto&forecast_days=1&wind_speed_unit=mph';

async function fetchData() {
  try {
    const ipResponse = await fetch(ipApi);
    const ipData = await ipResponse.json();

    const weatherResponse = await fetch(`${weatherApi}&latitude=${ipData.latitude}&longitude=${ipData.longitude}`);
    const weatherData = await weatherResponse.json();

    //printData(ipData.ip);
    console.log(ipData, weatherData);
  } catch (error) {
    console.error('Error:', error);
  }
}

const printData = (data) => {
  const el = document.createElement('code');
  el.innerHTML = data;
  document.body.appendChild(el);
};

document.addEventListener('DOMContentLoaded', fetchData);
