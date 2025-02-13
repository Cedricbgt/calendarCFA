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

// Charger le fichier JSON des jours fériés
let joursFeries = {};

// Créer une fonction pour générer le calendrier
function generateCalendar() {
    // création des jours
    for (let day = 1; day <= 31; day++) {
        const row = document.createElement('tr');
        currentYear = startYear;
        currentMonth = startMonth;
        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
            if (day <= daysInMonth[currentMonth]) {
                const date = new Date(currentYear, currentMonth, day);
                const dayOfWeek = dayNames[date.getDay()];
                const isWeekendOrHoliday = isDimanche(date) || isJourFerie(date);

                if (halfDayParam) {
                    const cellMorning = document.createElement('td');
                    cellMorning.textContent = `${dayOfWeek}`;
                    cellMorning.classList.add('half-day', 'morning');
                    if (isWeekendOrHoliday) {
                        cellMorning.classList.add('holiday');
                        cellMorning.classList.add('invalid-day');
                    } else if (date >= startDate && date <= endDate) {
                        cellMorning.classList.add('valid-day');
                    } else {
                        cellMorning.classList.add('invalid-day');
                    }
                    row.appendChild(cellMorning);

                    const cellAfternoon = document.createElement('td');
                    cellAfternoon.textContent = `${day}`;
                    cellAfternoon.classList.add('half-day', 'afternoon');
                    if (isWeekendOrHoliday) {
                        cellAfternoon.classList.add('holiday');
                        cellAfternoon.classList.add('invalid-day');
                    } else if (date >= startDate && date <= endDate) {
                        cellAfternoon.classList.add('valid-day');
                    } else {
                        cellAfternoon.classList.add('invalid-day');
                    }
                    row.appendChild(cellAfternoon);
                } else {
                    const cell = document.createElement('td');
                    cell.textContent = `${dayOfWeek} ${day}`;
                    if (isWeekendOrHoliday) {
                        cell.classList.add('holiday');
                        cell.classList.add('invalid-day');
                    } else if (date >= startDate && date <= endDate) {
                        cell.classList.add('valid-day');
                    } else {
                        cell.classList.add('invalid-day');
                    }
                    row.appendChild(cell);

                    // Ajouter l'icône de commentaire seulement si ce n'est pas un jour férié ou dimanche
                    if (!isWeekendOrHoliday) {
                        const commentIcon = document.createElement('div');
                        commentIcon.classList.add('comment-icon');
                        cell.appendChild(commentIcon);
                    }
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
}

// D'abord charger les jours fériés, puis générer le calendrier
fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json')
    .then(response => response.json())
    .then(data => {
        joursFeries = data;
        // Une fois les données chargées, on génère le calendrier
        generateCalendar();
    })
    .catch(error => {
        console.error('Erreur lors du chargement des jours fériés:', error);
        // En cas d'erreur, on génère quand même le calendrier
        generateCalendar();
    });

// Les fonctions utilitaires
function isJourFerie(date) {
    // Formatage manuel de la date pour éviter les problèmes de timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return dateString in joursFeries;
}

function getNomJourFerie(date) {
    // Même formatage pour la cohérence
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return joursFeries[dateString] || '';
}

function isDimanche(date) {
    return date.getDay() === 0;
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
                if (event.target.classList.contains('has-comment')) {
                    // Supprimer le commentaire existant
                    event.target.classList.remove('has-comment');
                    event.target.removeAttribute('data-comment');
                    const commentIcon = event.target.querySelector('.comment-icon');
                    if (commentIcon) {
                        commentIcon.remove();
                    }
                } else {
                    // Ajouter un nouveau commentaire
                    const comment = prompt('Entrez votre commentaire:');
                    if (comment) {
                        event.target.classList.add('has-comment');
                        event.target.setAttribute('data-comment', comment);
                        event.target.style.backgroundColor = 'orange';
                        
                        // Ajout de l'icône de commentaire
                        const commentIcon = document.createElement('div');
                        commentIcon.classList.add('comment-icon');
                        event.target.appendChild(commentIcon);
                    }
                }
            }
        } else {
            if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
                if (event.target.classList.contains('has-comment')) {
                    alert('Cette cellule contient un commentaire. Utilisez Shift+clic pour supprimer le commentaire avant de modifier la couleur.');
                    isColoring = false;
                    return;
                }
                
                isColoring = true;
                if (enterpriseModeCheckbox.checked) {
                    currentColor = event.target.style.backgroundColor === 'lightblue' ? '' : 'lightblue';
                    event.target.style.backgroundColor = currentColor;
                } else if (universityModeCheckbox.checked) {
                    currentColor = event.target.style.backgroundColor === 'orange' ? '' : 'orange';
                    event.target.style.backgroundColor = currentColor;
                }
            }
        }
    } else if (event.target.tagName === 'TD' && event.target.classList.contains('has-comment')) {
        // Afficher la popup si on clique sur une cellule avec commentaire
        const comment = event.target.getAttribute('data-comment');
        if (comment) {
            showCommentPopup(comment, event.clientX, event.clientY);
        }
    }
});

calendarBody.addEventListener('mousemove', (event) => {
    if (isColoring && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
        if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
            if (event.target.classList.contains('has-comment')) {
                return; // Empêche la coloration des cellules avec commentaire pendant le drag
            }
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

// Supprimons le gestionnaire d'événements en double et gardons uniquement la fonction showCommentPopup
function showCommentPopup(comment, x, y) {
    // Supprime toute popup existante
    const existingPopup = document.querySelector('.comment-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Crée la nouvelle popup
    const popup = document.createElement('div');
    popup.classList.add('comment-popup');
    popup.textContent = comment;
    
    // Positionne la popup près du curseur
    popup.style.left = `${x + 10}px`;
    popup.style.top = `${y + 10}px`;
    
    document.body.appendChild(popup);

    // Ferme la popup lors d'un clic n'importe où
    setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
            if (!popup.contains(e.target)) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        });
    }, 0);
}
