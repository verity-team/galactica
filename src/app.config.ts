import { ConfigModuleOptions } from "@nestjs/config";
import { ThrottlerModuleOptions } from "@nestjs/throttler";
import configuration from "@root/config/configuration";

export const getConfigModuleConfig = (): ConfigModuleOptions => {
  return {
    envFilePath: ".env",
    isGlobal: true,
    load: [configuration],
  };
};

export const getThrottlerModuleConfig = (): ThrottlerModuleOptions => {
  // Short limit default to 2 requests/s if not configured
  let shortTTL = Number(process.env.SHORT_TTL);
  if (isNaN(shortTTL)) {
    // 1 second
    shortTTL = 1000;
  }
  let shortLimit = Number(process.env.SHORT_LIMIT);
  if (isNaN(shortLimit)) {
    shortLimit = 1;
  }

  // Long limit default to 10 request/m if not configured
  let longTTL = Number(process.env.LONG_TTL);
  if (isNaN(longTTL)) {
    // 1 minute
    longTTL = 60000;
  }
  let longLimit = Number(process.env.LONG_LIMIT);
  if (isNaN(longLimit)) {
    longLimit = 10;
  }

  return {
    throttlers: [
      {
        name: "short",
        ttl: shortTTL,
        limit: shortLimit,
      },
      {
        name: "long",
        ttl: longTTL,
        limit: longLimit,
      },
    ],
  };
};
