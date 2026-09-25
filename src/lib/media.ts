export const mediaTypes = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};
export const mediaLimits = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};
