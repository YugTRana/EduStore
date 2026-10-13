import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

export async function readUserProfile(uid) {
  const profileSnapshot = await getDoc(doc(db, 'users', uid));
  return profileSnapshot.exists() ? profileSnapshot.data() : null;
}

export async function registerStudent({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email: credential.user.email,
      role: 'student',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (cleanupError) {
      console.error('Could not remove the incomplete account:', cleanupError);
    }
    throw error;
  }

  return credential.user;
}

export function getAuthErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
    'auth/invalid-credential': 'Email or password is incorrect. Check both and try again.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/operation-not-allowed': 'Email and password sign-in is not enabled in Firebase yet.',
    'auth/too-many-requests': 'Too many attempts. Wait a little while, then try again.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'permission-denied': 'Firebase denied this request. Check that Firestore is set up and its rules allow this action.',
    'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and try again.',
  };

  return messages[error?.code] || 'Something went wrong. Please try again.';
}