import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf(({ level, message }) => {
    return `${level}: ${message}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ],
  exceptionHandlers: [
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.Console()
  ]
});

export default logger;
