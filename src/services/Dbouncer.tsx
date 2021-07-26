export class Dbouncer {
  constructor() {}

  static debounce = (func: any, timeout = 3000) => {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(args);
      }, timeout);
    };
  };
}

export default Dbouncer;
