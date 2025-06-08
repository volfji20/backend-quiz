import admin from '../../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId, questionId, categoryName } = req.body;

  if (!userId || !questionId || !categoryName) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const ref = admin.firestore()
      .collection('favorites')
      .doc(userId)
      .collection('items')
      .doc(questionId);

    await ref.set({ questionId, categoryName, createdAt: Date.now() });

    return res.status(200).json({ success: true, message: 'Otázka přidána do oblíbených' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
