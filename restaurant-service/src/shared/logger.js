const winston = require("winston");
const path = require("path");

function createLogger(serviceName) {
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      ({
        timestamp,
        level,
        message,
        service,
        correlationId,
        stack,
        ...meta
      }) => {
        const corrId = correlationId ? ` [corrId=${correlationId}]` : "";
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";
        const stackStr = stack ? `\n${stack}` : "";
        return `${timestamp} [${level}] [${service}]${corrId}: ${message}${metaStr}${stackStr}`;
      },
    ),
  );

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: serviceName },
    format: logFormat,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          logFormat,
        ),
      }),

      new winston.transports.File({
        filename: path.join("logs", "error.log"),
        level: "error",
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
      }),

      new winston.transports.File({
        filename: path.join("logs", "combined.log"),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
      }),
    ],
    exitOnError: false,
  });

  return logger;
}

module.exports = { createLogger };
