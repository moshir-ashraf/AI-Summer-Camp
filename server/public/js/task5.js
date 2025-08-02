// Task 5 JavaScript - Natural Language Processing Challenge
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task 5 - NLP Sentiment Analysis loaded');
    
    // Test cases with expected answers
    const testCases = [
        { 
            id: 'answer1', 
            expectedAnswer: 'Mixed', 
            label: 'Review A',
            explanation: 'This review contains both positive elements ("arrived quickly", "easy to use") and negative elements ("surprisingly short" battery life). The negative aspect impacts the overall experience, making it mixed sentiment.'
        },
        { 
            id: 'answer2', 
            expectedAnswer: 'Positive', 
            label: 'Review B',
            explanation: 'Strong positive language throughout: "Outstanding", "exceeded expectations", "highly recommend". All sentiment indicators are positive with enthusiastic tone.'
        },
        { 
            id: 'answer3', 
            expectedAnswer: 'Negative', 
            label: 'Review C',
            explanation: 'Extremely negative language: "Worst", "waste of money", "doesn\'t work", "Avoid". Strong negative sentiment with warning language.'
        }
    ];
    
    // Check answers function
    function checkAnswers() {
        let correctCount = 0;
        const feedbackList = document.getElementById('feedback-list');
        const feedbackDiv = document.getElementById('feedback');
        const scoreDisplay = document.getElementById('score-display');
        
        // Clear previous feedback
        feedbackList.innerHTML = '';
        
        testCases.forEach(testCase => {
            const userSelect = document.getElementById(testCase.id);
            const userAnswer = userSelect.value.trim();
            const listItem = document.createElement('li');
            
            if (userAnswer === '') {
                listItem.className = 'incorrect';
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-exclamation-triangle"></i> Please select a sentiment. Expected: ${testCase.expectedAnswer}
                    <br><small>${testCase.explanation}</small>
                `;
            } else if (userAnswer === testCase.expectedAnswer) {
                listItem.className = 'correct';
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-check-circle"></i> Correct! You identified it as ${userAnswer}.
                    <br><small>${testCase.explanation}</small>
                `;
                correctCount++;
            } else {
                listItem.className = 'incorrect';
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-times-circle"></i> You selected "${userAnswer}" but the correct answer is "${testCase.expectedAnswer}".
                    <br><small>${testCase.explanation}</small>
                `;
            }
            
            feedbackList.appendChild(listItem);
        });
        
        // Calculate score (3 points per correct answer)
        const score = correctCount * 3;
        const maxScore = testCases.length * 3;
        
        scoreDisplay.innerHTML = `
            <h3 style="color: var(--primary-cyan); font-size: 1.5rem; margin-bottom: 0.5rem;">
                Score: ${score}/${maxScore} points
            </h3>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">
                You correctly analyzed ${correctCount} out of ${testCases.length} reviews!
            </p>
        `;
        
        // Show feedback section
        feedbackDiv.classList.remove('hidden');
        
        // Update user score in database
        if (score > 0) {
            updateUserScore(score);
        }
        
        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update score function
    async function updateUserScore(points) {
        try {
            const response = await fetch('/updateScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    taskNumber: 5,
                    score: points
                })
            });
            
            if (response.ok) {
                console.log('Score updated successfully');
            } else {
                console.error('Failed to update score');
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    }
    
    // Event listeners
    document.getElementById('checkButton').addEventListener('click', checkAnswers);
    
    // Allow Enter key to submit from select fields
    testCases.forEach(testCase => {
        const select = document.getElementById(testCase.id);
        select.addEventListener('change', function() {
            // Optional: Auto-submit when all answers are selected
            const allAnswered = testCases.every(tc => document.getElementById(tc.id).value !== '');
            if (allAnswered) {
                // Could auto-submit here if desired
            }
        });
    });
    
    // Unified navigation pattern - return to lobby when task is completed
    document.addEventListener('click', function(e) {
        if (e.target.id === 'nextButton' || e.target.closest('#nextButton')) {
            window.location.href = '/lobby';
        }
    });
    
});
