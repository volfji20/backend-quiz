import admin from '../../firebase';

export default async function handler(req, res) {
  const { categoryName } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!categoryName) {
    return res.status(400).json({ success: false, message: 'Missing categoryName' });
  }

  try {
    const snapshot = await admin.firestore()
      .collection('questions')
      .where('category', '==', categoryName)
      .get();

    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({
      success: true,
      questions: questions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
