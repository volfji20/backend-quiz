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
    console.log("history je:"+JSON.stringify(history))

  const summary = {
    total: history.length,
    avgScore: history.length ? Math.round(history.reduce((acc, q) => acc + (q.score || 0), 0) / history.length) : 0,
    latest: history[0]?.date || null,
  };

  return res.status(200).json({ success: true, quizes: history, data: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
