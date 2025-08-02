document.addEventListener('DOMContentLoaded', function() {
    const answers = {
        answer1: 'Egyptian',
        answer2: 'Mayan', 
        answer3: 'Egyptian'
    };

    document.getElementById('checkButton').addEventListener('click', () => {
        let score = 0;
        const feedback = [];

        // Check each answer
        for (const [id, correctAnswer] of Object.entries(answers)) {
            const userAnswer = document.getElementById(id).value;
            if (userAnswer === correctAnswer) {
                score += 2;
                feedback.push({ id, status: 'correct', message: `Pyramid ${id.slice(-1)}: Correct! (+2 points)` });
            } else if (userAnswer === '') {
                feedback.push({ id, status: 'empty', message: `Pyramid ${id.slice(-1)}: No answer selected` });
            } else {
                feedback.push({ id, status: 'incorrect', message: `Pyramid ${id.slice(-1)}: Incorrect. Should be ${correctAnswer} Pyramid` });
            }
        }

        // Display results
        document.getElementById('score-display').textContent = `Score: ${score}/6 points`;
        
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = '';
        
        feedback.forEach(item => {
            const li = document.createElement('li');
            li.className = `feedback-item ${item.status}`;
            li.textContent = item.message;
            feedbackList.appendChild(li);
        });

        // Show feedback section
        document.getElementById('feedback').classList.remove('hidden');
        document.getElementById('checkButton').disabled = true;
        
        // Update score in database
        updateScore(score);
    });

    // Add next button functionality
    document.addEventListener('click', function(e) {
        if (e.target.id === 'nextButton' || e.target.closest('#nextButton')) {
            window.location.href = '/lobby';
        }
    });

    async function updateScore(score) {
        try {
            await fetch('/updateScore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score, taskNumber: 2 })
            });
        } catch (error) {
            console.error('Score update failed:', error);
        }
    }
});
