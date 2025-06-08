import admin from '../../firebase'; // cesta podle umístění souboru

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex],
    ];
  }
  return array;
}

export default async function handler(req, res) {
  const { categoryName } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!categoryName) {
    return res.status(400).json({ success: false, message: 'Missing categoryName' });
  }

  try {
    const snapshot = await admin.firestore()
      .collection('questions')
      .where('category', '==', categoryName)
      .get();

    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    //choose rigth number for quiz
    const shuffled = shuffle(questions).slice(0, 10);

    return res.status(200).json({
      success: true,
      quizQuestions: shuffled,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
