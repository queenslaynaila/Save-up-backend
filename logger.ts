import pino from 'pino';
import Config from './config';

const logger = pino({
  level: Config.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
    bindings(bindings) {
      return {
        hostname: bindings.hostname
      };
    },
    log(object) {
      return {
        ...object,
        label: 'saveup',
        node_version: process.version
      };
    }
  }
});

export default logger;