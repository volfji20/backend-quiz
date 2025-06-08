import admin from '../../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const answers = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ success: false, message: 'Invalid payload format' });
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

    const summary = {
      totalQuestions: answers.length,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      score: Math.round((correct / answers.length) * 100),
      timestamp: Date.now(),
    };

    // Uložení do Firestore
    await admin.firestore().collection('quizHistory').add(summary);

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
