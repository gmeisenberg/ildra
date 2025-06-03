const DEBUGGING = (typeof DEBUG != 'undefined' && DEBUG) ? true : false;

export const logger = {
  log: (...msg) => DEBUGGING && console.log(...msg),
  error: (...msg) => console.error(...msg)
};

export const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
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
