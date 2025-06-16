import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const userId = await getUserIdFromRequest(req);

  try {
    const snapshot = await admin
      .firestore()
      .collection('quiz')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("history je:"+history)

    return res.status(200).json({ success: true, history });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
