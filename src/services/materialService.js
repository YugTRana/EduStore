import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export function validateMaterialFile(file) {
  if (!file) return 'Choose a file to upload.';
  if (!ALLOWED_FILE_TYPES.has(file.type)) return 'Choose a PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, or WEBP file.';
  if (file.size > MAX_FILE_SIZE) return 'The file must be 10 MB or smaller.';
  return '';
}

function folderSegment(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unsorted';
}

function uploadToCloudinary({ file, teacherId, subjectName, onProgress }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Check the cloud name and upload preset in the project .env file.');
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('asset_folder', `material/${teacherId}/${folderSegment(subjectName)}`);

    const request = new XMLHttpRequest();
    request.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    request.timeout = 120000;
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener('load', () => {
      let response;
      try {
        response = JSON.parse(request.responseText);
      } catch {
        reject(Object.assign(new Error('Cloudinary returned an unreadable response.'), { code: 'cloudinary/invalid-response' }));
        return;
      }

      if (request.status >= 200 && request.status < 300) {
        resolve(response);
      } else {
        reject(Object.assign(new Error(response.error?.message || 'Cloudinary rejected the upload.'), { code: 'cloudinary/upload-failed' }));
      }
    });
    request.addEventListener('error', () => {
      reject(Object.assign(new Error('Could not connect to Cloudinary. Check your internet connection and try again.'), { code: 'cloudinary/network-error' }));
    });
    request.addEventListener('timeout', () => {
      reject(Object.assign(new Error('The Cloudinary upload timed out. Check your connection and try again.'), { code: 'cloudinary/timeout' }));
    });
    request.send(formData);
  });
}

export async function uploadTeacherMaterial({ file, title, subjectName, description, teacherId, teacherName, onProgress }) {
  const validationMessage = validateMaterialFile(file);
  if (validationMessage) throw new Error(validationMessage);

  const cloudinaryFolder = `material/${teacherId}/${folderSegment(subjectName)}`;
  const cloudinaryAsset = await uploadToCloudinary({ file, teacherId, subjectName, onProgress });
  const materialData = {
    title: title.trim(),
    subjectName: subjectName.trim(),
    description: description.trim(),
    fileUrl: cloudinaryAsset.secure_url,
    cloudinaryPublicId: cloudinaryAsset.public_id,
    cloudinaryFolder,
    resourceType: cloudinaryAsset.resource_type,
    fileName: file.name,
    contentType: file.type,
    teacherId,
    teacherName,
    uploadedAt: serverTimestamp(),
  };

  try {
    const materialRef = await addDoc(collection(db, 'material'), materialData);
    return { id: materialRef.id, ...materialData, uploadedAt: new Date() };
  } catch (error) {
    throw new Error(`The file reached Cloudinary, but Firestore could not save its details. Check the Firestore rules. The uploaded file may need to be removed from Cloudinary manually. ${error.message}`, { cause: error });
  }
}

export function subscribeToTeacherMaterials(teacherId, onMaterials, onError) {
  const materialsQuery = query(collection(db, 'material'), where('teacherId', '==', teacherId));

  return onSnapshot(materialsQuery, (snapshot) => {
    const materials = snapshot.docs
      .map((materialDoc) => ({ id: materialDoc.id, ...materialDoc.data() }))
      .sort((first, second) => (second.uploadedAt?.toMillis?.() ?? 0) - (first.uploadedAt?.toMillis?.() ?? 0));
    onMaterials(materials);
  }, onError);
}

export function getMaterialErrorMessage(error) {
  if (error.message && !error.code) return error.message;

  const messages = {
    'cloudinary/upload-failed': 'Cloudinary rejected this file. Check the unsigned preset and its allowed formats in Cloudinary settings.',
    'cloudinary/network-error': 'Could not connect to Cloudinary. Check your internet connection and try again.',
    'cloudinary/timeout': 'The Cloudinary upload timed out. Check your connection and try again.',
    'cloudinary/invalid-response': 'Cloudinary returned an unreadable response. Try again or check the browser console.',
    'permission-denied': 'Firestore rules blocked this action. Check that your users document has role "teacher" and publish the material rules.',
  };

  return messages[error.code] || 'The material could not be saved. Check your Firebase setup and try again.';
}