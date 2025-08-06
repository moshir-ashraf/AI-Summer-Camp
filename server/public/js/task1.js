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
                return alert('Please answer all questions.');
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
});
