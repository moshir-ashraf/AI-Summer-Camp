// Global variables for admin functionality
let gameTimer = null;
let currentTimeLeft = 20;
let autoEndCalled = false;
let quizCompletionNotified = false; // Prevent spam notifications

document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const contentPanels = document.querySelectorAll('.content-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const panelId = item.getAttribute('data-panel') + '-panel';
            
            // Remove active class from all nav items and panels
            navItems.forEach(nav => nav.classList.remove('active'));
            contentPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding panel
            item.classList.add('active');
            const targetPanel = document.getElementById(panelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // On mobile, scroll to top of content
            if (window.innerWidth <= 768) {
                document.querySelector('.main-content').scrollTop = 0;
            }
        });
    });

    // Logout functionality
    document.querySelector('.logout-btn')?.addEventListener('click', logout);

    // End game functionality
    document.querySelector('.danger-btn')?.addEventListener('click', endGame);

    // Game control functionality
    initializeGameControls();

    // Initialize student data on page load
    autoRefreshStudentData();

    // Initialize game status on page load
    updateGameStatus();

    // Auto-refresh student data every 3 seconds for real-time tracking
    setInterval(autoRefreshStudentData, 3000);

    // Auto-refresh game status every 5 seconds
    setInterval(updateGameStatus, 5000);

    // Initialize game status and create game if needed
    initializeGame();
});

async function initializeGame() {
    try {
        // First try to get current game status
        const response = await fetch('/api/game/status');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                updateGameStatus();
                return;
            }
        }
        
        // If no game exists, create one
        const createResponse = await fetch('/api/game/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (createResponse.ok) {
            const createResult = await createResponse.json();
            if (createResult.success) {
                console.log('Game initialized successfully');
                updateGameStatus();
            }
        }
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

function logout() {
    window.location.href = '/logout';
}

async function endGame() {
    const confirmed = await showConfirmDialog('Are you sure you want to end the game? This will remove all student data and cannot be undone.');
    
    if (confirmed) {
        try {
            showNotification('Ending game...', 'info');
            
            const response = await fetch('/api/removeAll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // Success if either:
                // 1. Operation succeeded (result.success.status === true)
                // 2. No records found to delete (result.success.status === false but success.type === "Failure")
                if (result.success && (result.success.status || result.success.type === "Failure")) {
                    const message = result.success.status 
                        ? 'Game ended successfully. All student data has been removed.'
                        : 'Game ended successfully. No student data was found to remove.';
                    showNotification(message, 'success');
                    // Refresh the page after a short delay
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    throw new Error(result.message || 'Unknown error occurred');
                }
            } else {
                throw new Error('Failed to end game');
            }
        } catch (error) {
            console.error('Error ending game:', error);
            showNotification('Failed to end game. Please try again.', 'error');
        }
    }
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds (except for success messages which stay longer)
    const duration = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function showConfirmDialog(message) {
    // Remove any existing confirm dialogs
    const existingDialog = document.querySelector('.confirm-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-dialog-overlay';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="confirm-dialog-content">
                <div class="confirm-dialog-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Confirm Action</h3>
                </div>
                <div class="confirm-dialog-body">
                    <p>${message}</p>
                </div>
                <div class="confirm-dialog-footer">
                    <button class="btn-cancel">Cancel</button>
                    <button class="btn-confirm">Confirm</button>
                </div>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Handle button clicks
        const cancelBtn = dialog.querySelector('.btn-cancel');
        const confirmBtn = dialog.querySelector('.btn-confirm');

        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });

        confirmBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });

        // Handle overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
    });
}

async function autoRefreshStudentData() {
    // Refresh leaderboard panel
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    if (leaderboardPanel && leaderboardPanel.classList.contains('active')) {
        await refreshLeaderboardData();
    }
    
    // Also refresh student count in game controls
    await updateStudentCount();
}

async function refreshLeaderboardData() {
    try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.success.status) {
                const students = result.data.filter(user => user.role === 'STUDENT');
                updateLeaderboardDisplay(students);
                console.log('Student data refreshed at:', new Date().toLocaleTimeString());
            }
        }
    } catch (error) {
        console.error('Error refreshing student data:', error);
    }
}

function updateLeaderboardDisplay(students) {
    // Sort students by score (highest first)
    students.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const leaderboardContainer = document.querySelector('.leaderboard-container');
    if (!leaderboardContainer) return;
    
    if (students.length === 0) {
        // Show empty state
        leaderboardContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <h3>No Students Yet</h3>
                <p>Students will appear here once they register and start playing.</p>
            </div>
        `;
        return;
    }
    
    // Update or create podium container
    let podiumContainer = leaderboardContainer.querySelector('.podium-container');
    if (!podiumContainer) {
        podiumContainer = document.createElement('div');
        podiumContainer.className = 'podium-container';
        leaderboardContainer.appendChild(podiumContainer);
    }
    
    // Update podium (top 3)
    updatePodiumDisplay(podiumContainer, students.slice(0, 3));
    
    // Update or create students list for remaining students
    let studentsList = leaderboardContainer.querySelector('.students-list');
    if (students.length > 3) {
        if (!studentsList) {
            studentsList = document.createElement('div');
            studentsList.className = 'students-list';
            studentsList.innerHTML = '<h3 class="list-title">Other Participants</h3>';
            leaderboardContainer.appendChild(studentsList);
        }
        updateStudentsListDisplay(studentsList, students.slice(3));
    } else if (studentsList) {
        // Remove students list if 3 or fewer students
        studentsList.remove();
    }
    
    // Remove empty state if it exists
    const emptyState = leaderboardContainer.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

function updatePodiumDisplay(podiumContainer, topStudents) {
    // Clear existing podium places
    podiumContainer.innerHTML = '';
    
    // Create podium places for top 3
    for (let i = 0; i < 3; i++) {
        const student = topStudents[i];
        const podiumPlace = document.createElement('div');
        podiumPlace.className = `podium-place place-${i + 1}`;
        
        let iconHtml = '';
        if (i === 0) iconHtml = '<i class="fas fa-crown"></i>';
        else if (i === 1) iconHtml = '<i class="fas fa-medal"></i>';
        else iconHtml = '<i class="fas fa-award"></i>';
        
        if (student) {
            podiumPlace.innerHTML = `
                <div class="podium-icon">
                    ${iconHtml}
                </div>
                <div class="podium-info">
                    <h3 class="student-name">${student.name}</h3>
                    <p class="student-score">${student.score || 0} pts</p>
                    <p class="student-progress">Task ${student.lastTaskCompleted || 0}/1</p>
                </div>
                <div class="podium-rank">#${i + 1}</div>
            `;
        } else {
            // Empty placeholder for missing students
            podiumPlace.innerHTML = `
                <div class="podium-icon">
                    ${iconHtml}
                </div>
                <div class="podium-info">
                    <h3 class="student-name">-</h3>
                    <p class="student-score">0 pts</p>
                    <p class="student-progress">Task 0/1</p>
                </div>
                <div class="podium-rank">#${i + 1}</div>
            `;
        }
        
        podiumContainer.appendChild(podiumPlace);
    }
}

function updateStudentsListDisplay(studentsList, remainingStudents) {
    // Remove existing student rows (but keep the title)
    const existingRows = studentsList.querySelectorAll('.student-row');
    existingRows.forEach(row => row.remove());
    
    // Add current students
    remainingStudents.forEach((student, index) => {
        const rank = index + 4; // Since these are after top 3
        const studentRow = document.createElement('div');
        studentRow.className = 'student-row';
        
        studentRow.innerHTML = `
            <div class="student-rank">#${rank}</div>
            <div class="student-details">
                <h4 class="student-name">${student.name}</h4>
                <p class="student-meta">Task ${student.lastTaskCompleted || 0}/1</p>
            </div>
            <div class="student-score">${student.score || 0} pts</div>
        `;
        
        studentsList.appendChild(studentRow);
    });
}

async function updateStudentCount() {
    try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.success.status) {
                const students = result.data.filter(user => user.role === 'STUDENT');
                
                // Update student count in game status if visible
                const gameStatusDisplay = document.querySelector('.game-status-display');
                if (gameStatusDisplay) {
                    let studentCountEl = gameStatusDisplay.querySelector('.student-count');
                    if (!studentCountEl) {
                        // Create student count element if it doesn't exist
                        studentCountEl = document.createElement('div');
                        studentCountEl.className = 'student-count';
                        gameStatusDisplay.appendChild(studentCountEl);
                    }
                    studentCountEl.innerHTML = `<i class="fas fa-users"></i> ${students.length} students`;
                }
            }
        }
    } catch (error) {
        console.error('Error updating student count:', error);
    }
}

// Game Control Variables - moved to top to avoid redeclaration
function initializeGameControls() {
    // Start Game button
    document.getElementById('start-game-btn')?.addEventListener('click', startGame);
    
    // Pause Game button
    document.getElementById('pause-game-btn')?.addEventListener('click', pauseGame);
    
    // Resume Game button
    document.getElementById('resume-game-btn')?.addEventListener('click', resumeGame);
    
    // Reset Game button
    document.getElementById('reset-game-btn')?.addEventListener('click', resetGame);
    
    // Next Question button
    document.getElementById('next-question-btn')?.addEventListener('click', nextQuestion);
    
    // End Question Early button
    document.getElementById('end-question-btn')?.addEventListener('click', endQuestionEarly);
}

async function startGame() {
    try {
        showNotification('Starting game...', 'info');
        quizCompletionNotified = false; // Reset completion notification flag
        
        const response = await fetch('/api/game/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Game started successfully!', 'success');
                updateGameControls('active');
                startQuestionTimer();
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error('Failed to start game');
        }
    } catch (error) {
        console.error('Error starting game:', error);
        showNotification('Failed to start game. Please try again.', 'error');
    }
}

async function pauseGame() {
    try {
        const response = await fetch('/api/game/pause', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Game paused', 'info');
                updateGameControls('paused');
                stopQuestionTimer();
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error('Failed to pause game');
        }
    } catch (error) {
        console.error('Error pausing game:', error);
        showNotification('Failed to pause game. Please try again.', 'error');
    }
}

async function resumeGame() {
    try {
        const response = await fetch('/api/game/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Game resumed', 'success');
                updateGameControls('active');
                startQuestionTimer();
            } else {
                throw new Error(result.message);
            }
        } else {
            throw new Error('Failed to resume game');
        }
    } catch (error) {
        console.error('Error resuming game:', error);
        showNotification('Failed to resume game. Please try again.', 'error');
    }
}

async function resetGame() {
    try {
        // Show confirmation dialog
        const confirmed = await showConfirmDialog(
            'Reset Game',
            'Are you sure you want to reset the game? This will create a new game instance and all current progress will be lost.',
            'warning'
        );
        
        if (!confirmed) return;
        
        showNotification('Resetting game...', 'info');
        
        const response = await fetch('/api/game/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Game reset successfully', 'success');
                updateGameControls('waiting');
                stopQuestionTimer();
                
                // Update current question display to 1
                const currentQuestionEl = document.getElementById('current-question');
                if (currentQuestionEl) {
                    currentQuestionEl.textContent = 1;
                }
                
                // Update students count display
                const studentsAnsweredEl = document.getElementById('students-answered');
                const totalStudentsEl = document.getElementById('total-students');
                if (studentsAnsweredEl) {
                    studentsAnsweredEl.textContent = 0;
                }
                if (totalStudentsEl) {
                    totalStudentsEl.textContent = `/ ${result.data.numStudents || 0}`;
                }
                
                // Force a fresh game status update
                setTimeout(() => updateGameStatus(), 500);
            } else {
                throw new Error(result.message);
            }
        } else {
            const errorText = await response.text();
            console.error('Reset HTTP error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error resetting game:', error);
        showNotification(`Failed to reset game: ${error.message}`, 'error');
    }
}

async function nextQuestion() {
    try {
        // Stop current timer first to prevent conflicts
        stopQuestionTimer();
        
        const response = await fetch('/api/game/next-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                if (result.isComplete) {
                    showNotification('Quiz completed! All 20 questions have been answered.', 'info');
                    updateGameControls('complete');
                } else {
                    showNotification('Moving to next question...', 'success');
                    // Update game status to reflect new question
                    setTimeout(() => {
                        updateGameStatus();
                        updateGameControls('active');
                        startQuestionTimer();
                    }, 500);
                }
            } else {
                if (result.isComplete) {
                    showNotification('Quiz is already complete! All 20 questions have been answered.', 'info');
                    updateGameControls('complete');
                } else {
                    throw new Error(result.message);
                }
            }
        } else {
            throw new Error('Failed to advance question');
        }
    } catch (error) {
        console.error('Error advancing question:', error);
        showNotification('Failed to advance question. Please try again.', 'error');
        // Only restart timer if we're not at completion
        if (!error.message.includes('complete')) {
            startQuestionTimer();
        }
    }
}

async function endQuestionEarly() {
    const confirmed = await showConfirmDialog('Are you sure you want to end this question early? Scores will be calculated for students who have already answered.');
    
    if (confirmed) {
        try {
            stopQuestionTimer();
            
            const response = await fetch('/api/game/end-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showNotification('Question ended early. Scores calculated.', 'success');
                    updateGameControls('waiting-next');
                } else {
                    console.error('Server error:', result.message);
                    throw new Error(result.message || 'Unknown server error');
                }
            } else {
                const errorText = await response.text();
                console.error('HTTP error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error ending question:', error);
            showNotification(`Failed to end question: ${error.message}`, 'error');
            // Restart the timer if there was an error
            startQuestionTimer();
        }
    }
}

function updateGameControls(status) {
    const startBtn = document.getElementById('start-game-btn');
    const pauseBtn = document.getElementById('pause-game-btn');
    const resumeBtn = document.getElementById('resume-game-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const endBtn = document.getElementById('end-question-btn');
    const statusIndicator = document.getElementById('game-status');
    
    // Hide all buttons first
    [startBtn, pauseBtn, resumeBtn, nextBtn, endBtn].forEach(btn => {
        if (btn) btn.style.display = 'none';
    });
    
    // Remove all status classes
    if (statusIndicator) {
        statusIndicator.classList.remove('waiting', 'active', 'paused');
    }
    
    switch (status) {
        case 'waiting':
            if (startBtn) startBtn.style.display = 'flex';
            if (statusIndicator) {
                statusIndicator.textContent = 'Waiting';
                statusIndicator.classList.add('waiting');
            }
            break;
        case 'active':
            if (pauseBtn) pauseBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (endBtn) endBtn.style.display = 'flex';
            if (statusIndicator) {
                statusIndicator.textContent = 'Active';
                statusIndicator.classList.add('active');
            }
            break;
        case 'paused':
            if (resumeBtn) resumeBtn.style.display = 'flex';
            if (statusIndicator) {
                statusIndicator.textContent = 'Paused';
                statusIndicator.classList.add('paused');
            }
            break;
        case 'waiting-next':
            if (nextBtn) nextBtn.style.display = 'flex';
            if (pauseBtn) pauseBtn.style.display = 'flex';
            if (statusIndicator) {
                statusIndicator.textContent = 'Waiting';
                statusIndicator.classList.add('waiting');
            }
            break;
        case 'complete':
            // Hide all game control buttons when quiz is complete
            if (statusIndicator) {
                statusIndicator.textContent = 'Quiz Complete';
                statusIndicator.classList.add('complete');
            }
            break;
    }
}

function startQuestionTimer() {
    currentTimeLeft = 20;
    autoEndCalled = false; // Reset the flag when starting a new timer
    const timerSection = document.getElementById('question-timer');
    const timerDisplay = document.getElementById('timer-display');
    const timerProgress = document.getElementById('timer-progress');
    
    if (timerSection) timerSection.style.display = 'block';
    
    updateTimerDisplay();
    
    gameTimer = setInterval(() => {
        currentTimeLeft--;
        updateTimerDisplay();
        
        if (currentTimeLeft <= 0) {
            stopQuestionTimer();
            if (!autoEndCalled) {
                autoEndCalled = true;
                autoEndQuestion();
            }
        }
    }, 1000);
}

function stopQuestionTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    const timerSection = document.getElementById('question-timer');
    if (timerSection) timerSection.style.display = 'none';
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const timerProgress = document.getElementById('timer-progress');
    
    if (timerDisplay) {
        timerDisplay.textContent = currentTimeLeft;
    }
    
    if (timerProgress) {
        const percentage = (currentTimeLeft / 20) * 100;
        timerProgress.style.width = `${percentage}%`;
    }
}

async function autoEndQuestion() {
    try {
        const response = await fetch('/api/game/auto-end-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Time up! Scores calculated for answered questions.', 'info');
                updateGameControls('waiting-next');
                
                // Stop the timer
                stopQuestionTimer();
            }
        }
    } catch (error) {
        console.error('Error auto-ending question:', error);
    }
}

async function updateGameStatus() {
    try {
        const response = await fetch('/api/game/status');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const game = result.data;
                
                // Update current question display
                const currentQuestionEl = document.getElementById('current-question');
                if (currentQuestionEl) {
                    currentQuestionEl.textContent = game.currentQuestion || 1;
                }
                
                // Update students count - get fresh student count
                const studentsResponse = await fetch('/api/leaderboard');
                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    const numStudents = studentsData.success && studentsData.data ? 
                        studentsData.data.filter(user => user.role === 'STUDENT').length : 0;
                    
                    const studentsAnsweredEl = document.getElementById('students-answered');
                    const totalStudentsEl = document.getElementById('total-students');
                    if (studentsAnsweredEl && totalStudentsEl) {
                        studentsAnsweredEl.textContent = game.questionsAttempted || 0;
                        totalStudentsEl.textContent = `/ ${numStudents}`;
                    }
                }
                
                // Check if game is complete (question > 20)
                if (game.currentQuestion > 20) {
                    updateGameControls('complete');
                    // Only show notification once when quiz completes
                    if (!quizCompletionNotified) {
                        showNotification('Quiz complete! All 20 questions have been answered.', 'success');
                        quizCompletionNotified = true;
                    }
                    return;
                }
                
                // Update game controls based on status
                if (game.isPaused === false) {
                    // Game is active - check if we need to show next question button
                    // This happens when time is up or instructor ended question early
                    updateGameControls('active');
                } else {
                    // Game is paused/waiting
                    updateGameControls('waiting');
                }
            }
        }
    } catch (error) {
        console.error('Error updating game status:', error);
    }
}
