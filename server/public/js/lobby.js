document.addEventListener('DOMContentLoaded', function() {
    // Check game status on page load
    checkGameStatus();
    
    // Check game status every 3 seconds
    setInterval(checkGameStatus, 3000);
    
    document.querySelector('#start-btn')?.addEventListener('click', () => {
        const taskNumber = window.nextTask || 1;
        window.location.href = `/task${taskNumber}-realtime`;
    });
});

async function checkGameStatus() {
    try {
        const response = await fetch('/api/game/status');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const game = result.data;
                updateGameStatusDisplay(game);
            }
        }
    } catch (error) {
        console.error('Error checking game status:', error);
    }
}

function updateGameStatusDisplay(game) {
    const startBtn = document.getElementById('start-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    
    if (!startBtn || !btnText || !btnIcon) return;
    
    if (game.isPaused === false) {
        // Game is active - students can join
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
        btnText.textContent = 'Join Game';
        btnIcon.className = 'fas fa-play';
    } else {
        // Game is paused/waiting - students must wait
        startBtn.disabled = true;
        startBtn.classList.add('disabled');
        btnText.textContent = 'Waiting for Game to Start';
        btnIcon.className = 'fas fa-clock';
    }
}
