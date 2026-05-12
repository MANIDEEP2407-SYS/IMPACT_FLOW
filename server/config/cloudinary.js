import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

export function configureCloudinary() {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured');
}

const ALLOWED_FORMATS = ['pdf', 'png', 'jpg', 'jpeg', 'zip', 'js', 'py', 'java', 'cpp', 'txt'];

function makeUpload(folder) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
      folder: `impactflow/${folder}`,
      resource_type: 'auto',
      allowed_formats: ALLOWED_FORMATS,
    },
  });
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
}

export const uploadTasks = makeUpload('tasks');
export const uploadSubmissions = makeUpload('submissions');

export default cloudinary.v2;
