document.addEventListener("DOMContentLoaded", () => {
  const chapterSelect = document.getElementById("chapter-select");
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const quizForm = document.getElementById("quiz-form");
  const skipBtn = document.getElementById("skip-btn");
  const interactiveFeedbackCheckbox = document.getElementById(
    "interactive-feedback"
  );
  const showInsightsCheckbox = document.getElementById("show-insights");

  // List of chapters
  const chapters = [
    { name: "Chapter 1", file: "chapter_one.json" },
    { name: "Exam sample quiz v19", file: "imc_sample_quiz_v19.json" },
    { name: "Exam sample quiz v18", file: "imc_sample_quiz_v18.json" },
    { name: "Mock Exam 1 (v20_dec_2022)", file: "v20_dec_2022.json" },
    { name: "Mock Exam 1 (v22)", file: "v_22_unit1_exam1.json" },
    { name: "Mock Exam 2 (v22)", file: "v_22_unit1_exam2.json" },
  ];

  // Populate chapter dropdown
  chapters.forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter.file;
    option.textContent = chapter.name;
    chapterSelect.appendChild(option);
  });

  // Enable/disable Start Quiz button
  chapterSelect.addEventListener("change", () => {
    startQuizBtn.disabled = !chapterSelect.value;
  });

  // Start quiz
  startQuizBtn.addEventListener("click", () => {
    const selectedChapter = chapterSelect.value;
    if (selectedChapter) {
      loadQuiz(selectedChapter);
      quizForm.style.display = "block";
      chapterSelect.parentElement.style.display = "none";
      document.getElementById("settings-section").style.display = "none";
      skipBtn.style.display = "block";
      // Apply show-insights class based on checkbox state
      quizForm.classList.toggle("show-insights", showInsightsCheckbox.checked);
    }
  });

  // Load quiz questions
  async function loadQuiz(chapterFile) {
    try {
      quizForm.innerHTML = '<p class="loading">Loading quiz...</p>';
      const response = await fetch(`assets/data/imc_dataset/${chapterFile}`);
      if (!response.ok) throw new Error("Failed to load quiz data");
      const questions = await response.json();

      quizForm.innerHTML = ""; // Clear loading message
      questions.forEach((q, index) => {
        // Validate question data
        if (!q.id || !q.question || !q.options || !q.correctAnswer) {
          console.warn(`Invalid question data at index ${index}:`, q);
          return; // Skip invalid questions
        }

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
                <span class="insight">${
                  q.insight || "No insight available"
                }</span>
              </label>
            `
            )
            .join("")}
        `;
        quizForm.appendChild(questionDiv);

        // Interactive feedback
        const radios = questionDiv.querySelectorAll(`input[name="q${q.id}"]`);
        radios.forEach((radio) => {
          radio.addEventListener("change", () => {
            if (interactiveFeedbackCheckbox.checked) {
              const labels = questionDiv.querySelectorAll("label");
              labels.forEach((label) => {
                const radioInput = label.querySelector("input");
                if (radioInput.checked) {
                  label.classList.add(
                    radioInput.value === q.correctAnswer ? "correct" : "wrong"
                  );
                }
                if (radioInput.value === q.correctAnswer) {
                  label.classList.add("correct");
                }
              });
              // Disable radios after selection
              radios.forEach((r) => (r.disabled = true));
            }
          });
        });
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

        localStorage.setItem("quizAnswers", JSON.stringify(answers));
        localStorage.setItem("quizQuestions", JSON.stringify(questions));
        window.location.href = "results.html";
      });

      // Update insights visibility
      updateInsightsVisibility();
    } catch (error) {
      console.error("Error loading questions:", error);
      quizForm.innerHTML = `<p class="error-message">Failed to load quiz: ${error.message}. Please try again.</p>`;
    }
  }

  // Update insights visibility
  function updateInsightsVisibility() {
    quizForm.classList.toggle("show-insights", showInsightsCheckbox.checked);
  }

  // Handle dynamic insights toggle
  showInsightsCheckbox.addEventListener("change", () => {
    updateInsightsVisibility();
  });

  // Handle dynamic interactive feedback toggle
  interactiveFeedbackCheckbox.addEventListener("change", () => {
    // If disabling feedback, optionally reset styles (if desired)
    if (!interactiveFeedbackCheckbox.checked) {
      document.querySelectorAll(".correct, .wrong").forEach((label) => {
        label.classList.remove("correct", "wrong");
      });
      document.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.disabled = false; // Re-enable radios if feedback is toggled off
      });
    }
  });

  // Handle skip button
  skipBtn.addEventListener("click", () => {
    window.location.href = "results.html";
  });
});
