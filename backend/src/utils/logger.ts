import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'facesecure-backend' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ level, message, timestamp, ...metadata }) =>
                        `${timestamp} [${level}]: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''
                        }`
                )
            ),
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Write all logs to combined.log
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

export default logger;
