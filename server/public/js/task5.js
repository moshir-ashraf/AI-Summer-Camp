// Task 5 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task 5 loaded');
    
    // Placeholder for Task 5 functionality
    // Content will be added when task specifications are provided
    
    // Unified navigation pattern - return to lobby when task is completed
    document.addEventListener('click', function(e) {
        if (e.target.id === 'nextButton' || e.target.closest('#nextButton')) {
            window.location.href = '/lobby';
        }
    });
    
});
