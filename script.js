/*
    File name: script.js
    App name: 😉Emory
    Author: Marco Cajeao
    Created date: June 19, 2023
    Description: This file contains the JavaScript code for the main functionality of the Emory game,
        which is a memory game of matching pairs of cards. The main objective of the game is to 
        remember the location of the symbols and match them correctly.
*/

const symbols = ['😏', '🤓', '😎', '😝', '🤪', '😉', '🧐', '🤨'];
const totalCards = symbols.length * 2;
let startTime = '';
let selectedCards = [];
let matchedCards = [];
let attempts = 0;
const gameBoard = document.getElementById('game-board');
const feedback = document.getElementById('feedback');
const defaultRankingData = [
    { name: 'Mark', time: 50, errors: 3 },
    { name: 'Brian', time: 60, errors: 6 },
    { name: 'Jenny', time: 70, errors: 7 }
];

// Get ranking data from localStorage
const getRankingFromLocalStorage = () => {
    const rankingData = localStorage.getItem('ranking-emory');
    return rankingData ? JSON.parse(rankingData) : null;
};

// Store ranking data in localStorage
const storeRankingInLocalStorage = (ranking) => {
    localStorage.setItem('ranking-emory', JSON.stringify(ranking));
};

// Create default ranking if it doesn't exist
const createDefaultRanking = (rankingData) => {
    let ranking = getRankingFromLocalStorage() ?? rankingData;
    storeRankingInLocalStorage(ranking);
};

// Create default ranking if it doesn't exist
createDefaultRanking(defaultRankingData);

// Show the ranking table
const showRanking = () => {
    let ranking = getRankingFromLocalStorage();
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    // Sort the ranking table by least time and least errors
    ranking.sort((a, b) => a.time !== b.time ? a.time - b.time : a.errors - b.errors);

    let place = 1;
    ranking.forEach(data => {
        const row = document.createElement('tr');
        const positionCell = document.createElement('td');
        positionCell.textContent = place++;
        row.appendChild(positionCell);

        for (const key in data) {
            const td = document.createElement('td');
            td.textContent = data[key];
            row.appendChild(td);
        }
        tbody.appendChild(row);
    });
};

showRanking();

// Create an array with pairs of symbols
const cardSymbols = symbols.slice(0, totalCards / 2);
const cardPairs = [...cardSymbols, ...cardSymbols];

// Shuffle the cards array
const shuffleCards = (array) => {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

// Render the game on the board
const renderGame = () => {
    gameBoard.innerHTML = '';

    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = cardPairs[i];
        card.dataset.index = i;
        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    }
};

// Handle a card click
const handleCardClick = (event) => {
    const card = event.target;

    if (card.classList.contains('matched') || card.classList.contains('selected')) {
        return;
    }

    if (selectedCards.length < 2) {
        flipCard(card);
        selectedCards.push(card);
    }

    if (selectedCards.length === 2) {
        checkMatch();
    }
};

// Flip a card and show its symbol
const flipCard = (card) => {
    card.classList.add('selected');
    card.innerHTML = card.dataset.symbol;
};

// Check if the two selected cards match
const checkMatch = () => {
    attempts++;

    if (selectedCards[0].dataset.symbol === selectedCards[1].dataset.symbol) {
        matchedCards.push(...selectedCards);
        selectedCards.forEach(card => card.classList.add('matched'));
    } else {
        document.body.classList.add('blocked');
        feedback.innerHTML = 'Incorrect!';
        feedback.classList.add('error');
        feedback.addEventListener('animationend', removeShakeAnimation);
        setTimeout((selectedCards) => {
            selectedCards.forEach(card => {
                flipCard(card);
                card.classList.remove('selected');
                card.innerHTML = '';
            });
            feedback.innerHTML = '';
            selectedCards = [];
            feedback.classList.remove('error');
            document.body.classList.remove('blocked');
        }, 2000, selectedCards);
    }

    if (matchedCards.length === totalCards) {
        endGame();
    }
    selectedCards = [];
};

const newGame = document.getElementById('new-game');
const playerName = document.getElementById('name');

newGame.addEventListener('click', () => {
    checkBeforePlay();
});

playerName.addEventListener('keydown', event => {
    event.key === 'Enter' ? checkBeforePlay() : null;
});

// Check if the player name is valid
const checkBeforePlay = () => {
    if (!playerName.checkValidity()) {
        playerName.classList.add('error');
        playerName.addEventListener('animationend', removeShakeAnimation);
    } else {
        playerName.classList.remove('error');
        selectedCards = [];
        matchedCards = [];
        attempts = 0;
        startTime = new Date().getTime();
        feedback.innerHTML = '';
        shuffleCards(cardPairs);
        renderGame();
        showRanking();
        gameBoard.classList.remove('disabled');
    }
};

// Remove the shake animation on error
const removeShakeAnimation = () => {
    playerName.classList.remove('error');
    playerName.removeEventListener('animationend', removeShakeAnimation);
};

// End the game
const endGame = () => {
    const name = capitalizeText(document.getElementById('name').value);
    const endTime = new Date().getTime();
    const gameTime = Math.round((endTime - startTime) / 1000);
    const errors = attempts - (totalCards / 2);
    gameBoard.classList.add('disabled');
    feedback.innerHTML = `Congratulations ${name}! You finished the game in ${gameTime} seconds with ${errors} errors!`;
    const newScore = {
        name: name,
        time: gameTime,
        errors: errors
    };
    let ranking = getRankingFromLocalStorage();
    ranking.push(newScore);
    storeRankingInLocalStorage(ranking);
    showRanking();
    document.getElementById('name').value = '';
};

// Helper function to capitalize text
const capitalizeText = (text) => {
    return text.toLowerCase().replace(/^(.)|\s+(.)/g, (match) => {
        return match.toUpperCase();
    });
};