class MatchingPairGame {
    constructor() {
        this.gridSize = 4;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isProcessing = false;

        // Emoji symbols for the cards
        this.symbols = [
            "🐶",
            "🐱",
            "🐭",
            "🐹",
            "🐰",
            "🦊",
            "🐻",
            "🐼",
            "🐨",
            "🐯",
            "🦁",
            "🐮",
            "🐷",
            "🐸",
            "🐵",
            "🐔",
            "🦄",
            "🐝",
            "🐞",
            "🦋",
            "🐙",
            "🐠",
            "🐡",
            "🐢",
            "🍎",
            "🍊",
            "🍋",
            "🍌",
            "🍇",
            "🍓",
            "🍒",
            "🍑",
            "⚽",
            "🏀",
            "🏈",
            "⚾",
            "🎾",
            "🏐",
            "🏓",
            "🎱",
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.updateGridSize();
        this.startNewGame();
    }

    updateGridSize() {
        const select = document.getElementById("gridSize");
        this.gridSize = parseInt(select.value);

        // Calculate total cards and pairs based on grid size
        let totalCards, rows, cols;

        if (this.gridSize === 1) {
            // 2x2 grid (4 cards)
            rows = 2;
            cols = 2;
            totalCards = 4;
        } else if (this.gridSize === 2) {
            // 2x4 grid (8 cards)
            rows = 2;
            cols = 4;
            totalCards = 8;
        } else {
            // Square grids (4x4, 6x6)
            rows = this.gridSize;
            cols = this.gridSize;
            totalCards = this.gridSize * this.gridSize;
        }

        this.rows = rows;
        this.cols = cols;
        this.totalCards = totalCards;

        document.getElementById("totalPairs").textContent = totalCards / 2;
    }

    startNewGame() {
        this.updateGridSize();
        this.resetGameState();
        this.createCards();
        this.renderBoard();
        this.startTimer();
    }

    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isProcessing = false;

        document.getElementById("moveCount").textContent = "0";
        document.getElementById("pairCount").textContent = "0";
        document.getElementById("winMessage").style.display = "none";

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    createCards() {
        const pairCount = this.totalCards / 2;

        // Select random symbols for this game
        const gameSymbols = this.symbols.slice(0, pairCount);

        // Create pairs
        const cardValues = [...gameSymbols, ...gameSymbols];

        // Shuffle the cards
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }

        // Create card objects
        this.cards = cardValues.map((symbol, index) => ({
            id: index,
            symbol: symbol,
            isFlipped: false,
            isMatched: false,
        }));
    }

    renderBoard() {
        const board = document.getElementById("gameBoard");
        board.innerHTML = "";

        // Set grid class based on grid size
        if (this.gridSize === 1) {
            board.className = "game-board grid-2x2";
        } else if (this.gridSize === 2) {
            board.className = "game-board grid-2x4";
        } else {
            board.className = `game-board grid-${this.gridSize}x${this.gridSize}`;
        }

        this.cards.forEach((card) => {
            const cardElement = document.createElement("div");
            cardElement.className = "card";
            cardElement.dataset.cardId = card.id;
            cardElement.onclick = () => this.flipCard(card.id);

            cardElement.innerHTML = `
                <div class="card-back">?</div>
                <div class="card-front">${card.symbol}</div>
            `;

            board.appendChild(cardElement);
        });
    }

    flipCard(cardId) {
        if (this.isProcessing) return;

        const card = this.cards[cardId];
        const cardElement = document.querySelector(
            `[data-card-id="${cardId}"]`
        );

        if (card.isFlipped || card.isMatched) return;
        if (this.flippedCards.length >= 2) return;

        // Flip the card
        card.isFlipped = true;
        cardElement.classList.add("flipped");
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById("moveCount").textContent = this.moves;
            this.checkForMatch();
        }
    }

    checkForMatch() {
        this.isProcessing = true;
        const [card1, card2] = this.flippedCards;

        setTimeout(() => {
            if (card1.symbol === card2.symbol) {
                // Match found
                this.handleMatch(card1, card2);
            } else {
                // No match
                this.handleNoMatch(card1, card2);
            }

            this.flippedCards = [];
            this.isProcessing = false;
        }, 1000);
    }

    handleMatch(card1, card2) {
        card1.isMatched = true;
        card2.isMatched = true;

        const element1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const element2 = document.querySelector(`[data-card-id="${card2.id}"]`);

        element1.classList.add("matched");
        element2.classList.add("matched");

        this.matchedPairs++;
        document.getElementById("pairCount").textContent = this.matchedPairs;

        if (this.matchedPairs === this.totalCards / 2) {
            this.gameWon();
        }
    }

    handleNoMatch(card1, card2) {
        card1.isFlipped = false;
        card2.isFlipped = false;

        const element1 = document.querySelector(`[data-card-id="${card1.id}"]`);
        const element2 = document.querySelector(`[data-card-id="${card2.id}"]`);

        element1.classList.remove("flipped");
        element2.classList.remove("flipped");
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60)
                .toString()
                .padStart(2, "0");
            const seconds = (elapsed % 60).toString().padStart(2, "0");
            document.getElementById(
                "timer"
            ).textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    gameWon() {
        clearInterval(this.timerInterval);
        const winMessage = document.getElementById("winMessage");
        const finalTime = document.getElementById("timer").textContent;
        winMessage.innerHTML = `🎉 Congratulations! 🎉<br>You won in ${this.moves} moves and ${finalTime}!`;
        winMessage.style.display = "block";
    }
}

// Initialize the game
let game;

function startNewGame() {
    if (game) {
        game.startNewGame();
    } else {
        game = new MatchingPairGame();
    }
}

// Initialize when page loads
window.addEventListener("load", () => {
    game = new MatchingPairGame();

    // Add event listener for grid size changes
    document.getElementById("gridSize").addEventListener("change", () => {
        game.startNewGame();
    });
});
