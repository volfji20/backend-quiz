import admin from '../../firebase';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const userId = await getUserIdFromRequest(req);

    const userDoc = await admin.firestore().collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = userDoc.data();
    const incorrectRaw = userData.incorrectAnswers || [];

    if (incorrectRaw.length === 0) {
      return res.status(200).json({ success: true, incorrectAnswers: [] });
    }

    const grouped = {};

    incorrectRaw.forEach(q => {
      const cat = q.category || 'Neznámá kategorie';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        ...q,
        incorrectMeta: {
          chosenAnswer: q.choiceB, // uprav dle struktury, např. q.userChoice
          ...q,
        },
      });
    });

    const groupedArray = Object.keys(grouped).map(category => ({
      categoryName: category,
      questions: grouped[category],
    }));

    return res.status(200).json({ success: true, incorrectAnswers: groupedArray });
  } catch (error) {
    console.error('IncorrectAnswers error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}
