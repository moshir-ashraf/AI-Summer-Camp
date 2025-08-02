document.addEventListener('DOMContentLoaded', function() {
    const answers = {
        answer1: 'Firestone',
        answer2: 'Waterleaf', 
        answer3: 'Windwhisper'
    };

    // Correct mixture analysis for question 4
    const correctMixture = {
        first: 'Waterleaf',  // Higher probability 
        second: 'Windwhisper' // Lower probability
    };

    document.getElementById('checkButton').addEventListener('click', () => {
        let score = 0;
        const feedback = [];

        // Check first three answers
        for (const [id, correctAnswer] of Object.entries(answers)) {
            const userAnswer = document.getElementById(id).value;
            if (userAnswer === correctAnswer) {
                score += 2;
                feedback.push({ id, status: 'correct', message: `Mystery Ingredient ${id.slice(-1)}: Correct! It's ${correctAnswer} (+2 points)` });
            } else if (userAnswer === '') {
                feedback.push({ id, status: 'empty', message: `Mystery Ingredient ${id.slice(-1)}: No classification selected` });
            } else {
                feedback.push({ id, status: 'incorrect', message: `Mystery Ingredient ${id.slice(-1)}: Incorrect. It should be ${correctAnswer}, not ${userAnswer}` });
            }
        }

        // Check mixture analysis (question 4)
        const mixture1 = document.getElementById('mixture1').value;
        const mixture2 = document.getElementById('mixture2').value;
        
        if (mixture1 === correctMixture.first && mixture2 === correctMixture.second) {
            score += 2;
            feedback.push({ id: 'mixture', status: 'correct', message: `Mystery Ingredient D: Perfect analysis! Waterleaf (higher probability) + Windwhisper (lower probability) (+2 points)` });
        } else if (mixture1 === '' || mixture2 === '') {
            feedback.push({ id: 'mixture', status: 'empty', message: `Mystery Ingredient D: Incomplete mixture analysis` });
        } else if (mixture1 === mixture2) {
            feedback.push({ id: 'mixture', status: 'incorrect', message: `Mystery Ingredient D: You selected the same class twice. Mixed features suggest two different classes.` });
        } else {
            const hasCorrectClasses = (mixture1 === correctMixture.first || mixture1 === correctMixture.second) && 
                                    (mixture2 === correctMixture.first || mixture2 === correctMixture.second);
            if (hasCorrectClasses) {
                score += 1; // Partial credit for identifying the right classes but wrong priority
                feedback.push({ id: 'mixture', status: 'partial', message: `Mystery Ingredient D: Good identification of the two classes, but Waterleaf should have higher probability than Windwhisper (+1 point)` });
            } else {
                feedback.push({ id: 'mixture', status: 'incorrect', message: `Mystery Ingredient D: The blue-gray and water-air features suggest a mixture of Waterleaf and Windwhisper` });
            }
        }

        // Display results
        document.getElementById('score-display').textContent = `Score: ${score}/8 points`;
        
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
                body: JSON.stringify({ score, taskNumber: 3 })
            });
        } catch (error) {
            console.error('Score update failed:', error);
        }
    }
});
