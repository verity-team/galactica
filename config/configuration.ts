export default () => ({
  // This option only work when using Docker
  // Default to save upload images at /app/images = cwd/images
  imageDestination: process.env.IMAGE_DEST ?? "/app/images",
  // Maximum allowed TTL for SIWE message (in ms)
  // Default to 1 day
  messageMaxTTL: process.env.MESSAGE_MAXIMUM_TTL_MS || 24 * 60 * 60 * 1000,
});
