// Retrieve data from localStorage
const score = parseInt(localStorage.getItem('score'));
const totalQuestions = parseInt(localStorage.getItem('totalQuestions'));
const percentageCorrect = parseFloat(localStorage.getItem('percentageCorrect'));
const percentageWrong = parseFloat(localStorage.getItem('percentageWrong'));

// Display the results
document.getElementById('total-questions').textContent = totalQuestions;
document.getElementById('correct-answers').textContent = score;
document.getElementById('wrong-answers').textContent = totalQuestions - score;
document.getElementById('percentage-correct').textContent = percentageCorrect;
document.getElementById('percentage-wrong').textContent = percentageWrong;
