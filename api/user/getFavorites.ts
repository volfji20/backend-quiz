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

    const favoritesRaw = favSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (favoritesRaw.length === 0) {
      return res.status(200).json({ success: true, favorites: [] });
    }

    const questions = await Promise.all(
      favoritesRaw.map(fav =>
        admin.firestore().collection('questions').doc(fav.id).get()
      )
    );
/*
    const questions = questionSnapshots
      .filter(doc => doc.exists)
      .map((doc, index) => {
        const favoriteInfo = favoritesRaw[index]; // přidáme i categoryName a createdAt z favorites
        return {
          id: doc.id,
          ...doc.data(),
          favoriteMeta: {
            categoryName: favoriteInfo.categoryName,
            createdAt: favoriteInfo.createdAt,
          },
        };
      });
*/
    return res.status(200).json({ success: true, favorites: questions });
  } catch (error) {
    console.error('Favorites error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
