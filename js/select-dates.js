document.getElementById('date-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const halfDay = document.getElementById('half-day').checked;
    if (new Date(startDate) > new Date(endDate)) {
        alert('La date de début doit être antérieure à la date de fin.');
        return;
    }
    window.location.href = `index.html?start=${startDate}&end=${endDate}&halfDay=${halfDay}`;
});