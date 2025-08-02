document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.start-btn')?.addEventListener('click', () => {
        const taskNumber = window.nextTask || 1;
        window.location.href = `/task${taskNumber}`;
    });
});
