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
