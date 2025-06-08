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
    const favSnap = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('favorites')
      .get();

    const questionRefs = favSnap.docs.map(doc => doc.data().questionId);

    if (questionRefs.length === 0) {
      return res.status(200).json({ success: true, favorites: [] });
    }

    const questionSnapshots = await Promise.all(
      questionRefs.map(id =>
        admin.firestore().collection('questions').doc(id).get()
      )
    );

    const questions = questionSnapshots
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, favorites: questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
