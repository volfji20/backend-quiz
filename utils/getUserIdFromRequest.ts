import admin from '../firebase';

export const getUserIdFromRequest = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');

  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken.uid;
};