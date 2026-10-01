import image1 from '../assets/image1.png';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/authBg.png';
import image4 from '../assets/image4.png';
import image5 from '../assets/image5.png';
import image6 from '../assets/image6.jpeg';
import image7 from '../assets/image7.jpeg';
import aiGif from '../assets/ai.gif';

const presetMap = {
  'image1.png': image1,
  'image2.jpg': image2,
  'authBg.png': image3,
  'image3': image3,
  'image4.png': image4,
  'image5.png': image5,
  'image6.jpeg': image6,
  'image7.jpeg': image7,
  'ai.gif': aiGif
};

/**
 * Resolves an avatar source string to either an imported bundled asset,
 * a valid external URL, or a fallback gif.
 */
export const resolveAvatar = (src) => {
  if (!src) return aiGif;
  if (typeof src !== 'string') return src;

  // If already an imported asset or full external / base64 / blob URL
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }

  // Check preset keywords
  for (const [key, value] of Object.entries(presetMap)) {
    if (src.includes(key)) {
      return value;
    }
  }

  // If Cloudinary / CDN / external URL
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If referencing a legacy dev path
  if (src.includes('/src/assets/')) {
    return image3;
  }

  return src || aiGif;
};

export default resolveAvatar;
