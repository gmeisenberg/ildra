const locate = () => {
  const url = '/ip.php';

  const printData = (data) => {
    const el = document.createElement('code');
    el.innerHTML = data;
    document.body.appendChild(el);
  };

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      printData(data);
    })
    .catch(error => console.log(error));
};

document.addEventListener('DOMContentLoaded', locate);
