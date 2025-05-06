document.addEventListener("DOMContentLoaded", () => {
  const chapterSelect = document.getElementById("chapter-select");
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const quizForm = document.getElementById("quiz-form");
  const skipBtn = document.getElementById("skip-btn");

  // List of chapters (update this when adding new chapters)
  const chapters = [
    { name: "Chapter 1", file: "chapter_one.json" },
    { name: "Exam sample quiz v19", file: "imc_sample_quiz_v19.json" },
    { name: "Exam sample quiz v18", file: "imc_sample_quiz_v18.json" },
    { name: "Mock Exam 1 (v20_dec_2022)", file: "v20_dec_2022.json" },
    { name: "Mock Exam 1 (v22)", file: "v_22_unit1_exam1.json" },
    { name: "Mock Exam 2 (v22)", file: "v_22_unit1_exam2.json" },
    // Add more chapters here as needed, e.g., { name: "Chapter 11", file: "chapter_eleven.json" }
  ];

  // Populate chapter dropdown
  chapters.forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter.file;
    option.textContent = chapter.name;
    chapterSelect.appendChild(option);
  });

  // Enable/disable Start Quiz button based on selection
  chapterSelect.addEventListener("change", () => {
    startQuizBtn.disabled = !chapterSelect.value;
  });

  // Start quiz when button is clicked
  startQuizBtn.addEventListener("click", () => {
    const selectedChapter = chapterSelect.value;
    if (selectedChapter) {
      loadQuiz(selectedChapter);
      quizForm.style.display = "block";
      chapterSelect.parentElement.style.display = "none"; // Hide chapter selection
      skipBtn.style.display = "block";
    }
  });

  // Load quiz questions from selected chapter
  function loadQuiz(chapterFile) {
    fetch(`assets/data/imc_dataset/${chapterFile}`)
      .then((response) => response.json())
      .then((questions) => {
        quizForm.innerHTML = ""; // Clear previous questions
        questions.forEach((q, index) => {
          const questionDiv = document.createElement("div");
          questionDiv.classList.add("question");
          questionDiv.innerHTML = `
                        <p>${index + 1}. ${q.question}</p>
                        ${q.options
                          .map(
                            (option, i) => `
                            <label>
                                <input type="radio" name="q${q.id}" value="${option}">
                                ${option}
                            </label>
                        `
                          )
                          .join("")}
                    `;
          quizForm.appendChild(questionDiv);
        });

        // Add submit button
        const submitBtn = document.createElement("button");
        submitBtn.id = "submit-btn";
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Quiz';
        submitBtn.type = "button";
        quizForm.appendChild(submitBtn);

        // Handle quiz submission
        submitBtn.addEventListener("click", () => {
          const answers = {};
          questions.forEach((q) => {
            const selected = document.querySelector(
              `input[name="q${q.id}"]:checked`
            );
            answers[q.id] = selected ? selected.value : null;
          });

          // Store answers and redirect to results
          localStorage.setItem("quizAnswers", JSON.stringify(answers));
          localStorage.setItem("quizQuestions", JSON.stringify(questions));
          window.location.href = "results.html";
        });
      })
      .catch((error) => console.error("Error loading questions:", error));
  }

  // Handle skip button
  skipBtn.addEventListener("click", () => {
    window.location.href = "results.html";
  });
});
