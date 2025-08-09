document.addEventListener('DOMContentLoaded', function() {
    const answers = { answer1: 'Fly Agaric', answer2: 'Milk Cap', answer3: 'Neither' };
    const labels = ['Mushroom A', 'Mushroom B', 'Mushroom C'];

    document.getElementById('checkButton').addEventListener('click', handleButtonClick);
    document.getElementById('nextButton').addEventListener('click', () => {
        if (userRole === 'INSTRUCTOR') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/lobby';
        }
    });

    function handleButtonClick() {
        if (userRole === 'INSTRUCTOR') {
            showSolution();
        } else {
            checkAnswers();
        }
    }

    function showSolution() {
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = '';

        // Show all correct answers for instructor
        for (const id in answers) {
            const correct = answers[id];
            const label = labels[parseInt(id.slice(-1)) - 1];
            
            const item = document.createElement('li');
            item.className = 'feedback-item correct';

            if (id === 'answer3') {
                item.innerHTML = `<i class="fas fa-info-circle"></i> ${label}: Scaly Wood mushroom - neither type!`;
            } else {
                item.innerHTML = `<i class="fas fa-info-circle"></i> ${label}: ${correct}`;
            }

            feedbackList.appendChild(item);
        }

        document.getElementById('score-display').innerHTML = `Solution displayed for instructor`;
        document.getElementById('feedback').classList.remove('hidden');
        document.getElementById('checkButton').disabled = true;
    }

    function checkAnswers() {
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = '';
        let score = 0;

        // Check all answered
        for (const id in answers) {
            if (!document.getElementById(id).value.trim()) {
                showNotification('Please answer all questions before checking your answers.', 'warning');
                return;
            }
        }

        // Check each answer
        for (const id in answers) {
            const userAnswer = document.getElementById(id).value.trim();
            const correct = answers[id];
            const label = labels[parseInt(id.slice(-1)) - 1];
            
            const item = document.createElement('li');
            item.className = 'feedback-item';

            if (id === 'answer3') {
                item.className += ' incorrect';
                item.innerHTML = `<i class="fas fa-times-circle"></i> ${label}: Scaly Wood mushroom - neither type! (+0)`;
            } else if (userAnswer === correct) {
                score += 2;
                item.className += ' correct';
                item.innerHTML = `<i class="fas fa-check-circle"></i> ${label}: Correct! (+2)`;
            } else {
                item.className += ' incorrect';
                item.innerHTML = `<i class="fas fa-times-circle"></i> ${label}: Wrong, it's ${correct}. (+0)`;
            }

            feedbackList.appendChild(item);
        }

        document.getElementById('score-display').innerHTML = `Your Score: ${score}/4 points`;
        document.getElementById('feedback').classList.remove('hidden');
        document.getElementById('checkButton').disabled = true;
        
        updateScore(score);
    }

    async function updateScore(score) {
        try {
            await fetch('/updateScore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, taskNumber: 1 })
            });
        } catch (error) {
            console.error('Score update failed:', error);
        }
    }

    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                <span class="notification-text">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? '#f39c12' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
});
