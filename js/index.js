// Vérification des paramètres d'URL
const urlParams = new URLSearchParams(window.location.search);
const startDateParam = urlParams.get('start');
const endDateParam = urlParams.get('end');
const halfDayParam = urlParams.get('halfDay') === 'true';

if (!startDateParam || !endDateParam) {
    window.location.href = 'select-dates.html';
}

const startDate = new Date(startDateParam);
const endDate = new Date(endDateParam);

if (!startDate || !endDate || startDate > endDate) {
    alert('Dates invalides. Veuillez revenir à la page de sélection des dates.');
    window.location.href = 'select-dates.html';
}

// Initialisation du calendrier
const calendar = new Calendar({
    startDate,
    endDate,
    halfDayParam,
    calendarHeader: document.getElementById('calendar-header'),
    calendarBody: document.getElementById('calendar-body')
});




