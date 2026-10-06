// File: src/utils/imageUtils.js
// Used by: components/ImageUploader.jsx
// Browser-only image handling (no upload to any server).
// Images are converted to a Base64 "data URL" so they can be stored in localStorage.

// Wrap the callback-based FileReader API in a Promise
export function readFileAsDataURL(file) {
  if (!file) return Promise.reject(new Error('No file provided to read'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the image file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected file is not a valid image'));
    image.src = source;
  });
}

// localStorage only holds ~5 MB, so shrink photos before saving them.
export async function compressImage(file, maxSize = 640, quality = 0.8) {
  if (!file) throw new Error('No image file provided for compression');
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Selected file is not an image');
  }
  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not supported or available');
  }
  context.fillStyle = '#ffffff'; // JPEG has no transparency
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', quality);
}
