document.addEventListener('DOMContentLoaded', function () {
    const quizForm = document.getElementById('quiz-form');
    const skipButton = document.getElementById('skip-btn');
    let countdownInterval;
    let questions = [];

    // Fetch questions from JSON
    fetch('assets/data/questions.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load questions');
            return response.json();
        })
        .then(data => {
            questions = data;
            generateQuizForm(questions);
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            quizForm.innerHTML = `<p class="error">Failed to load quiz questions. Please try again later.</p>`;
        });

    // Generate quiz form
    function generateQuizForm(questions) {
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('question');

            const questionText = document.createElement('p');
            questionText.textContent = `${index + 1}. ${question.question}`;
            questionDiv.appendChild(questionText);

            question.options.forEach((option, optionIndex) => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `q${index + 1}`;
                input.value = String.fromCharCode(97 + optionIndex); // a, b, c, d
                label.appendChild(input);
                label.appendChild(document.createTextNode(` (${String.fromCharCode(97 + optionIndex)}) ${option}`));
                questionDiv.appendChild(label);
            });

            quizForm.appendChild(questionDiv);
        });

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.id = 'submit-btn';
        submitButton.textContent = 'Submit';
        quizForm.appendChild(submitButton);
    }

    // Evaluate quiz on submit
    quizForm.addEventListener('submit', function (event) {
        event.preventDefault();
        evaluateQuiz(questions);
    });

    function evaluateQuiz(questions) {
        let score = 0;
        const totalQuestions = questions.length;

        questions.forEach((question, index) => {
            const selected = document.querySelector(`input[name="q${index + 1}"]:checked`);
            const correctAnswer = question.correctAnswer.toLowerCase();

            const correctInput = document.querySelector(`input[name="q${index + 1}"][value="${correctAnswer}"]`);
            if (correctInput) {
                correctInput.parentElement.classList.add('correct');
            }

            if (selected && selected.value !== correctAnswer) {
                selected.parentElement.classList.add('wrong');
            }

            if (selected && selected.value === correctAnswer) {
                score++;
            }
        });

        const percentageCorrect = ((score / totalQuestions) * 100).toFixed(2);
        const percentageWrong = (100 - percentageCorrect).toFixed(2);

        localStorage.setItem('score', score);
        localStorage.setItem('totalQuestions', totalQuestions);
        localStorage.setItem('percentageCorrect', percentageCorrect);
        localStorage.setItem('percentageWrong', percentageWrong);

        skipButton.style.display = 'block';

        let countdown = 59;
        const countdownElement = document.createElement('div');
        countdownElement.id = 'countdown';
        countdownElement.classList.add('countdown');
        countdownElement.textContent = `Redirecting to results in ${countdown} seconds...`;
        quizForm.appendChild(countdownElement);

        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = `Redirecting to results in ${countdown} seconds...`;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = 'results.html';
            }
        }, 1000);
    }

    // Skip button redirect
    skipButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        window.location.href = 'results.html';
    });
});
