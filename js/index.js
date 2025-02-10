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
    th.colSpan = halfDayParam ? 2 : 1;
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
        if (day <= daysInMonth[currentMonth]) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = dayNames[date.getDay()];

            if (halfDayParam) {
                const cellMorning = document.createElement('td');
                cellMorning.textContent = `${dayOfWeek}`;
                cellMorning.classList.add('half-day', 'morning');
                if (date >= startDate && date <= endDate) {
                    cellMorning.classList.add('valid-day');
                } else {
                    cellMorning.classList.add('invalid-day');
                }
                row.appendChild(cellMorning);

                const cellAfternoon = document.createElement('td');
                cellAfternoon.textContent = `${day}`;
                cellAfternoon.classList.add('half-day', 'afternoon');
                if (date >= startDate && date <= endDate) {
                    cellAfternoon.classList.add('valid-day');
                } else {
                    cellAfternoon.classList.add('invalid-day');
                }
                row.appendChild(cellAfternoon);
            } else {
                const cell = document.createElement('td');
                cell.textContent = `${dayOfWeek} ${day}`;
                if (date >= startDate && date <= endDate) {
                    cell.classList.add('valid-day');
                } else {
                    cell.classList.add('invalid-day');
                }
                row.appendChild(cell);

                // Ajouter l'icône de commentaire
                const commentIcon = document.createElement('div');
                commentIcon.classList.add('comment-icon');
                cell.appendChild(commentIcon);
            }
        } else {
            if (halfDayParam) {
                const cellMorning = document.createElement('td');
                cellMorning.classList.add('empty-day');
                row.appendChild(cellMorning);

                const cellAfternoon = document.createElement('td');
                cellAfternoon.classList.add('empty-day');
                row.appendChild(cellAfternoon);
            } else {
                const cell = document.createElement('td');
                cell.classList.add('empty-day');
                row.appendChild(cell);
            }
        }

        currentMonth++;
        if (currentMonth === 12) {
            currentMonth = 0;
            currentYear++;
        }
    }
    calendarBody.appendChild(row);
}

// Coloration des cases et ajout de commentaires
let isColoring = false;
let currentColor = '';
let isAddingComment = false;

calendarBody.addEventListener('mousedown', (event) => {
    if (enterpriseModeCheckbox.checked || universityModeCheckbox.checked) {
        if (universityModeCheckbox.checked && event.shiftKey) {
            isAddingComment = true;
            if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
                const comment = prompt('Entrez votre commentaire:');
                if (comment) {
                    event.target.classList.add('has-comment');
                    event.target.setAttribute('data-comment', comment);
                }
            }
        } else {
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
    isAddingComment = false;
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