import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const userId = await getUserIdFromRequest(req);

    const favSnap = await admin
      .firestore()
      .collection('favorites')
      .doc(userId)
      .collection('items')
      .get();

    const favoritesRaw = favSnap.docs.map(doc => doc.data());

    if (favoritesRaw.length === 0) {
      return res.status(200).json({ success: true, favorites: [] });
    }

    const questionSnapshots = await Promise.all(
      favoritesRaw.map(fav =>
        admin.firestore().collection('questions').doc(fav.questionId).get()
      )
    );

    const flatQuestions = questionSnapshots
      .map((doc, index) => {
        if (!doc.exists) return null;

        const data = doc.data();
        const meta = favoritesRaw[index];

        return {
          id: doc.id,
          ...data,
          createdAt: meta.createdAt,
          categoryName: meta.categoryName || data.category || 'Neznámá kategorie',
        };
      })
      .filter(Boolean);

    // ➕ Skupinování podle kategorie
    const grouped = {};

    flatQuestions.forEach(q => {
      const cat = q.categoryName;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(q);
    });

    const groupedArray = Object.keys(grouped).map(category => ({
      categoryName: category,
      questions: grouped[category],
    }));

    return res.status(200).json({ success: true, favorites: groupedArray });
  } catch (error) {
    console.error('Favorites error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
