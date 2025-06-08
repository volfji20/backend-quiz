import admin from '../../firebase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const snapshot = await admin.firestore().collection('questions').get();
      const data = snapshot.docs.map(doc => doc.data());
      return res.status(200).json({ success: true, questions: data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}