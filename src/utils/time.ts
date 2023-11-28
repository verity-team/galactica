export const getUnixTs = (): number => {
  return new Date().getTime();
};

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
