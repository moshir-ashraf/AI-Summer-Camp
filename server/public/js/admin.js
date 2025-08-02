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

    // Auto-refresh leaderboard every 30 seconds (only on leaderboard panel)
    setInterval(autoRefreshLeaderboard, 30000);
});

function logout() {
    window.location.href = '/logout';
}

async function endGame() {
    if (confirm('Are you sure you want to end the game? This will remove all student data and cannot be undone.')) {
        try {
            const response = await fetch('/api/removeAll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.success.status) {
                    alert('Game ended successfully. All student data has been removed.');
                    // Refresh the page to update the leaderboard
                    window.location.reload();
                } else {
                    throw new Error(result.success ? result.success.message : 'Unknown error');
                }
            } else {
                throw new Error('Failed to end game');
            }
        } catch (error) {
            console.error('Error ending game:', error);
            alert('Failed to end game. Please try again.');
        }
    }
}

async function autoRefreshLeaderboard() {
    // Only refresh if we're on the leaderboard panel
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    if (!leaderboardPanel || !leaderboardPanel.classList.contains('active')) {
        return;
    }

    try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.success.status) {
                // For now, we'll just reload the page to get fresh data
                // In a production app, you'd want to update the DOM directly
                console.log('Leaderboard refreshed at:', new Date().toLocaleTimeString());
                // Uncomment the next line to enable auto-reload
                // window.location.reload();
            }
        }
    } catch (error) {
        console.error('Error refreshing leaderboard:', error);
    }
}
