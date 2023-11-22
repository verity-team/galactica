export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  image: {
    // Default maximum upload image size to 20kB
    maxSize: parseInt(process.env.MAX_IMG_SIZE, 10) || 20000,
    // Default file support to JPG, JPEG, PNG and GIF
    validType: process.env.ALLOW_IMG_TYPE || "jpg|jpeg|png|gif",
  },
});
