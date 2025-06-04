const DEBUGGING = (typeof DEBUG != 'undefined' && DEBUG) ? true : false;

export const logger = {
  log: (...msg) => DEBUGGING && console.log(...msg),
  error: (...msg) => console.error(...msg)
};

export const showLoader = (node, delay = 600) => {
  return new Promise(resolve => {
    node.textContent = '';
    const interval = setInterval(() => node.append('.'), 100);
    setTimeout(() => {
      clearInterval(interval);
      resolve();
    }, delay);
  });
}

export const getById = (id) => {
  const el = document.getElementById(id);
  if (!el) {
    throw new ReferenceError(`'${id}' not defined.`);
  }
  return el;
}

export const createElement = (type, options = {}) => {
  const element = Object.assign(document.createElement(type), options);
  return element;
}

export const kToC = (k) => parseInt(k - 273.15);
