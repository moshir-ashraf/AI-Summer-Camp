document.addEventListener('DOMContentLoaded', function() {
    // Quiz answers with more challenging explanations
    const answers = {
        q1: 'a',    // Only 15 is divisible by 15 (at position 1)
        q2: 'a',    // Two scores (92, 96) are greater than 90
        q3: 'true', // Dictionary lookup is O(1), list searching is O(n)
        q4: 'b',    // Using 'or' provides fallback for None/empty values
        q5: 'b',    // Early termination with break is most efficient
        q6: 'c',    // Local variables raise NameError when accessed outside scope
        q7: 'a',    // [1::2] starts at index 1, every 2nd element: 92, 96, 91
        q8: 'true', // .get() returns 0 if key missing, direct access would error
        q9: 'b',    // Single if with OR operators is cleanest
        q10: 'b',   // While loop with validation provides robust error handling
        q11: 'b',   // Return tuple when values are logically related
        q12: 'b',   // range(10, 0, -1) gives 10,9,8,7,6,5,4,3,2,1
        q13: 'true', // List comprehension is equivalent to manual loop
        q14: 'b',   // Tuples are more memory efficient than lists
        q15: 'b',   // Safer string splitting with validation
        q16: 'c',   // sorted(set()) removes duplicates and orders for clean [-2]
        q17: 'false', // Methods provide encapsulation and validation
        q18: 'a',   // Keys 'a' and 'c' have odd values (1,3), prints "AC"
        q19: 'b',   // Grade 85 falls into the >= 80 condition, which assigns "B"
        q20: 'd'    // Both approaches are valid depending on complexity
    };

    // More sophisticated explanations for challenging questions
    const explanations = {
        q1: 'The code uses enumerate() to get both index and value, then checks if the number is divisible by 15 (remainder 0). Only 15 at index 1 meets this condition.',
        q2: 'The code iterates through scores [85, 92, 78, 96, 89] and appends scores > 90 to high_scores. Only 92 and 96 qualify, so len(high_scores) = 2.',
        q3: 'Dictionaries provide O(1) average lookup time by item name, while lists require O(n) searching. For frequent updates, dictionaries are significantly more efficient.',
        q4: 'Using "or" provides a fallback value when user_name is None or empty. This prevents errors and handles missing data gracefully.',
        q5: 'Early termination with break stops searching once the first match is found, avoiding unnecessary iterations through remaining items.',
        q6: 'Variables created inside functions have local scope. Trying to access them outside raises a NameError because they don\'t exist in the global namespace.',
        q7: 'Slice [1::2] starts at index 1 (value 92) and takes every 2nd element: positions 1,3,5 contain values 92, 96, 91.',
        q8: 'The .get() method safely returns a default value (0) if the key doesn\'t exist, preventing KeyError exceptions that direct access would raise.',
        q9: 'A single if statement with OR operators clearly expresses the business logic and is most readable for future maintenance.',
        q10: 'Combining while loop with validation provides robust error handling, continuing to ask until valid input is received.',
        q11: 'Return tuples when values are conceptually related and typically used together, like coordinates or min/max values.',
        q12: 'range(10, 0, -1) generates: 10,9,8,7,6,5,4,3,2,1. Start=10, stop=0 (exclusive), step=-1 for countdown.',
        q13: 'List comprehensions are syntactic sugar for the traditional for-loop-with-append pattern, producing identical results more concisely.',
        q14: 'Tuples use less memory overhead than lists because they\'re immutable. For fixed data like coordinates, this saves memory.',
        q15: 'Splitting with validation handles edge cases like multiple @ symbols or missing @ symbols, preventing index errors.',
        q16: 'Using set() removes duplicates, sorted() orders them, and [-2] gets second highest. This handles edge cases elegantly.',
        q17: 'Methods like deposit() and withdraw() can validate amounts, log transactions, and maintain data integrity. Direct access bypasses these safeguards.',
        q18: 'The loop checks each value: 1 (odd) → append "A", 2 (even) → skip, 3 (odd) → append "C". Joining gives "AC".',
        q19: 'Grade 85 doesn\'t meet the >= 90 condition, but does meet >= 80, so it executes the elif block and assigns "B".',
        q20: 'Both functional decomposition and OOP are valid. Choice depends on complexity: simple tasks favor functions, complex state management favors classes.'
    };

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
        for (let i = 1; i <= 20; i++) {
            const questionKey = `q${i}`;
            const correct = answers[questionKey];
            
            const item = document.createElement('li');
            item.className = 'feedback-item correct';

            let answerText = '';
            if (correct === 'true' || correct === 'false') {
                answerText = correct === 'true' ? 'True' : 'False';
            } else {
                // Find the radio button to get the text
                const radioButton = document.querySelector(`input[name="${questionKey}"][value="${correct}"]`);
                if (radioButton) {
                    answerText = radioButton.parentElement.textContent.trim();
                }
            }

            item.innerHTML = `<i class="fas fa-info-circle"></i> Question ${i}: ${answerText}`;
            
            // Add explanation for instructor too
            if (explanations[questionKey]) {
                const explanation = document.createElement('div');
                explanation.className = 'explanation-text';
                explanation.innerHTML = `<strong>Reasoning:</strong> ${explanations[questionKey]}`;
                item.appendChild(explanation);
            }
            
            feedbackList.appendChild(item);
        }

        document.getElementById('score-display').innerHTML = `All solutions displayed for instructor`;
        document.getElementById('feedback').classList.remove('hidden');
        document.getElementById('checkButton').disabled = true;
    }

    function checkAnswers() {
        const feedbackList = document.getElementById('feedback-list');
        feedbackList.innerHTML = '';
        let score = 0;

        // Check all questions are answered
        for (let i = 1; i <= 20; i++) {
            const questionKey = `q${i}`;
            const selectedAnswer = document.querySelector(`input[name="${questionKey}"]:checked`);
            if (!selectedAnswer) {
                return alert(`Please answer Question ${i} before submitting.`);
            }
        }

        // Check each answer with thoughtful feedback
        for (let i = 1; i <= 20; i++) {
            const questionKey = `q${i}`;
            const selectedAnswer = document.querySelector(`input[name="${questionKey}"]:checked`);
            const userAnswer = selectedAnswer.value;
            const correct = answers[questionKey];
            
            const item = document.createElement('li');
            item.className = 'feedback-item';

            if (userAnswer === correct) {
                score += 1;
                item.className += ' correct';
                item.innerHTML = `<i class="fas fa-check-circle"></i> Question ${i}: Excellent thinking! (+1)`;
            } else {
                item.className += ' incorrect';
                let correctAnswerText = '';
                if (correct === 'true' || correct === 'false') {
                    correctAnswerText = correct === 'true' ? 'True' : 'False';
                } else {
                    const correctRadio = document.querySelector(`input[name="${questionKey}"][value="${correct}"]`);
                    if (correctRadio) {
                        correctAnswerText = correctRadio.parentElement.textContent.trim();
                    }
                }
                
                item.innerHTML = `<i class="fas fa-times-circle"></i> Question ${i}: Not quite. Better answer: ${correctAnswerText}`;
            }
            
            // Always add explanation to deepen understanding
            if (explanations[questionKey]) {
                const explanation = document.createElement('div');
                explanation.className = 'explanation-text';
                explanation.innerHTML = `<strong>Key Insight:</strong> ${explanations[questionKey]}`;
                item.appendChild(explanation);
            }

            feedbackList.appendChild(item);
        }

        const percentage = Math.round((score / 20) * 100);
        let performanceMessage = '';
        if (percentage >= 90) performanceMessage = '🌟 Outstanding logical thinking!';
        else if (percentage >= 80) performanceMessage = '🎯 Strong problem-solving skills!';
        else if (percentage >= 70) performanceMessage = '💪 Good analytical approach!';
        else if (percentage >= 60) performanceMessage = '📚 Keep practicing these concepts!';
        else performanceMessage = '🔄 Review the concepts and try again!';

        document.getElementById('score-display').innerHTML = `Your Score: ${score}/20 points (${percentage}%)<br><span style="font-size: 0.9em; color: var(--accent-gold);">${performanceMessage}</span>`;
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
