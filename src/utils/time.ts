export const getUnixTs = (): number => {
  return new Date().getTime();
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const DAY_MS = 24 * 60 * 60 * 1000;
