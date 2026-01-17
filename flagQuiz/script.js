// Country data with flags
const countries = [
    { name: "Indonesia", flag: "flagImages/Flag_of_Indonesia.svg" },
    { name: "Argentina", flag: "flagImages/Flag_of_Argentina.svg" },
    { name: "Australia", flag: "flagImages/Flag_of_Australia.svg" },
    { name: "Brazil", flag: "flagImages/Flag_of_Brazil.svg" },
    { name: "England", flag: "flagImages/Flag_of_England.svg" },
    { name: "India", flag: "flagImages/Flag_of_India.svg" },
    { name: "Japan", flag: "flagImages/Flag_of_Japan.svg" },
    { name: "Malaysia", flag: "flagImages/Flag_of_Malaysia.svg" },
    { name: "Netherlands", flag: "flagImages/Flag_of_Netherlands.svg" },
    { name: "Palestine", flag: "flagImages/Flag_of_Palestine.svg" },
    { name: "China", flag: "flagImages/Flag_of_Peoples_Republic_of_China.svg" },
    { name: "Portugal", flag: "flagImages/Flag_of_Portugal.svg" },
    { name: "Singapore", flag: "flagImages/Flag_of_Singapore.svg" },
    { name: "South Korea", flag: "flagImages/Flag_of_South_Korea.svg" },
    { name: "Spain", flag: "flagImages/Flag_of_Spain.svg" },
    { name: "Thailand", flag: "flagImages/Flag_of_Thailand.svg" },
    { name: "Turkey", flag: "flagImages/Flag_of_Turkey.svg" },
    { name: "United States", flag: "flagImages/Flag_of_United_States.svg" },
    { name: "Vietnam", flag: "flagImages/Flag_of_Vietnam.svg" },
];

// Similar flags groupings for harder difficulty
// These are groups of countries with similar-looking flags
const similarFlagGroups = [
    ["Indonesia", "Netherlands", "Thailand", "Singapore"], // Red & white themes
    ["India", "Spain", "Portugal"], // Horizontal stripes with emblems
    ["Malaysia", "United States"], // Stripes with canton
    ["China", "Vietnam", "Turkey"], // Red background with symbols
    ["Japan", "South Korea", "Indonesia"], // Simple designs with circles/emblems
    ["Palestine", "Netherlands", "Indonesia"], // Similar color schemes
    ["Argentina", "Australia"], // Blue and white themes
];

/*
 * HOW TO ADD MORE FLAGS:
 *
 * 1. Download flag SVG files and place them in the flagImages folder
 *    - Naming convention: Flag_of_[CountryName].svg
 *    - Good sources: Wikipedia, Flagpedia.net, or other royalty-free sources
 *
 * 2. Add the country to the 'countries' array above:
 *    { name: "Country Name", flag: "flagImages/Flag_of_Country_Name.svg" }
 *
 * 3. Optionally, add the country to 'similarFlagGroups' to create harder questions:
 *    - Group countries with similar-looking flags together
 *    - This makes the "Similar Flags" difficulty more challenging
 *
 * CUSTOM QUESTION SETS (JSON Format):
 * You can also create custom question sets for specific challenges.
 * See the 'customQuestionSets' object below for examples.
 */

// Custom question sets for specific themes (optional - for future expansion)
const customQuestionSets = {
    // Example: Asian flags challenge
    asian: [
        {
            correct: "Japan",
            distractors: ["South Korea", "China", "Indonesia"],
        },
        { correct: "China", distractors: ["Vietnam", "Turkey", "Japan"] },
        {
            correct: "South Korea",
            distractors: ["Japan", "Malaysia", "Thailand"],
        },
        {
            correct: "Indonesia",
            distractors: ["Singapore", "Malaysia", "Thailand"],
        },
        { correct: "Vietnam", distractors: ["China", "Turkey", "Japan"] },
    ],
    // Example: European flags challenge
    european: [
        {
            correct: "Netherlands",
            distractors: ["Indonesia", "Thailand", "Singapore"],
        },
        { correct: "Spain", distractors: ["Portugal", "India", "Argentina"] },
        { correct: "Portugal", distractors: ["Spain", "Brazil", "India"] },
        { correct: "England", distractors: ["Australia", "Japan", "Turkey"] },
    ],
    // You can add more custom sets here
};

// Game state
let currentGameMode = "flag-to-name";
let currentDifficulty = "random";
let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let totalQuestions = 10;
let questionQueue = [];
let answered = false;

// DOM Elements
const modeSelection = document.getElementById("mode-selection");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");
const flagToNameMode = document.getElementById("flag-to-name-mode");
const nameToFlagMode = document.getElementById("name-to-flag-mode");
const nextBtn = document.getElementById("next-btn");

// Initialize difficulty buttons
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    document
        .querySelectorAll(".diff-btn")
        .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");
}

// Start the game with selected mode
function startGame(mode) {
    currentGameMode = mode;
    currentQuestion = 0;
    correctCount = 0;
    wrongCount = 0;
    answered = false;

    // Generate question queue
    generateQuestionQueue();

    // Switch screens
    modeSelection.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    // Show appropriate mode
    if (mode === "flag-to-name") {
        flagToNameMode.classList.remove("hidden");
        nameToFlagMode.classList.add("hidden");
    } else {
        flagToNameMode.classList.add("hidden");
        nameToFlagMode.classList.remove("hidden");
    }

    // Update UI
    updateProgress();
    loadQuestion();
}

// Generate question queue based on difficulty
function generateQuestionQueue() {
    questionQueue = [];
    const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);
    const numQuestions = Math.min(totalQuestions, countries.length);

    for (let i = 0; i < numQuestions; i++) {
        const correctCountry = shuffledCountries[i];
        let distractors;

        if (currentDifficulty === "similar") {
            distractors = getSimilarDistractors(correctCountry.name);
        } else {
            distractors = getRandomDistractors(correctCountry.name);
        }

        questionQueue.push({
            correct: correctCountry,
            options: shuffleArray([correctCountry, ...distractors]),
        });
    }
}

// Get random distractors (wrong answers)
function getRandomDistractors(correctName) {
    const otherCountries = countries.filter((c) => c.name !== correctName);
    const shuffled = [...otherCountries].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}

// Get similar-looking flag distractors for harder difficulty
function getSimilarDistractors(correctName) {
    // Find which group this country belongs to
    let similarCountries = [];

    for (const group of similarFlagGroups) {
        if (group.includes(correctName)) {
            similarCountries = [
                ...similarCountries,
                ...group.filter((c) => c !== correctName),
            ];
        }
    }

    // Remove duplicates
    similarCountries = [...new Set(similarCountries)];

    // Convert names to country objects
    let distractors = similarCountries
        .map((name) => countries.find((c) => c.name === name))
        .filter((c) => c !== undefined);

    // If we don't have enough similar flags, fill with random ones
    if (distractors.length < 3) {
        const needed = 3 - distractors.length;
        const usedNames = [correctName, ...distractors.map((d) => d.name)];
        const others = countries.filter((c) => !usedNames.includes(c.name));
        const randomOthers = [...others]
            .sort(() => Math.random() - 0.5)
            .slice(0, needed);
        distractors = [...distractors, ...randomOthers];
    }

    // Shuffle and take 3
    return shuffleArray(distractors).slice(0, 3);
}

// Shuffle array helper
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Load current question
function loadQuestion() {
    answered = false;
    nextBtn.classList.add("hidden");

    const question = questionQueue[currentQuestion];

    if (currentGameMode === "flag-to-name") {
        loadFlagToNameQuestion(question);
    } else {
        loadNameToFlagQuestion(question);
    }
}

// Load Flag → Name question
function loadFlagToNameQuestion(question) {
    const flagImg = document.getElementById("question-flag");
    flagImg.src = question.correct.flag;
    flagImg.alt = "Country Flag";

    const optionsContainer = document.getElementById("name-options");
    optionsContainer.innerHTML = "";

    question.options.forEach((country) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = country.name;
        btn.onclick = () =>
            checkAnswer(
                btn,
                country.name === question.correct.name,
                question.correct.name
            );
        optionsContainer.appendChild(btn);
    });
}

// Load Name → Flag question
function loadNameToFlagQuestion(question) {
    document.getElementById("country-name-question").textContent =
        question.correct.name;

    const optionsContainer = document.getElementById("flag-options");
    optionsContainer.innerHTML = "";

    question.options.forEach((country) => {
        const btn = document.createElement("button");
        btn.className = "flag-option-btn";

        const img = document.createElement("img");
        img.src = country.flag;
        img.alt = "Flag option";
        btn.appendChild(img);

        btn.onclick = () =>
            checkFlagAnswer(
                btn,
                country.name === question.correct.name,
                question.correct.flag
            );
        optionsContainer.appendChild(btn);
    });
}

// Check answer for text options
function checkAnswer(clickedBtn, isCorrect, correctName) {
    if (answered) return;
    answered = true;

    // Disable all buttons
    document.querySelectorAll(".option-btn").forEach((btn) => {
        btn.classList.add("disabled");
        if (btn.textContent === correctName) {
            btn.classList.add("correct");
        }
    });

    if (isCorrect) {
        clickedBtn.classList.add("correct");
        correctCount++;
    } else {
        clickedBtn.classList.add("wrong");
        wrongCount++;
    }

    updateProgress();
    showNextButton();
}

// Check answer for flag options
function checkFlagAnswer(clickedBtn, isCorrect, correctFlag) {
    if (answered) return;
    answered = true;

    // Disable all buttons and show correct answer
    document.querySelectorAll(".flag-option-btn").forEach((btn) => {
        btn.classList.add("disabled");
        const img = btn.querySelector("img");
        if (img && img.src.includes(correctFlag.replace("flagImages/", ""))) {
            btn.classList.add("correct");
        }
    });

    if (isCorrect) {
        clickedBtn.classList.add("correct");
        correctCount++;
    } else {
        clickedBtn.classList.add("wrong");
        wrongCount++;
    }

    updateProgress();
    showNextButton();
}

// Show next button or go to results
function showNextButton() {
    if (currentQuestion < questionQueue.length - 1) {
        nextBtn.classList.remove("hidden");
    } else {
        // Wait a moment then show results
        setTimeout(showResults, 1000);
    }
}

// Go to next question
function nextQuestion() {
    currentQuestion++;
    updateProgress();
    loadQuestion();
}

// Update progress display
function updateProgress() {
    document.getElementById("correct").textContent = correctCount;
    document.getElementById("wrong").textContent = wrongCount;
    document.getElementById("current-q").textContent = currentQuestion + 1;
    document.getElementById("total-q").textContent = questionQueue.length;

    const progressPercent = (currentQuestion / questionQueue.length) * 100;
    document.getElementById("progress-fill").style.width =
        `${progressPercent}%`;
}

// Show results screen
function showResults() {
    gameScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");

    const total = questionQueue.length;
    const percentage = Math.round((correctCount / total) * 100);

    document.getElementById("final-correct").textContent = correctCount;
    document.getElementById("final-total").textContent = total;
    document.getElementById("score-percentage").textContent = `${percentage}%`;

    // Set message based on score
    let message = "";
    if (percentage === 100) {
        message = "🏆 Perfect! You're a flag master!";
    } else if (percentage >= 80) {
        message = "🌟 Excellent! Great knowledge of flags!";
    } else if (percentage >= 60) {
        message = "👍 Good job! Keep practicing!";
    } else if (percentage >= 40) {
        message = "📚 Not bad! Study more flags!";
    } else {
        message = "💪 Keep learning! You'll improve!";
    }
    document.getElementById("score-message").textContent = message;
}

// Go back to menu
function goToMenu() {
    gameScreen.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    modeSelection.classList.remove("hidden");
}
