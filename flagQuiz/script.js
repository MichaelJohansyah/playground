// Country data loaded from JSON file
// Flag URL format: https://flagcdn.com/{code}.svg (from FlagCDN)
let countries = [];

// Statistics storage key
const STATS_KEY = "flagQuizStats";
const LEADERBOARD_KEY = "flagQuizLeaderboard";
const DARK_MODE_KEY = "flagQuizDarkMode";

// Initialize stats structure
function getDefaultStats() {
    return {
        gamesPlayed: 0,
        totalCorrect: 0,
        totalWrong: 0,
        bestStreak: 0,
        currentStreak: 0,
        regions: {},
    };
}

// Load stats from localStorage
function loadStats() {
    const saved = localStorage.getItem(STATS_KEY);
    return saved ? JSON.parse(saved) : getDefaultStats();
}

// Save stats to localStorage
function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Load leaderboard from localStorage
function loadLeaderboard() {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    return saved ? JSON.parse(saved) : { regular: [], endless: [] };
}

// Save leaderboard to localStorage
function saveLeaderboard(leaderboard) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// Continent configuration with icons and colors
// Antarctica and International are hidden from region selection but included in "All"
const continents = {
    All: { icon: "🌍", color: "#667eea", count: 0, showInSelection: true },
    Africa: { icon: "🌍", color: "#f39c12", count: 0, showInSelection: true },
    Asia: { icon: "🌏", color: "#e74c3c", count: 0, showInSelection: true },
    Europe: { icon: "🌍", color: "#3498db", count: 0, showInSelection: true },
    "North America": {
        icon: "🌎",
        color: "#27ae60",
        count: 0,
        showInSelection: true,
    },
    "South America": {
        icon: "🌎",
        color: "#9b59b6",
        count: 0,
        showInSelection: true,
    },
    Oceania: { icon: "🌏", color: "#1abc9c", count: 0, showInSelection: true },
    Antarctica: {
        icon: "🧊",
        color: "#95a5a6",
        count: 0,
        showInSelection: false,
    },
    International: {
        icon: "🏛️",
        color: "#34495e",
        count: 0,
        showInSelection: false,
    },
};

// Question count options
const questionCountOptions = [
    { value: 10, label: "10 Questions", icon: "🎯" },
    { value: 20, label: "20 Questions", icon: "🎯" },
    { value: 30, label: "30 Questions", icon: "🎯" },
    { value: "custom", label: "Custom", icon: "✏️" },
    { value: "all", label: "All Flags", icon: "🌐" },
    { value: "endless", label: "Endless Mode", icon: "♾️" },
];

// Game state
let currentGameMode = "flag-to-name";
let currentContinent = "All";
let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let totalQuestions = 10;
let questionQueue = [];
let answered = false;
let filteredCountries = [];
let isEndlessMode = false;
let endlessLives = 3;
let questionCountSetting = 10;
let currentStreak = 0;

// DOM Elements
const modeSelection = document.getElementById("mode-selection");
const continentSelection = document.getElementById("continent-selection");
const questionSettings = document.getElementById("question-settings");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");
const statsScreen = document.getElementById("stats-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const flagToNameMode = document.getElementById("flag-to-name-mode");
const nameToFlagMode = document.getElementById("name-to-flag-mode");
const nextBtn = document.getElementById("next-btn");

// Load countries from JSON file
async function loadCountries() {
    try {
        const response = await fetch("countries.json");
        const data = await response.json();

        // Add flag URL to each country
        countries = data.map((country) => ({
            ...country,
            flag: `https://flagcdn.com/${country.code}.svg`,
        }));

        // Calculate country counts per continent
        countries.forEach((country) => {
            if (continents[country.continent]) {
                continents[country.continent].count++;
            }
        });
        continents["All"].count = countries.length;

        // Initialize the game
        initContinentButtons();

        // Initialize dark mode from saved preference
        initDarkMode();
    } catch (error) {
        console.error("Failed to load countries:", error);
    }
}

// Initialize continent buttons
function initContinentButtons() {
    const container = document.getElementById("continent-buttons");
    container.innerHTML = "";

    Object.entries(continents).forEach(([name, data]) => {
        // Only show continents marked for selection
        if (!data.showInSelection) return;

        const btn = document.createElement("button");
        btn.className = "continent-btn";
        btn.onclick = () => selectContinent(name);
        btn.innerHTML = `
            <div class="continent-icon">${data.icon}</div>
            <div class="continent-name">${name}</div>
            <div class="continent-count">${data.count} flags</div>
        `;
        btn.style.setProperty("--continent-color", data.color);
        container.appendChild(btn);
    });
}

// Initialize question count buttons
function initQuestionCountButtons() {
    const container = document.getElementById("question-count-buttons");
    container.innerHTML = "";

    questionCountOptions.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "question-count-btn";
        btn.dataset.value = option.value;

        if (option.value === "endless") {
            btn.innerHTML = `
                <div class="qc-icon">${option.icon}</div>
                <div class="qc-label">${option.label}</div>
                <div class="qc-desc">Until 3 wrong answers</div>
            `;
        } else if (option.value === "all") {
            btn.innerHTML = `
                <div class="qc-icon">${option.icon}</div>
                <div class="qc-label">${option.label}</div>
                <div class="qc-desc">${filteredCountries.length} questions</div>
            `;
        } else if (option.value === "custom") {
            btn.innerHTML = `
                <div class="qc-icon">${option.icon}</div>
                <div class="qc-label">${option.label}</div>
                <div class="qc-desc">Enter your own</div>
            `;
        } else {
            btn.innerHTML = `
                <div class="qc-icon">${option.icon}</div>
                <div class="qc-label">${option.label}</div>
            `;
        }

        btn.onclick = () => selectQuestionCount(option.value);
        container.appendChild(btn);
    });
}

// Go to continent selection
function goToContinentSelection(mode) {
    currentGameMode = mode;
    modeSelection.classList.add("hidden");
    continentSelection.classList.remove("hidden");
    initContinentButtons();
}

// Select continent and go to question settings
function selectContinent(continent) {
    currentContinent = continent;

    // Filter countries by continent
    if (continent === "All") {
        filteredCountries = [...countries];
    } else {
        filteredCountries = countries.filter((c) => c.continent === continent);
    }

    if (filteredCountries.length < 4) {
        alert("Not enough countries in this category. Please select another.");
        return;
    }

    // Go to question settings screen
    continentSelection.classList.add("hidden");
    questionSettings.classList.remove("hidden");

    // Update settings display
    document.getElementById("selected-region-display").textContent =
        `${continents[continent].icon} ${continent}`;
    document.getElementById("available-flags-count").textContent =
        filteredCountries.length;

    // Initialize question count buttons
    initQuestionCountButtons();
}

// Select question count
function selectQuestionCount(value) {
    const customInputContainer = document.getElementById(
        "custom-input-container"
    );

    if (value === "custom") {
        customInputContainer.classList.remove("hidden");
        return;
    }

    customInputContainer.classList.add("hidden");

    if (value === "endless") {
        isEndlessMode = true;
        endlessLives = 3;
        totalQuestions = filteredCountries.length;
    } else if (value === "all") {
        isEndlessMode = false;
        totalQuestions = filteredCountries.length;
    } else {
        isEndlessMode = false;
        totalQuestions = Math.min(value, filteredCountries.length);
    }

    questionCountSetting = value;
    startGame();
}

// Confirm custom question count
function confirmCustomCount() {
    const input = document.getElementById("custom-count-input");
    const value = parseInt(input.value);

    if (isNaN(value) || value < 1) {
        alert("Please enter a valid number (minimum 1)");
        return;
    }

    if (value > filteredCountries.length) {
        alert(
            `Maximum questions for this category is ${filteredCountries.length}`
        );
        return;
    }

    isEndlessMode = false;
    totalQuestions = value;
    questionCountSetting = value;
    startGame();
}

// Start the game
function startGame() {
    currentQuestion = 0;
    correctCount = 0;
    wrongCount = 0;
    answered = false;
    currentStreak = 0;

    // Generate question queue
    generateQuestionQueue();

    // Hide settings, show game
    questionSettings.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    // Show/hide lives container based on mode
    const livesContainer = document.getElementById("lives-container");
    if (isEndlessMode) {
        livesContainer.classList.remove("hidden");
        updateLivesDisplay();
    } else {
        livesContainer.classList.add("hidden");
    }

    // Update UI
    updateProgress();
    loadQuestion();
}

// Generate question queue
function generateQuestionQueue() {
    questionQueue = [];
    const shuffledCountries = [...filteredCountries].sort(
        () => Math.random() - 0.5
    );
    const numQuestions = isEndlessMode
        ? filteredCountries.length
        : Math.min(totalQuestions, filteredCountries.length);

    for (let i = 0; i < numQuestions; i++) {
        const correctCountry = shuffledCountries[i];
        const distractors = getRandomDistractors(correctCountry.name);

        questionQueue.push({
            correct: correctCountry,
            options: shuffleArray([correctCountry, ...distractors]),
        });
    }
}

// Get random distractors from filtered countries
function getRandomDistractors(correctName) {
    const otherCountries = filteredCountries.filter(
        (c) => c.name !== correctName
    );

    let pool = otherCountries;
    if (pool.length < 3) {
        pool = countries.filter((c) => c.name !== correctName);
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
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

// Update progress display
function updateProgress() {
    if (isEndlessMode) {
        // For endless mode, show just the current question number
        document.getElementById("current-q").textContent = currentQuestion + 1;
        document.getElementById("total-q").textContent = "∞";
    } else {
        document.getElementById("current-q").textContent = currentQuestion + 1;
        document.getElementById("total-q").textContent = totalQuestions;
    }
    document.getElementById("correct").textContent = correctCount;
    document.getElementById("wrong").textContent = wrongCount;

    const progressBar = document.getElementById("progress-fill");
    if (isEndlessMode) {
        progressBar.style.width = "100%";
    } else {
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Update continent badge
    document.getElementById("current-continent").textContent =
        `${continents[currentContinent].icon} ${currentContinent}`;
}

// Update lives display for endless mode
function updateLivesDisplay() {
    const livesContainer = document.getElementById("lives-container");
    livesContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        const heart = document.createElement("span");
        heart.className = "life-heart";
        heart.textContent = i < endlessLives ? "❤️" : "🖤";
        livesContainer.appendChild(heart);
    }
}

// Load current question
function loadQuestion() {
    answered = false;
    nextBtn.classList.add("hidden");

    const question = questionQueue[currentQuestion];
    const flagToNameMode = document.getElementById("flag-to-name-mode");
    const nameToFlagMode = document.getElementById("name-to-flag-mode");

    if (currentGameMode === "flag-to-name") {
        // Show flag, guess name
        flagToNameMode.classList.remove("hidden");
        nameToFlagMode.classList.add("hidden");

        document.getElementById("question-flag").src = question.correct.flag;

        const optionsContainer = document.getElementById("name-options");
        optionsContainer.innerHTML = "";
        question.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = option.name;
            btn.onclick = () => checkAnswer(option.name, question.correct.name);
            optionsContainer.appendChild(btn);
        });
    } else {
        // Show name, guess flag
        flagToNameMode.classList.add("hidden");
        nameToFlagMode.classList.remove("hidden");

        document.getElementById("country-name-question").textContent =
            question.correct.name;

        const optionsContainer = document.getElementById("flag-options");
        optionsContainer.innerHTML = "";
        question.options.forEach((option) => {
            const btn = document.createElement("button");
            btn.className = "flag-option-btn";
            btn.innerHTML = `<img src="${option.flag}" alt="Flag option">`;
            btn.onclick = () => checkAnswer(option.name, question.correct.name);
            optionsContainer.appendChild(btn);
        });
    }
}

// Check answer
function checkAnswer(selected, correct) {
    if (answered) return;
    answered = true;

    const isCorrect = selected === correct;
    const optionBtns = document.querySelectorAll(
        ".option-btn, .flag-option-btn"
    );

    optionBtns.forEach((btn) => {
        const question = questionQueue[currentQuestion];
        const optionCountry = question.options.find((opt) => {
            if (currentGameMode === "flag-to-name") {
                return opt.name === btn.textContent;
            } else {
                return opt.flag === btn.querySelector("img")?.src;
            }
        });

        if (optionCountry && optionCountry.name === correct) {
            btn.classList.add("correct");
        } else if (
            optionCountry &&
            optionCountry.name === selected &&
            !isCorrect
        ) {
            btn.classList.add("wrong");
        }
        btn.disabled = true;
    });

    if (isCorrect) {
        correctCount++;
        currentStreak++;
        document.getElementById("correct").textContent = correctCount;

        // Update best streak in stats
        const stats = loadStats();
        if (currentStreak > stats.bestStreak) {
            stats.bestStreak = currentStreak;
            saveStats(stats);
        }
    } else {
        wrongCount++;
        currentStreak = 0; // Reset streak on wrong answer
        document.getElementById("wrong").textContent = wrongCount;
        if (isEndlessMode) {
            endlessLives--;
            updateLivesDisplay();

            if (endlessLives <= 0) {
                setTimeout(() => showResults(), 1000);
                return;
            }
        }
    }

    nextBtn.classList.remove("hidden");

    // Auto-advance or show next button
    // In endless mode, always show "Next" unless lives are depleted
    if (!isEndlessMode && currentQuestion + 1 >= questionQueue.length) {
        nextBtn.textContent = "See Results";
        nextBtn.onclick = showResults;
    } else {
        nextBtn.textContent = "Next";
        nextBtn.onclick = nextQuestion;
    }
}

// Go to next question
function nextQuestion() {
    currentQuestion++;

    // For endless mode, generate more questions if running low
    if (isEndlessMode && currentQuestion >= questionQueue.length - 2) {
        addMoreQuestionsToQueue();
    }

    updateProgress();
    loadQuestion();
}

// Add more questions to the queue for endless mode
function addMoreQuestionsToQueue() {
    const shuffledCountries = [...filteredCountries].sort(
        () => Math.random() - 0.5
    );

    for (let i = 0; i < filteredCountries.length; i++) {
        const correctCountry = shuffledCountries[i];
        const distractors = getRandomDistractors(correctCountry.name);

        questionQueue.push({
            correct: correctCountry,
            options: shuffleArray([correctCountry, ...distractors]),
        });
    }
}

// Show results
function showResults() {
    gameScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");

    const totalAnswered = correctCount + wrongCount;
    const percentage = Math.round((correctCount / totalAnswered) * 100) || 0;

    // Update results display
    document.getElementById("final-correct").textContent = correctCount;
    document.getElementById("final-total").textContent = isEndlessMode
        ? totalAnswered
        : totalQuestions;
    document.getElementById("score-percentage").textContent = `${percentage}%`;
    document.getElementById("result-continent").textContent = currentContinent;

    // Update mode display
    if (isEndlessMode) {
        document.getElementById("result-mode").textContent = "Endless Mode";
    } else {
        document.getElementById("result-mode").textContent =
            `${totalQuestions} Questions`;
    }

    let message = "";
    if (isEndlessMode) {
        if (correctCount >= 50) {
            message = "🏆 Incredible! You're a true flag expert!";
        } else if (correctCount >= 30) {
            message = "🌟 Amazing streak! Great knowledge!";
        } else if (correctCount >= 20) {
            message = "👍 Good run! Keep practicing!";
        } else if (correctCount >= 10) {
            message = "📚 Nice try! Study more flags!";
        } else {
            message = "💪 Keep learning! You'll improve!";
        }
    } else {
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
    }
    document.getElementById("score-message").textContent = message;

    // Save stats
    saveGameStats(percentage);

    // Add to leaderboard
    addToLeaderboard(percentage);
}

// Save game statistics
function saveGameStats(percentage) {
    const stats = loadStats();

    stats.gamesPlayed++;
    stats.totalCorrect += correctCount;
    stats.totalWrong += wrongCount;

    // Initialize region stats if needed
    if (!stats.regions[currentContinent]) {
        stats.regions[currentContinent] = {
            gamesPlayed: 0,
            correct: 0,
            wrong: 0,
        };
    }

    stats.regions[currentContinent].gamesPlayed++;
    stats.regions[currentContinent].correct += correctCount;
    stats.regions[currentContinent].wrong += wrongCount;

    saveStats(stats);
}

// Add score to leaderboard
function addToLeaderboard(percentage) {
    const leaderboard = loadLeaderboard();
    const totalAnswered = correctCount + wrongCount;

    const entry = {
        region: currentContinent,
        mode:
            currentGameMode === "flag-to-name" ? "Flag → Name" : "Name → Flag",
        score: correctCount,
        total: isEndlessMode ? totalAnswered : totalQuestions,
        percentage: percentage,
        date: new Date().toLocaleDateString(),
    };

    if (isEndlessMode) {
        leaderboard.endless.push(entry);
        leaderboard.endless.sort((a, b) => b.score - a.score);
        leaderboard.endless = leaderboard.endless.slice(0, 10); // Keep top 10
    } else {
        leaderboard.regular.push(entry);
        leaderboard.regular.sort(
            (a, b) => b.percentage - a.percentage || b.score - a.score
        );
        leaderboard.regular = leaderboard.regular.slice(0, 10); // Keep top 10
    }

    saveLeaderboard(leaderboard);
}

// Go back to menu
function goToMenu() {
    gameScreen.classList.add("hidden");
    resultsScreen.classList.add("hidden");
    continentSelection.classList.add("hidden");
    questionSettings.classList.add("hidden");
    statsScreen.classList.add("hidden");
    leaderboardScreen.classList.add("hidden");
    modeSelection.classList.remove("hidden");
    isEndlessMode = false;
    currentStreak = 0;
}

// Go back to continent selection
function goToContinents() {
    questionSettings.classList.add("hidden");
    continentSelection.classList.remove("hidden");
}

// Go back to question settings
function goToQuestionSettings() {
    gameScreen.classList.add("hidden");
    questionSettings.classList.remove("hidden");
}

// ==================== STATISTICS ====================

// Show statistics screen
function showStats() {
    modeSelection.classList.add("hidden");
    statsScreen.classList.remove("hidden");

    const stats = loadStats();

    // Update overview stats
    document.getElementById("stat-games").textContent = stats.gamesPlayed;
    document.getElementById("stat-correct").textContent = stats.totalCorrect;
    document.getElementById("stat-streak").textContent = stats.bestStreak;

    const totalAnswers = stats.totalCorrect + stats.totalWrong;
    const accuracy =
        totalAnswers > 0
            ? Math.round((stats.totalCorrect / totalAnswers) * 100)
            : 0;
    document.getElementById("stat-accuracy").textContent = `${accuracy}%`;

    // Update region stats
    renderRegionStats(stats);
}

// Render region statistics
function renderRegionStats(stats) {
    const container = document.getElementById("region-stats");
    container.innerHTML = "";

    const regionsToShow = [
        "All",
        "Africa",
        "Asia",
        "Europe",
        "North America",
        "South America",
        "Oceania",
    ];

    regionsToShow.forEach((region) => {
        const regionData = stats.regions[region] || {
            correct: 0,
            wrong: 0,
            gamesPlayed: 0,
        };
        const total = regionData.correct + regionData.wrong;
        const accuracy =
            total > 0 ? Math.round((regionData.correct / total) * 100) : 0;

        const row = document.createElement("div");
        row.className = "region-stat-row";
        row.innerHTML = `
            <span class="region-stat-name">${continents[region]?.icon || "🌍"} ${region}</span>
            <div class="region-stat-bar">
                <div class="region-stat-fill" style="width: ${accuracy}%"></div>
            </div>
            <span class="region-stat-value">${accuracy}%</span>
        `;
        container.appendChild(row);
    });
}

// Confirm reset stats
function confirmResetStats() {
    if (
        confirm(
            "Are you sure you want to reset all your statistics? This cannot be undone."
        )
    ) {
        localStorage.removeItem(STATS_KEY);
        localStorage.removeItem(LEADERBOARD_KEY);
        showStats(); // Refresh the display
    }
}

// ==================== LEADERBOARD ====================

let currentLeaderboardTab = "regular";

// Show leaderboard screen
function showLeaderboard() {
    modeSelection.classList.add("hidden");
    leaderboardScreen.classList.remove("hidden");

    // Reset active tab button
    document.querySelectorAll(".tab-btn").forEach((btn, index) => {
        btn.classList.toggle("active", index === 0);
    });
    currentLeaderboardTab = "regular";

    renderLeaderboard();
}

// Switch leaderboard tab
function switchLeaderboardTab(tab) {
    currentLeaderboardTab = tab;

    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        const isActive =
            (tab === "regular" && btn.textContent.includes("Regular")) ||
            (tab === "endless" && btn.textContent.includes("Endless"));
        btn.classList.toggle("active", isActive);
    });

    renderLeaderboard();
}

// Render leaderboard entries
function renderLeaderboard() {
    const container = document.getElementById("leaderboard-container");
    const leaderboard = loadLeaderboard();

    const entries =
        currentLeaderboardTab === "endless"
            ? leaderboard.endless
            : leaderboard.regular;

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-empty">
                <p>🏆 No scores yet!</p>
                <p>Play some games to see your best scores here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    entries.forEach((entry, index) => {
        const rankClass =
            index === 0
                ? "gold"
                : index === 1
                  ? "silver"
                  : index === 2
                    ? "bronze"
                    : "";
        const rankEmoji =
            index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : index === 2
                    ? "🥉"
                    : `#${index + 1}`;

        const div = document.createElement("div");
        div.className = "leaderboard-entry";
        div.innerHTML = `
            <span class="leaderboard-rank ${rankClass}">${rankEmoji}</span>
            <div class="leaderboard-info">
                <div class="leaderboard-region">${entry.region}</div>
                <div class="leaderboard-details">${entry.mode} • ${entry.date}</div>
            </div>
            <span class="leaderboard-score">${currentLeaderboardTab === "endless" ? entry.score : `${entry.percentage}%`}</span>
        `;
        container.appendChild(div);
    });
}

// ==================== DARK MODE ====================

// Initialize dark mode from saved preference
function initDarkMode() {
    const darkMode = localStorage.getItem(DARK_MODE_KEY) === "true";
    if (darkMode) {
        document.body.classList.add("dark-mode");
        document.getElementById("dark-mode-toggle").textContent = "☀️";
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");

    localStorage.setItem(DARK_MODE_KEY, isDarkMode);
    document.getElementById("dark-mode-toggle").textContent = isDarkMode
        ? "☀️"
        : "🌙";
}

// Initialize the game on page load
document.addEventListener("DOMContentLoaded", loadCountries);
