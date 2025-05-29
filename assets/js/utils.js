const DEBUGGING = (typeof DEBUG != 'undefined' && DEBUG) ? true : false;

export const logger = {
  log: (...msg) => DEBUGGING && console.log(...msg),
  error: (...msg) => console.error(...msg)
};

export const createElement = (type, options = {}) => {
  const element = Object.assign(document.createElement(type), options);
  return element;
}

export const kToC = (k) => parseInt(k - 273.15);
