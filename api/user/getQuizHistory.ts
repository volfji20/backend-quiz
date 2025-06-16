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

    const history = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        category: data.category || 'Unknown',
        correctAnswerCount: data.correctAnswers || 0,
        incorrectAnswerCount: data.totalQuestions - data.correctAnswers || 0,
        totalQuestions: data.totalQuestions || 0,
        rating: data.rating || 0,
        questions: data.answers || [],
        date: typeof data.date === 'string'
          ? data.date
          : data.date?.toDate?.().toISOString() || new Date().toISOString(),
      };
    });

    // 🔢 Vytvoření souhrnu pro PerformanceIndicator
    const totalQuizes = history.length;

    let totalCorrect = 0;
    let totalQuestions = 0;

    history.forEach(q => {
      totalCorrect += q.correctAnswerCount;
      totalQuestions += q.totalQuestions;
    });

    const successRate = totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0;

    const badge =
      successRate >= 80 ? 'Excellent' :
      successRate >= 50 ? 'Average' :
      'Poor';

    const summary = {
      badge,
      totalQuizes,
      successRate,
    };

    return res.status(200).json({ success: true, quizes: history, data: summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
