import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "DD/MM/YYYY-hh:mm:ss" }),
        format.colorize(),
        format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${
            trace ? `\n${trace}` : ""
          }`;
        }),
      ),
    }),
  ],
});
