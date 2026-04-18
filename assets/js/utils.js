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
