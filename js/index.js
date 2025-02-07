const urlParams = new URLSearchParams(window.location.search);
const startDateParam = urlParams.get('start');
const endDateParam = urlParams.get('end');

if (!startDateParam || !endDateParam) {
    window.location.href = 'select-dates.html';
}

const startDate = new Date(startDateParam);
const endDate = new Date(endDateParam);

if (!startDate || !endDate || startDate > endDate) {
    alert('Dates invalides. Veuillez revenir à la page de sélection des dates.');
    window.location.href = 'select-dates.html';
}

const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Première lettre des jours de la semaine
const calendarHeader = document.getElementById('calendar-header');
const calendarBody = document.getElementById('calendar-body');
const enterpriseModeCheckbox = document.getElementById('enterprise-mode');
const universityModeCheckbox = document.getElementById('university-mode');

const startMonth = startDate.getMonth();
const startYear = startDate.getFullYear();
const endMonth = endDate.getMonth();
const endYear = endDate.getFullYear();

let currentYear = startYear;
let currentMonth = startMonth;

// Header avec les mois 
const headerRow = document.createElement('tr');
while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const th = document.createElement('th');
    th.textContent = monthNames[currentMonth];
    headerRow.appendChild(th);

    currentMonth++;
    if (currentMonth === 12) {
        currentMonth = 0;
        currentYear++;
    }
}
calendarHeader.appendChild(headerRow);

// création des jours
for (let day = 1; day <= 31; day++) {
    const row = document.createElement('tr');
    currentYear = startYear;
    currentMonth = startMonth;
    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const cell = document.createElement('td');
        const date = new Date(currentYear, currentMonth, day);
        if (day <= daysInMonth[currentMonth]) {
            const dayOfWeek = dayNames[date.getDay()];
            cell.textContent = `${dayOfWeek} ${day}`;
            if (date >= startDate && date <= endDate) {
                cell.classList.add('valid-day'); // Ajoutez une classe pour les jours valides
            } else {
                cell.classList.add('invalid-day'); // Ajoutez une classe pour les jours invalides
            }
        }
        row.appendChild(cell);

        currentMonth++;
        if (currentMonth === 12) {
            currentMonth = 0;
            currentYear++;
        }
    }
    calendarBody.appendChild(row);
}

// Coloration des cases
let isColoring = false;
let currentColor = '';

calendarBody.addEventListener('mousedown', (event) => {
    if (enterpriseModeCheckbox.checked || universityModeCheckbox.checked) {
        isColoring = true;
        if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
            if (enterpriseModeCheckbox.checked) {
                currentColor = event.target.style.backgroundColor === 'lightblue' ? '' : 'lightblue';
            } else if (universityModeCheckbox.checked) {
                currentColor = event.target.style.backgroundColor === 'orange' ? '' : 'orange';
            }
            event.target.style.backgroundColor = currentColor;
        }
    }
});

calendarBody.addEventListener('mousemove', (event) => {
    if (isColoring && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
        if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
            event.target.style.backgroundColor = currentColor;
        }
    }
});

calendarBody.addEventListener('mouseup', () => {
    isColoring = false;
});

// Gestion des modes
enterpriseModeCheckbox.addEventListener('change', () => {
    if (enterpriseModeCheckbox.checked) {
        universityModeCheckbox.checked = false;
    }
});

universityModeCheckbox.addEventListener('change', () => {
    if (universityModeCheckbox.checked) {
        enterpriseModeCheckbox.checked = false;
    }
});