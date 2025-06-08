import admin from '../../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { questionId } = req.query;
  const { userId } = req.query;

  if (!userId || !questionId) {
    return res.status(400).json({ success: false, message: 'Missing userId or questionId' });
  }

  try {
    const ref = admin.firestore()
      .collection('favorites')
      .doc(userId)
      .collection('items')
      .doc(questionId);

    await ref.delete();

    return res.status(200).json({ success: true, message: 'Otázka odstraněna z oblíbených' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
