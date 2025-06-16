import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const userId = await getUserIdFromRequest(req);
  const { questionId, categoryName } = req.body;

  if (!questionId || !categoryName) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const userRef = admin.firestore().collection('users').doc(userId);

    // Přidání nové položky do pole favorites
    await userRef.update({
      favorites: admin.firestore.FieldValue.arrayUnion({
        questionId,
        categoryName,
        createdAt: new Date().toISOString()
      })
    });

    return res.status(200).json({ success: true, message: 'Otázka přidána do oblíbených' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
