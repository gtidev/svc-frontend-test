const serviceName = require('../../package.json').name;
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint(),
    format.colorize()
  ),
  defaultMeta: { service: serviceName },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new transports.File({ filename: 'logs/err-logger.log', level: 'error' }),
    new transports.File({ filename: 'logs/logger.log' })
  ]
});

module.exports = e => logger.log('error', e);