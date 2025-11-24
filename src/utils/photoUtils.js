import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Compress and resize image before upload
 */
export const compressImage = (canvas, quality = 0.8) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', quality);
  });
};

/**
 * Create thumbnail from canvas
 */
export const createThumbnail = (canvas, maxSize = 200) => {
  const thumbnailCanvas = document.createElement('canvas');
  const ctx = thumbnailCanvas.getContext('2d');
  
  const scale = maxSize / Math.max(canvas.width, canvas.height);
  thumbnailCanvas.width = canvas.width * scale;
  thumbnailCanvas.height = canvas.height * scale;
  
  ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
  
  return new Promise((resolve) => {
    thumbnailCanvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.7);
  });
};

/**
 * Upload photo to Firebase Storage
 */
export const uploadPhoto = async (imageBlob, thumbnailBlob, guestName) => {
  const timestamp = Date.now();
  const sanitizedName = guestName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  
  // Upload full image
  const imageRef = ref(storage, `wedding-photos/pending/${filename}.jpg`);
  await uploadBytes(imageRef, imageBlob);
  const imageUrl = await getDownloadURL(imageRef);
  
  // Upload thumbnail
  const thumbnailRef = ref(storage, `wedding-photos/thumbnails/${filename}_thumb.jpg`);
  await uploadBytes(thumbnailRef, thumbnailBlob);
  const thumbnailUrl = await getDownloadURL(thumbnailRef);
  
  return { imageUrl, thumbnailUrl };
};

/**
 * Merge photo with frame overlay
 */
export const mergePhotoWithFrame = (photoCanvas, frameImage, frameType) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on frame type
    if (frameType === 'polaroid') {
      canvas.width = 1080;
      canvas.height = 1350;
    } else {
      canvas.width = 1080;
      canvas.height = 1080;
    }
    
    // Draw photo (centered and scaled)
    const scale = Math.min(canvas.width / photoCanvas.width, canvas.height / photoCanvas.height);
    const x = (canvas.width - photoCanvas.width * scale) / 2;
    const y = (canvas.height - photoCanvas.height * scale) / 2;
    ctx.drawImage(photoCanvas, x, y, photoCanvas.width * scale, photoCanvas.height * scale);
    
    // Draw frame overlay if provided
    if (frameImage) {
      ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
    }
    
    resolve(canvas);
  });
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};
