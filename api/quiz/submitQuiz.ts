import admin from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import { getUserIdFromRequest } from '../../utils/getUserIdFromRequest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const userId = await getUserIdFromRequest(req);

  const { answers, category } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Invalid payload format – answers must be an array' });
  }

  try {
    let correct = 0;
    let incorrect = 0;

    answers.forEach(answer => {
      const correctAns = answer.correctAnswer?.toString().trim();
      const userAns = answer.givenAnswer?.toString().trim();
      if (correctAns === userAns) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const totalQuestions = answers.length;
    const scorePercent = (correct / totalQuestions) * 100;

    // Volitelně – jednoduché hodnocení
    const badge = scorePercent >= 80 ? 'Excellent' :
                  scorePercent >= 50 ? 'Average' : 'Poor';

    const rating = scorePercent >= 80 ? 3 :
                   scorePercent >= 50 ? 2 : 1;

    const id = uuidv4();

    const summary = {
      id,
      answers,
      badge,
      category: category || 'Unknown',
      correctAnswers: correct,
      totalQuestions,
      date: new Date().toISOString(),
      rating,
      userId: userId || null,
    };

    await admin.firestore().collection('quiz').doc(id).set(summary);

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
