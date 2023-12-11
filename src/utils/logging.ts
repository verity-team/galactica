export const prettyPrintError = (error: unknown) => {
  console.error(JSON.stringify(error, null, 2));
};
