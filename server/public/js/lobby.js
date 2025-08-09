document.addEventListener('DOMContentLoaded', function() {
    // Check game status on page load
    checkGameStatus();
    
    // Check game status every 3 seconds
    setInterval(checkGameStatus, 3000);
    
    document.querySelector('#start-btn')?.addEventListener('click', () => {
        const taskNumber = window.nextTask || 1;
        const currentMode = window.currentMode || 'Python Recap';
        
        
        if (currentMode === 'Python Recap') {
            // Go to real-time quiz
            window.location.href = `/task1-realtime`;
        } else if (currentMode === 'Model Mimic') {
            // Check if all tasks are completed (task > 5 means all completed)
            if (taskNumber > 5) {
                window.location.href = `/final`;
            } else {
                // Go to sequential task based on next task number
                window.location.href = `/task${taskNumber}`;
            }
        } else if (currentMode === 'Deep Learning') {
            // Go to neural network builder
            window.location.href = `/task-deep-learning`;
        } else {
            // Default fallback
            window.location.href = `/task1-realtime`;
        }
    });
});

async function checkGameStatus() {
    try {
        const response = await fetch('/api/game/status');
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
                const game = result.data;
                
                // Update global variables with data from server
                if (game.currentMode) {
                    window.currentMode = game.currentMode;
                }
                
                // For Model Mimic mode, determine next task based on game state (admin-controlled)
                if (game.currentMode === 'Model Mimic') {
                    // Use the game's current task (controlled by admin) instead of user progress
                    window.nextTask = game.currentQuestion || game.currentTask || 1;
                } else if (game.currentMode === 'Python Recap') {
                    // For Python Recap, always go to real-time quiz
                    window.nextTask = 1;
                } else if (game.currentMode === 'Deep Learning') {
                    // For Deep Learning, always go to neural network task
                    window.nextTask = 1;
                }
                
                updateGameStatusDisplay(game);
            }
        }
    } catch (error) {
        console.error('Error checking game status:', error);
    }
}

function getUserNextTask() {
    // This function should check the user's progress and return the next task number
    // For now, we'll check localStorage or default to task 1
    // In a full implementation, this would check the user's completed tasks from the server
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
    
    // Find the next uncompleted task (1-5)
    for (let i = 1; i <= 5; i++) {
        if (!completedTasks.includes(i)) {
            return i;
        }
    }
    
    // If all tasks completed, return 5 (or could show completion message)
    return 5;
}

function updateGameStatusDisplay(game) {
    const startBtn = document.getElementById('start-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    
    if (!startBtn || !btnText || !btnIcon) return;
    
    // Update the descriptive text section based on current mode
    updateDescriptiveText(game.currentMode);
    
    // Check if a task mode is selected
    if (!game.currentMode) {
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
        btnText.textContent = 'Waiting for Task Mode Selection';
        btnIcon.className = 'fas fa-cog';
        return;
    }
    
    // Handle different modes
    if (game.currentMode === 'Python Recap') {
        // Python Recap mode - real-time quiz logic
        if (game.isPaused === false) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            btnText.textContent = 'Join Python Quiz';
            btnIcon.className = 'fas fa-play';
        } else {
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            btnText.textContent = 'Waiting for Python Quiz to Start';
            btnIcon.className = 'fas fa-clock';
        }
    } else if (game.currentMode === 'Model Mimic') {
        // Model Mimic mode - sequential tasks, check if student has completed current task
        const nextTask = window.nextTask || 1;
        const userLastCompleted = window.userLastTaskCompleted || 0;
        
        // Check if student has already completed the current admin-controlled task
        if (userLastCompleted >= nextTask) {
            // Student has completed the current task, they need to wait for admin to advance
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            btnText.textContent = `Task ${nextTask} Complete - Waiting for Next Task`;
            btnIcon.className = 'fas fa-clock';
        } else if (game.isPaused === false) {
            // Student hasn't completed current task and game is not paused
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            
            if (nextTask <= 5) {
                btnText.textContent = `Start Task ${nextTask}`;
                btnIcon.className = 'fas fa-play';
            } else {
                btnText.textContent = 'View Final Results';
                btnIcon.className = 'fas fa-trophy';
            }
        } else {
            // Game is paused
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            btnText.textContent = 'Waiting for Deep Learning Tasks to Begin';
            btnIcon.className = 'fas fa-clock';
        }
    } else if (game.currentMode === 'Deep Learning') {
        // Deep Learning mode - neural network builder
        if (game.isPaused === false) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            btnText.textContent = 'Build Neural Network';
            btnIcon.className = 'fas fa-robot';
        } else {
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            btnText.textContent = 'Waiting for Neural Network Session to Start';
            btnIcon.className = 'fas fa-clock';
        }
    } else {
        // Fallback for unknown modes
        if (game.isPaused === false) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            btnText.textContent = 'Join Game';
            btnIcon.className = 'fas fa-play';
        } else {
            startBtn.disabled = true;
            startBtn.classList.add('disabled');
            btnText.textContent = 'Waiting for Game to Start';
            btnIcon.className = 'fas fa-clock';
        }
    }
}

function updateDescriptiveText(currentMode) {
    const descriptionTitle = document.querySelector('.description-title');
    const descriptionText = document.querySelector('.description-text');
    const convInfo = document.querySelector('.conv-info');
    
    if (!descriptionTitle || !descriptionText) return;
    
    // Remove any existing conv-info section first
    if (convInfo) {
        convInfo.remove();
    }
    
    if (currentMode === 'Model Mimic') {
        descriptionTitle.textContent = 'How Deep Learning Works';
        descriptionText.innerHTML = `
            Deep learning is about feeding input data into neural network models that train and learn patterns from the data. 
            These models process information through multiple layers, extracting features and making connections to produce 
            intelligent observational insights and concluding outputs that can solve complex problems.
        `;
    } else if (currentMode === 'Deep Learning') {
        descriptionTitle.textContent = 'Neural Network Builder';
        descriptionText.innerHTML = `
            Deep learning is a field of machine learning that uses multi-layered neural networks to automatically learn and represent features from data, enabling a computer to make predictions and decisions without explicit programming for every single task.
        `;
        
        // Add the conv-info section for Deep Learning mode
        const aiDescription = document.querySelector('.ai-description');
        if (aiDescription) {
            const convInfoHTML = `
                <div class="conv-info">
                    <h3 class="conv-title">Convolutional Layers</h3>
                    <p class="conv-text">
                        Convolutional layers use filters to detect features like edges, shapes, and patterns in images. 
                        They scan across the image to extract important visual information that helps the network 
                        distinguish between different objects, like telling Thanos apart from Grimace!
                    </p>
                </div>
            `;
            aiDescription.insertAdjacentHTML('beforeend', convInfoHTML);
        }
    } else {
        // Default to Python Recap mode
        descriptionTitle.textContent = 'How Python Works';
        descriptionText.innerHTML = `
            Python is a high-level programming language designed for readability and simplicity. 
            It uses straightforward syntax to let programmers write clear and concise code. 
            Python runs instructions line by line and supports many libraries that make complex tasks easier to implement.
        `;
    }
}
