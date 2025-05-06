document.addEventListener("DOMContentLoaded", () => {
  const totalQuestionsEl = document.getElementById("total-questions");
  const correctAnswersEl = document.getElementById("correct-answers");
  const wrongAnswersEl = document.getElementById("wrong-answers");
  const percentageCorrectEl = document.getElementById("percentage-correct");

  // Retrieve questions and answers from localStorage
  const questions = JSON.parse(localStorage.getItem("quizQuestions")) || [];
  const answers = JSON.parse(localStorage.getItem("quizAnswers")) || {};

  // Calculate results
  let correctCount = 0;
  questions.forEach((q) => {
    if (answers[q.id] && answers[q.id] === q.correctAnswer) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const wrongCount = totalQuestions - correctCount;
  const percentageCorrect =
    totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : 0;

  // Update DOM
  totalQuestionsEl.textContent = totalQuestions;
  correctAnswersEl.textContent = correctCount;
  wrongAnswersEl.textContent = wrongCount;
  percentageCorrectEl.textContent = percentageCorrect;
});
