import admin from '../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing userId' });
  }

  try {
    const snapshot = await admin
      .firestore()
      .collection('quizHistory')
      .doc(userId)
      .collection('items')
      .orderBy('timestamp', 'desc')
      .get();

    const history = snapshot.docs.map(doc => doc.data());

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
