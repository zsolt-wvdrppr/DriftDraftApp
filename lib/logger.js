const logger = {
    info: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(...args);
      }
    },
    warn: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(...args);
      }
    },
    error: (...args) => {
      console.error(...args); // Always log errors regardless of environment
    },
    debug: (...args) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(...args);
      }
    },
    credits: (message, style = "") => {
      if (process.env.NODE_ENV !== "production") {
        console.info(`%c${message}`, style);
      }
    },
  };
  
  export default logger;
  