const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `%cINFO%c [${getCallerInfo()}]`,
        "color: green; font-weight: bold;",
        "color: inherit;",
        ...args
      );
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `%cWARN%c [${getCallerInfo()}]`,
        "color: orange; font-weight: bold;",
        "color: inherit;",
        ...args
      );
    }
  },
  error: (...args) => {
    console.error(
      `%cERROR%c [${getCallerInfo()}]`,
      "color: red; font-weight: bold;",
      "color: inherit;",
      ...args
    );
  },
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `%cDEBUG%c [${getCallerInfo()}]`,
        "color: blue; font-weight: bold;",
        "color: inherit;",
        ...args
      );
    }
  },
  credits: (message, style = "") => {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `%c${message}`,
        style,
      );
    }
  },
};

// Utility to get file and line number where logger is called
function getCallerInfo() {
  try {
    const error = new Error();
    const stack = error.stack.split("\n");
    // Adjust stack index based on your runtime environment
    const callerLine = stack[3] || stack[2]; // Get the caller
    const match = callerLine.match(/(\/[^:]+):(\d+):(\d+)/);

    return match ? `${match[1]}:${match[2]}` : "unknown location";
  } catch {
    return "unknown location";
  }
}

export default logger;
