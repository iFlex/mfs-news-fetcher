const process = require('process')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const logFormat = printf(({ level, message, service, timestamp }) => {
  return `${timestamp} [${service}] ${level}: ${message}`;
});

const LOG_LOCATION_BASE = process.env.LOGS_PATH || "./log/mfs-news-fetcher/"

function getLogger(component) {
    const logger = createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            logFormat
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new transports.File({ filename: `${LOG_LOCATION_BASE}error.log`, level: 'error' }),
            new transports.File({ filename: `${LOG_LOCATION_BASE}combined.log` }),
        ],
    });
    
    if (process.env.NODE_ENV !== 'production') {
        logger.add(new transports.Console({
            format: format.simple(),
        }));
    }

    return logger
}

module.exports = {
    getLogger:getLogger
}