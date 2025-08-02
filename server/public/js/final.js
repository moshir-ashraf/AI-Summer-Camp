// Final page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add a gentle animation to the celebration icon
    const celebrationIcon = document.querySelector('.celebration-icon');
    if (celebrationIcon) {
        celebrationIcon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(15deg)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        celebrationIcon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    }
    
    // Add sparkle effect to the trophy
    const trophy = document.querySelector('.celebration-icon i');
    if (trophy) {
        setInterval(() => {
            trophy.style.textShadow = `
                0 0 30px rgba(255, 215, 0, ${0.6 + Math.random() * 0.4}),
                0 0 40px rgba(255, 215, 0, ${0.3 + Math.random() * 0.3}),
                0 0 50px rgba(255, 215, 0, ${0.2 + Math.random() * 0.2})
            `;
        }, 1000);
    }
    
    // Animate the final score
    const scoreValue = document.querySelector('.score-value');
    if (scoreValue) {
        const finalScore = parseInt(scoreValue.textContent);
        let currentScore = 0;
        const increment = Math.ceil(finalScore / 50);
        
        const countUp = setInterval(() => {
            currentScore += increment;
            if (currentScore >= finalScore) {
                currentScore = finalScore;
                clearInterval(countUp);
            }
            scoreValue.textContent = `${currentScore} points`;
        }, 30);
    }
});
