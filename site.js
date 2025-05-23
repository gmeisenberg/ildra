const ipGeoApi = 'https://ipwho.is';

async function fetchData() {
  try {
    const ipGeoResponse = await fetch(ipGeoApi);
    const ipGeo = await ipGeoResponse.json();

    printData(ipGeo.ip);
    console.log(ipGeo);
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
