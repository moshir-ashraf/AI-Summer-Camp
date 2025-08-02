// Task 4 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task 4 loaded');
    
    // Placeholder for Task 4 functionality
    // Content will be added when task specifications are provided
    
    // Unified navigation pattern - return to lobby when task is completed
    document.addEventListener('click', function(e) {
        if (e.target.id === 'nextButton' || e.target.closest('#nextButton')) {
            window.location.href = '/lobby';
        }
    });
    
});
