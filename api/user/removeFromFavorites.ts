import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const userId = await getUserIdFromRequest(req);
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Missing questionId' });
    }

    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const favorites = userDoc.data().favorites || [];

    const itemToRemove = favorites.find((item) => item.questionId === questionId);

    if (!itemToRemove) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    await userRef.update({
      favorites: admin.firestore.FieldValue.arrayRemove(itemToRemove)
    });

    return res.status(200).json({ success: true, message: 'Otázka byla odebrána z oblíbených' });
  } catch (error) {
    console.error('Remove favorite error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}