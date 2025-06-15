import admin from '../../firebase'; // uprav dle své struktury
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest'; // ověření uživatele z tokenu

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

    const favRef = admin
      .firestore()
      .collection('favorites')
      .doc(userId)
      .collection('items')
      .doc(questionId);

    const doc = await favRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    await favRef.delete();

    return res.status(200).json({ success: true, message: 'Otázka byla odebrána z oblíbených' });
  } catch (error) {
    console.error('Remove favorite error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}