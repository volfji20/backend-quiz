import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const userId = await getUserIdFromRequest(req)

  try {
    const snap = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('incorrectAnswers')
      .get();

    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, incorrectAnswers: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}