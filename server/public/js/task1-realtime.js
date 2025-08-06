// Real-time Quiz JavaScript
let currentQuestionNumber = 1;
let gameTimer = null;
let timeLeft = 20;
let hasAnswered = false;
let currentScore = 0;
let lastKnownQuestion = 1;
let isWaitingForNextQuestion = false;
let gameCompleted = false;

// Questions data
const questions = [
    {
        id: 1,
        title: "Question 1: Code Analysis Challenge",
        text: "What will be printed by this code?<br><code><span class=\"variable\">numbers</span> <span class=\"operator\">=</span> [<span class=\"number\">10</span>, <span class=\"number\">15</span>, <span class=\"number\">20</span>, <span class=\"number\">25</span>, <span class=\"number\">30</span>]<br><span class=\"keyword\">for</span> <span class=\"variable\">i</span>, <span class=\"variable\">num</span> <span class=\"keyword\">in</span> <span class=\"function\">enumerate</span>(<span class=\"variable\">numbers</span>):<br>&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"keyword\">if</span> <span class=\"variable\">num</span> <span class=\"operator\">%</span> <span class=\"number\">15</span> <span class=\"operator\">==</span> <span class=\"number\">0</span>:<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class=\"function\">print</span>(<span class=\"string\">f\"Position {<span class=\"variable\">i</span>}: {<span class=\"variable\">num</span>}\"</span>)</code>",
        options: {
            a: "Position 1: 15",
            b: "Position 1: 15, Position 3: 25", 
            c: "Position 1: 15, Position 4: 30",
            d: "Nothing prints"
        }
    },
    {
        id: 2,
        title: "Question 2: List Operation Analysis",
        text: "What is the best approach for accessing information about items in this collection?<br><code><span class=\"variable\">student_info</span> <span class=\"operator\">=</span> [<span class=\"string\">\"Alice\"</span>, <span class=\"number\">20</span>, <span class=\"string\">\"Computer Science\"</span>]</code>",
        options: {
            a: "Access by index: student_info[0] for name",
            b: "Use a dictionary: {\"name\": \"Alice\", \"age\": 20, \"major\": \"CS\"}",
            c: "Convert to a string and use slicing",
            d: "Use multiple separate variables"
        }
    },
    {
        id: 3,
        title: "Question 3: Control Flow Analysis",
        text: "What would be the most efficient way to find all even numbers in a large list?",
        options: {
            a: "Use a for loop with an if statement to check each number",
            b: "Use a while loop and manually increment the index",
            c: "Use list comprehension: [x for x in numbers if x % 2 == 0]",
            d: "Convert to strings and check the last character"
        }
    },
    {
        id: 4,
        title: "Question 4: Data Type Selection",
        text: "Which data type would be best for storing a collection of unique student IDs?",
        options: {
            a: "set",
            b: "list",
            c: "tuple",
            d: "dictionary"
        }
    },
    {
        id: 5,
        title: "Question 5: Function Design",
        text: "What makes a function well-designed in Python?",
        options: {
            a: "It's as short as possible",
            b: "It does one specific task clearly and can be reused",
            c: "It uses as many parameters as possible",
            d: "It includes all the code needed for the entire program"
        }
    },
    {
        id: 6,
        title: "Question 6: String Manipulation",
        text: "What's the best way to combine several words into a sentence with proper spacing?",
        options: {
            a: "Use + operator: word1 + \" \" + word2 + \" \" + word3",
            b: "Use a loop to add each word individually",
            c: "Use .join() method: \" \".join([word1, word2, word3])",
            d: "Use f-strings: f\"{word1} {word2} {word3}\""
        }
    },
    {
        id: 7,
        title: "Question 7: Loop Strategy",
        text: "When processing items in a list, when should you use enumerate()?",
        options: {
            a: "When you need both the position and the value of each item",
            b: "When you want to make the loop run faster",
            c: "When the list has more than 10 items",
            d: "Only when the list contains numbers"
        }
    },
    {
        id: 8,
        title: "Question 8: Variable Naming",
        text: "Which variable name best follows Python conventions for storing a student's graduation year?",
        options: {
            a: "yr",
            b: "graduation_year",
            c: "GraduationYear",
            d: "GRAD_YR"
        }
    },
    {
        id: 9,
        title: "Question 9: Dictionary Usage",
        text: "What's the safest way to get a value from a dictionary when the key might not exist?",
        options: {
            a: "dict[key] - let it raise an error if the key doesn't exist",
            b: "Check if key is in the dictionary first, then access it",
            c: "Use dict.get(key, default_value)",
            d: "Convert the dictionary to a list first"
        }
    },
    {
        id: 10,
        title: "Question 10: Code Organization",
        text: "How should you organize code that calculates student grade averages?",
        options: {
            a: "Put everything in one long function",
            b: "Separate functions: one to collect grades, one to calculate average",
            c: "Use only global variables",
            d: "Write the same code multiple times for different students"
        }
    },
    {
        id: 11,
        title: "Question 11: List vs Dictionary Choice",
        text: "For storing information about books (title, author, year), which structure is more appropriate?",
        options: {
            a: "[title, author, year] - simple list",
            b: "{\"title\": title, \"author\": author, \"year\": year} - dictionary",
            c: "(title, author, year) - tuple",
            d: "Three separate variables"
        }
    },
    {
        id: 12,
        title: "Question 12: Conditional Logic",
        text: "What's the most readable way to check if a student's grade is A, B, or C?",
        options: {
            a: "Use multiple separate if statements",
            b: "Use nested if statements",
            c: "Use if-elif-else structure",
            d: "Use a long boolean expression with 'and' and 'or'"
        }
    },
    {
        id: 13,
        title: "Question 13: Input Validation",
        text: "When getting user input for an age, what's a good approach to ensure it's valid?",
        options: {
            a: "Assume the user will always enter correct data",
            b: "Check if the input can be converted to an integer and is reasonable",
            c: "Accept any input and handle errors later",
            d: "Only allow pre-selected ages from a list"
        }
    },
    {
        id: 14,
        title: "Question 14: Code Readability",
        text: "What makes Python code more readable and maintainable?",
        options: {
            a: "Using very short variable names to save space",
            b: "Clear variable names, proper spacing, and logical structure",
            c: "Writing everything on as few lines as possible",
            d: "Using complex logic to show advanced skills"
        }
    },
    {
        id: 15,
        title: "Question 15: Data Processing",
        text: "For processing a large dataset of student records, which approach is most effective?",
        options: {
            a: "Load everything into memory at once",
            b: "Process records in small batches",
            c: "Process one record at a time with file operations",
            d: "Convert everything to strings first"
        }
    },
    {
        id: 16,
        title: "Question 16: Problem Decomposition",
        text: "When building a program to manage a library's book inventory, how should you start?",
        options: {
            a: "Write all the code in one large file",
            b: "Identify main tasks: add books, find books, track checkouts",
            c: "Start with the most complex feature first",
            d: "Copy code from similar projects"
        }
    },
    {
        id: 17,
        title: "Question 17: Error Handling Strategy",
        text: "When your program encounters an error, what's the best approach?",
        options: {
            a: "Let the program crash and fix it later",
            b: "Plan for common errors and handle them gracefully",
            c: "Ignore errors and hope they don't happen",
            d: "Always restart the program when an error occurs"
        }
    },
    {
        id: 18,
        title: "Question 18: Algorithm Efficiency",
        text: "When searching for a specific student in a large sorted list, which method is most efficient?",
        options: {
            a: "Check every student from the beginning until you find the right one",
            b: "Check every student from the end until you find the right one",
            c: "Use binary search to narrow down the location efficiently",
            d: "Reorganize the list every time before searching"
        }
    },
    {
        id: 19,
        title: "Question 19: Code Testing",
        text: "What's a good way to verify that your function works correctly?",
        options: {
            a: "Test it with a few different inputs and check the outputs",
            b: "Assume it works if there are no syntax errors",
            c: "Only test with the exact input it was designed for",
            d: "Wait for users to report problems"
        }
    },
    {
        id: 20,
        title: "Question 20: Software Design Principles",
        text: "When building a program to calculate student grade averages, what's the best design approach?",
        options: {
            a: "One large function that handles input, calculation, and output",
            b: "Separate functions: get_grades(), calculate_average(), display_results()",
            c: "A class with methods for each operation and data storage",
            d: "Both b and c are good approaches depending on complexity"
        }
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quiz
    checkGameStatus();
    
    // Check game status every 3 seconds
    setInterval(checkGameStatus, 3000);
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Submit answer button
    document.getElementById('submit-answer-btn')?.addEventListener('click', () => submitAnswer(false));
    
    // Answer selection
    document.querySelectorAll('input[name="current-answer"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const submitBtn = document.getElementById('submit-answer-btn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('disabled');
            }
        });
    });
    
    // Return to final button
    document.getElementById('return-lobby-btn')?.addEventListener('click', () => {
        window.location.href = '/final';
    });
}

function resetGameState() {
    // Stop any existing timer
    stopQuestionTimer();
    
    // Reset all state variables
    currentQuestionNumber = 1;
    lastKnownQuestion = 1;
    hasAnswered = false;
    isWaitingForNextQuestion = false;
    gameCompleted = false; // Reset completion flag
    currentScore = 0;
    timeLeft = 20;
    
    // Reset UI elements
    const waitingScreen = document.getElementById('waiting-screen');
    const questionDisplay = document.getElementById('question-display');
    const resultDisplay = document.getElementById('answer-result');
    const gameStatus = document.getElementById('game-status');
    const currentScoreEl = document.getElementById('current-score');
    
    // Show waiting screen, hide others
    if (waitingScreen) waitingScreen.style.display = 'flex';
    if (questionDisplay) questionDisplay.style.display = 'none';
    if (resultDisplay) resultDisplay.style.display = 'none';
    
    // Reset status
    if (gameStatus) {
        gameStatus.textContent = 'Waiting';
        gameStatus.className = 'status-value waiting';
    }
    
    // Reset score display
    if (currentScoreEl) {
        currentScoreEl.textContent = '0';
    }
    
    // Clear any selected answers
    document.querySelectorAll('input[name="current-answer"]').forEach(radio => {
        radio.checked = false;
    });
    
}

async function checkGameStatus() {
    try {
        const response = await fetch('/api/game/status');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                updateGameDisplay(result.data);
            }
        }
    } catch (error) {
        console.error('Error checking game status:', error);
    }
}

function updateGameDisplay(game) {
    // If game is already completed, don't update anything
    if (gameCompleted) return;
    
    const gameStatus = document.getElementById('game-status');
    const questionCounter = document.getElementById('question-counter');
    const waitingScreen = document.getElementById('waiting-screen');
    const questionDisplay = document.getElementById('question-display');
    const resultDisplay = document.getElementById('answer-result');
    
    // Check if game is complete first
    if (game.currentQuestion > 20 || game.isComplete) {
        showGameComplete();
        return; // Exit early to prevent further processing
    }
    
    // Update question counter
    if (questionCounter) {
        questionCounter.textContent = `Question ${game.currentQuestion} of 20`;
    }
    
    // If game was reset (currentQuestion is 1 and game is paused), reset everything
    if (game.currentQuestion === 1 && game.isPaused) {
        resetGameState();
    }
    
    // Check if this is a new question
    if (game.currentQuestion !== lastKnownQuestion) {
        lastKnownQuestion = game.currentQuestion;
        currentQuestionNumber = game.currentQuestion;
        hasAnswered = false;
        isWaitingForNextQuestion = false;
        
        // Hide result display when new question appears
        if (resultDisplay) resultDisplay.style.display = 'none';
    }
    
    if (game.isPaused === false && !isWaitingForNextQuestion) {
        // Game is active and we're not waiting for next question
        if (gameStatus) {
            gameStatus.textContent = 'Active';
            gameStatus.className = 'status-value active';
        }
        
        // Show question, hide waiting screen
        if (waitingScreen) waitingScreen.style.display = 'none';
        if (questionDisplay) questionDisplay.style.display = 'block';
        
        // Load current question
        loadQuestion(game.currentQuestion);
        
        // Start timer if not already started and haven't answered
        if (!gameTimer && !hasAnswered) {
            startQuestionTimer();
        }
    } else {
        // Game is paused/waiting or we're waiting for next question
        if (gameStatus) {
            gameStatus.textContent = isWaitingForNextQuestion ? 'Waiting for Next Question' : 'Waiting';
            gameStatus.className = 'status-value waiting';
        }
        
        if (isWaitingForNextQuestion) {
            // Keep showing the result screen while waiting
            if (waitingScreen) waitingScreen.style.display = 'none';
            if (questionDisplay) questionDisplay.style.display = 'none';
            // Keep result display visible
        } else {
            // Show waiting screen, hide question and result
            if (waitingScreen) waitingScreen.style.display = 'flex';
            if (questionDisplay) questionDisplay.style.display = 'none';
            if (resultDisplay) resultDisplay.style.display = 'none';
        }
        
        // Stop timer
        stopQuestionTimer();
    }
}

function loadQuestion(questionNumber) {
    const question = questions[questionNumber - 1];
    if (!question) return;
    
    const titleEl = document.getElementById('current-question-title');
    const textEl = document.getElementById('question-text');
    const optionAEl = document.querySelector('#option-a .option-text');
    const optionBEl = document.querySelector('#option-b .option-text');
    const optionCEl = document.querySelector('#option-c .option-text');
    const optionDEl = document.querySelector('#option-d .option-text');
    
    if (titleEl) titleEl.textContent = question.title;
    if (textEl) textEl.innerHTML = question.text;
    if (optionAEl) optionAEl.textContent = `a) ${question.options.a}`;
    if (optionBEl) optionBEl.textContent = `b) ${question.options.b}`;
    if (optionCEl) optionCEl.textContent = `c) ${question.options.c}`;
    if (optionDEl) optionDEl.textContent = `d) ${question.options.d}`;
    
    // Reset form
    document.querySelectorAll('input[name="current-answer"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reset submit button
    const submitBtn = document.getElementById('submit-answer-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
    }
    
    // Reset answered state
    hasAnswered = false;
    
    // Hide result display
    const resultDisplay = document.getElementById('answer-result');
    if (resultDisplay) resultDisplay.style.display = 'none';
}

function startQuestionTimer() {
    timeLeft = 20;
    updateTimerDisplay();
    
    gameTimer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            stopQuestionTimer();
            if (!hasAnswered) {
                submitAnswer(true); // Auto-submit with timeout flag
            }
        }
    }, 1000);
}

function stopQuestionTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimerDisplay() {
    const timerValue = document.getElementById('timer-value');
    if (timerValue) {
        timerValue.textContent = timeLeft;
        
        // Change color based on time left
        if (timeLeft <= 5) {
            timerValue.className = 'timer-value danger';
        } else if (timeLeft <= 10) {
            timerValue.className = 'timer-value warning';
        } else {
            timerValue.className = 'timer-value';
        }
    }
}

async function submitAnswer(isTimeout = false) {
    if (hasAnswered) return;
    
    hasAnswered = true;
    isWaitingForNextQuestion = true;
    const selectedAnswer = document.querySelector('input[name=\"current-answer\"]:checked');
    const answer = selectedAnswer ? selectedAnswer.value.toUpperCase() : null;
    const timeTaken = 20 - timeLeft;
    
    try {
        const response = await fetch('/api/game/submit-answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionNumber: currentQuestionNumber,
                answer: answer,
                timeTaken: timeTaken,
                isTimeout: isTimeout
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showAnswerResult(result.data, isTimeout);
            currentScore = result.data.totalScore || 0;
        } else {
            console.error('Failed to submit answer');
            // Reset states on error
            hasAnswered = false;
            isWaitingForNextQuestion = false;
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
        // Reset states on error
        hasAnswered = false;
        isWaitingForNextQuestion = false;
    }
    
    // Stop timer
    stopQuestionTimer();
}

function showAnswerResult(data, isTimeout = false) {
    const resultDisplay = document.getElementById('answer-result');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const currentScoreEl = document.getElementById('current-score');
    
    if (resultDisplay) {
        resultDisplay.style.display = 'block';
    }
    
    if (isTimeout) {
        if (resultIcon) resultIcon.innerHTML = '<i class=\"fas fa-clock\"></i>';
        if (resultTitle) resultTitle.textContent = 'Time\'s Up!';
        if (resultText) resultText.innerHTML = `
            Time ran out! The correct answer was <strong>${data.correctAnswer}</strong>.<br><br>
            <strong>Explanation:</strong><br>
            ${data.explanation}<br><br>
            <em>Waiting for instructor to advance to next question...</em>
        `;
        if (resultDisplay) resultDisplay.className = 'answer-result timeout';
    } else if (data.isCorrect) {
        if (resultIcon) resultIcon.innerHTML = '<i class=\"fas fa-check-circle\"></i>';
        if (resultTitle) resultTitle.textContent = 'Correct!';
        if (resultText) resultText.innerHTML = `
            Great job! You earned ${data.score} points.<br><br>
            <strong>Explanation:</strong><br>
            ${data.explanation}<br><br>
            <em>Waiting for instructor to advance to next question...</em>
        `;
        if (resultDisplay) resultDisplay.className = 'answer-result correct';
    } else {
        if (resultIcon) resultIcon.innerHTML = '<i class=\"fas fa-times-circle\"></i>';
        if (resultTitle) resultTitle.textContent = 'Incorrect';
        if (resultText) resultText.innerHTML = `
            The correct answer was <strong>${data.correctAnswer}</strong>.<br><br>
            <strong>Explanation:</strong><br>
            ${data.explanation}<br><br>
            <em>Waiting for instructor to advance to next question...</em>
        `;
        if (resultDisplay) resultDisplay.className = 'answer-result incorrect';
    }
    
    if (currentScoreEl) {
        currentScoreEl.textContent = data.totalScore || 0;
    }
    
    // Hide question display
    const questionDisplay = document.getElementById('question-display');
    if (questionDisplay) questionDisplay.style.display = 'none';
}

function showGameComplete() {
    gameCompleted = true; // Set flag to prevent status updates
    
    const gameComplete = document.getElementById('game-complete');
    const finalScoreEl = document.getElementById('final-score');
    const waitingScreen = document.getElementById('waiting-screen');
    const questionDisplay = document.getElementById('question-display');
    const resultDisplay = document.getElementById('answer-result');
    const gameStatus = document.getElementById('game-status');
    
    // Update status to completed
    if (gameStatus) {
        gameStatus.textContent = 'Completed';
        gameStatus.className = 'status-value completed';
    }
    
    // Stop any running timer
    stopQuestionTimer();
    
    // Hide other screens
    if (waitingScreen) waitingScreen.style.display = 'none';
    if (questionDisplay) questionDisplay.style.display = 'none';
    if (resultDisplay) resultDisplay.style.display = 'none';
    
    // Show complete screen
    if (gameComplete) gameComplete.style.display = 'flex';
    if (finalScoreEl) finalScoreEl.textContent = currentScore;
    
    // Stop checking game status since we're completed
}
