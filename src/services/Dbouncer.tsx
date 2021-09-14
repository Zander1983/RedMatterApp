let timeoutObj: NodeJS.Timeout;

export const Debounce = (func: Function, timeout = 3000) => {
  if (!timeoutObj) {
    func();
    timeoutObj = setTimeout(() => (timeoutObj = null), timeout);
  }
};
