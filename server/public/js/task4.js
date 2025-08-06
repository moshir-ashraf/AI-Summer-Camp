// Task 4 JavaScript - Regression Challenge
document.addEventListener('DOMContentLoaded', function() {
    
    // Test cases with expected answers
    const testCases = [
        { id: 'answer1', size: 1250, expectedPrice: 375000, label: 'House D (1,250 sq ft)' },
        { id: 'answer2', size: 1750, expectedPrice: 525000, label: 'House E (1,750 sq ft)' },
        { id: 'answer3', size: 800, expectedPrice: 240000, label: 'House F (800 sq ft)' }
    ];
    
    const pricePerSqFt = 300;
    const tolerance = 10000; // Allow $10,000 margin of error
    
    // Check answers function
    function checkAnswers() {
        let correctCount = 0;
        const feedbackList = document.getElementById('feedback-list');
        const feedbackDiv = document.getElementById('feedback');
        const scoreDisplay = document.getElementById('score-display');
        
        // Clear previous feedback
        feedbackList.innerHTML = '';
        
        testCases.forEach(testCase => {
            const userInput = document.getElementById(testCase.id);
            const userAnswer = parseFloat(userInput.value.trim());
            const listItem = document.createElement('li');
            
            if (isNaN(userAnswer)) {
                listItem.className = 'incorrect';
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-exclamation-triangle"></i> Please enter a valid number. Expected: $${testCase.expectedPrice.toLocaleString()}
                `;
            } else if (Math.abs(userAnswer - testCase.expectedPrice) <= tolerance) {
                listItem.className = 'correct';
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-check-circle"></i> Correct! Your prediction: $${userAnswer.toLocaleString()} 
                    (Expected: $${testCase.expectedPrice.toLocaleString()})
                `;
                correctCount++;
            } else {
                listItem.className = 'incorrect';
                const difference = Math.abs(userAnswer - testCase.expectedPrice);
                listItem.innerHTML = `
                    <strong>${testCase.label}:</strong> 
                    <i class="fas fa-times-circle"></i> Your prediction: $${userAnswer.toLocaleString()} 
                    <br>Expected: $${testCase.expectedPrice.toLocaleString()} 
                    <br>Difference: $${difference.toLocaleString()} (Pattern: ${testCase.size} × $${pricePerSqFt} = $${testCase.expectedPrice.toLocaleString()})
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
                You correctly predicted ${correctCount} out of ${testCases.length} house prices!
            </p>
        `;
        
        // Show feedback section
        feedbackDiv.classList.remove('hidden');
        
        // Create regression plot
        createRegressionPlot();
        
        // Update user score in database
        if (score > 0) {
            updateUserScore(score);
        }
        
        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Create regression plot function
    function createRegressionPlot() {
        const ctx = document.getElementById('regressionChart').getContext('2d');
        
        // Training data points
        const trainingData = [
            { x: 1000, y: 300000, label: 'House A' },
            { x: 1500, y: 450000, label: 'House B' },
            { x: 2000, y: 600000, label: 'House C' }
        ];
        
        // Test data points (user predictions)
        const testData = [];
        testCases.forEach(testCase => {
            const userInput = document.getElementById(testCase.id);
            const userAnswer = parseFloat(userInput.value.trim());
            if (!isNaN(userAnswer)) {
                testData.push({
                    x: testCase.size,
                    y: userAnswer,
                    expected: testCase.expectedPrice,
                    label: testCase.label
                });
            }
        });
        
        // Regression line data (extend beyond data points for visualization)
        const regressionLineData = [
            { x: 500, y: 500 * pricePerSqFt },
            { x: 2500, y: 2500 * pricePerSqFt }
        ];
        
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Training Data',
                        data: trainingData,
                        backgroundColor: 'rgba(0, 229, 255, 0.8)',
                        borderColor: 'rgba(0, 229, 255, 1)',
                        borderWidth: 2,
                        pointRadius: 8,
                        pointHoverRadius: 10
                    },
                    {
                        label: 'Your Predictions',
                        data: testData,
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Expected Predictions',
                        data: testData.map(point => ({ x: point.x, y: point.expected })),
                        backgroundColor: 'rgba(76, 175, 80, 0.8)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointStyle: 'triangle'
                    },
                    {
                        label: 'Regression Line (y = 300x)',
                        data: regressionLineData,
                        type: 'line',
                        borderColor: 'rgba(156, 39, 176, 1)',
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'House Size vs Price Regression Analysis',
                        color: '#ffffff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: '#a7c7ce',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 32, 39, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#a7c7ce',
                        borderColor: 'rgba(0, 229, 255, 0.3)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const point = context.parsed;
                                const size = point.x.toLocaleString();
                                const price = point.y.toLocaleString();
                                return `${context.dataset.label}: ${size} sq ft → $${price}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'House Size (Square Feet)',
                            color: '#ffffff',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#a7c7ce',
                            callback: function(value) {
                                return value.toLocaleString() + ' sq ft';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'House Price (USD)',
                            color: '#ffffff',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: '#a7c7ce',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                }
            }
        });
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
                    taskNumber: 4,
                    score: points
                })
            });
            
        } catch (error) {
        }
    }
    
    // Event listeners
    document.getElementById('checkButton').addEventListener('click', handleButtonClick);
    
    function handleButtonClick() {
        if (userRole === 'INSTRUCTOR') {
            showSolution();
        } else {
            checkAnswers();
        }
    }

    function showSolution() {
        const feedbackList = document.getElementById('feedback-list');
        const feedbackDiv = document.getElementById('feedback');
        const scoreDisplay = document.getElementById('score-display');
        
        // Clear previous feedback
        feedbackList.innerHTML = '';
        
        testCases.forEach(testCase => {
            const listItem = document.createElement('li');
            listItem.className = 'correct';
            listItem.innerHTML = `
                <strong>${testCase.label}:</strong> 
                <i class="fas fa-info-circle"></i> Expected: $${testCase.expectedPrice.toLocaleString()}
                <br>Pattern: ${testCase.size} sq ft × $${pricePerSqFt}/sq ft = $${testCase.expectedPrice.toLocaleString()}
            `;
            feedbackList.appendChild(listItem);
        });
        
        scoreDisplay.innerHTML = `
            <h3 style="color: var(--primary-cyan); font-size: 1.5rem; margin-bottom: 0.5rem;">
                Solution displayed for instructor
            </h3>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">
                All house prices follow the pattern: Size × $${pricePerSqFt}/sq ft
            </p>
        `;
        
        // Show feedback section
        feedbackDiv.classList.remove('hidden');
        
        // Create regression plot
        createRegressionPlot();
        
        // Scroll to feedback
        feedbackDiv.scrollIntoView({ behavior: 'smooth' });
        
        document.getElementById('checkButton').disabled = true;
    }
    
    // Allow Enter key to submit from input fields
    testCases.forEach(testCase => {
        const input = document.getElementById(testCase.id);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleButtonClick();
            }
        });
    });
    
    // Unified navigation pattern - return to lobby when task is completed
    document.addEventListener('click', function(e) {
        if (e.target.id === 'nextButton' || e.target.closest('#nextButton')) {
            if (userRole === 'INSTRUCTOR') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/lobby';
            }
        }
    });
    
});
