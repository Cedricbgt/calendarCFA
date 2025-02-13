class Calendar {
    constructor(options) {
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        this.halfDayParam = options.halfDayParam;
        this.calendarHeader = options.calendarHeader;
        this.calendarBody = options.calendarBody;
        
        this.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        this.dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        
        this.startMonth = this.startDate.getMonth();
        this.startYear = this.startDate.getFullYear();
        this.endMonth = this.endDate.getMonth();
        this.endYear = this.endDate.getFullYear();
        
        this.joursFeries = {};
        this.isColoring = false;
        this.currentColor = '';
        this.isAddingComment = false;
        
        this.init();
    }

    async init() {
        await this.loadJoursFeries();
        this.createHeader();
        this.generateCalendar();
        this.setupEventListeners();
    }

    async loadJoursFeries() {
        try {
            const response = await fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json');
            this.joursFeries = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des jours fériés:', error);
        }
    }

    createHeader() {
        const headerRow = document.createElement('tr');
        let currentYear = this.startYear;
        let currentMonth = this.startMonth;

        while (currentYear < this.endYear || (currentYear === this.endYear && currentMonth <= this.endMonth)) {
            const th = document.createElement('th');
            th.colSpan = this.halfDayParam ? 2 : 1;
            th.textContent = this.monthNames[currentMonth];
            headerRow.appendChild(th);

            currentMonth++;
            if (currentMonth === 12) {
                currentMonth = 0;
                currentYear++;
            }
        }
        this.calendarHeader.appendChild(headerRow);
    }

    generateCalendar() {
        for (let day = 1; day <= 31; day++) {
            const row = document.createElement('tr');
            let currentYear = this.startYear;
            let currentMonth = this.startMonth;

            while (currentYear < this.endYear || (currentYear === this.endYear && currentMonth <= this.endMonth)) {
                if (day <= this.daysInMonth[currentMonth]) {
                    const date = new Date(currentYear, currentMonth, day);
                    const dayOfWeek = this.dayNames[date.getDay()];
                    const isWeekendOrHoliday = this.isDimanche(date) || this.isJourFerie(date);

                    if (this.halfDayParam) {
                        this.createHalfDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday);
                    } else {
                        this.createFullDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday);
                    }
                } else {
                    this.createEmptyCell(row);
                }

                currentMonth++;
                if (currentMonth === 12) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
            this.calendarBody.appendChild(row);
        }
    }

    createHalfDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday) {
        const cellMorning = document.createElement('td');
        cellMorning.textContent = `${dayOfWeek}`;
        cellMorning.classList.add('half-day', 'morning');
        this.addCellClasses(cellMorning, date, isWeekendOrHoliday);
        row.appendChild(cellMorning);

        const cellAfternoon = document.createElement('td');
        cellAfternoon.textContent = `${day}`;
        cellAfternoon.classList.add('half-day', 'afternoon');
        this.addCellClasses(cellAfternoon, date, isWeekendOrHoliday);
        row.appendChild(cellAfternoon);
    }

    createFullDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday) {
        const cell = document.createElement('td');
        cell.textContent = `${dayOfWeek} ${day}`;
        this.addCellClasses(cell, date, isWeekendOrHoliday);
        row.appendChild(cell);

        if (!isWeekendOrHoliday) {
            const commentIcon = document.createElement('div');
            commentIcon.classList.add('comment-icon');
            cell.appendChild(commentIcon);
        }
    }

    addCellClasses(cell, date, isWeekendOrHoliday) {
        if (isWeekendOrHoliday) {
            cell.classList.add('holiday');
            cell.classList.add('invalid-day');
        } else if (date >= this.startDate && date <= this.endDate) {
            cell.classList.add('valid-day');
        } else {
            cell.classList.add('invalid-day');
        }
    }

    createEmptyCell(row) {
        if (this.halfDayParam) {
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

    isJourFerie(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return dateString in this.joursFeries;
    }

    isDimanche(date) {
        return date.getDay() === 0;
    }

    showCommentPopup(comment, x, y) {
        const existingPopup = document.querySelector('.comment-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const popup = document.createElement('div');
        popup.classList.add('comment-popup');
        popup.textContent = comment;
        
        popup.style.left = `${x + 10}px`;
        popup.style.top = `${y + 10}px`;
        
        document.body.appendChild(popup);

        setTimeout(() => {
            document.addEventListener('click', function closePopup(e) {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('click', closePopup);
                }
            });
        }, 0);
    }

    setupEventListeners() {
        const enterpriseModeCheckbox = document.getElementById('enterprise-mode');
        const universityModeCheckbox = document.getElementById('university-mode');

        this.calendarBody.addEventListener('mousedown', (event) => {
            if (enterpriseModeCheckbox.checked || universityModeCheckbox.checked) {
                this.handleModeClick(event, enterpriseModeCheckbox, universityModeCheckbox);
            } else if (event.target.tagName === 'TD' && event.target.classList.contains('has-comment')) {
                const comment = event.target.getAttribute('data-comment');
                if (comment) {
                    this.showCommentPopup(comment, event.clientX, event.clientY);
                }
            }
        });

        this.calendarBody.addEventListener('mousemove', (event) => {
            if (this.isColoring && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
                if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
                    if (event.target.classList.contains('has-comment')) {
                        return;
                    }
                    event.target.style.backgroundColor = this.currentColor;
                }
            }
        });

        this.calendarBody.addEventListener('mouseup', () => {
            this.isColoring = false;
            this.isAddingComment = false;
        });

        this.setupModeCheckboxes(enterpriseModeCheckbox, universityModeCheckbox);
        this.setupHeaderClickListener(enterpriseModeCheckbox, universityModeCheckbox);
    }

    handleModeClick(event, enterpriseModeCheckbox, universityModeCheckbox) {
        if (universityModeCheckbox.checked && event.shiftKey) {
            this.handleCommentMode(event);
        } else {
            this.handleColorMode(event, enterpriseModeCheckbox, universityModeCheckbox);
        }
    }

    handleCommentMode(event) {
        this.isAddingComment = true;
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
    }

    handleColorMode(event, enterpriseModeCheckbox, universityModeCheckbox) {
        if (event.target.tagName === 'TD' && event.target.classList.contains('valid-day')) {
            if (event.target.classList.contains('has-comment')) {
                alert('Cette cellule contient un commentaire. Utilisez Shift+clic pour supprimer le commentaire avant de modifier la couleur.');
                this.isColoring = false;
                return;
            }
            
            this.isColoring = true;
            if (enterpriseModeCheckbox.checked) {
                this.currentColor = event.target.style.backgroundColor === 'lightblue' ? '' : 'lightblue';
                event.target.style.backgroundColor = this.currentColor;
            } else if (universityModeCheckbox.checked) {
                this.currentColor = event.target.style.backgroundColor === 'orange' ? '' : 'orange';
                event.target.style.backgroundColor = this.currentColor;
            }
        }
    }

    setupModeCheckboxes(enterpriseModeCheckbox, universityModeCheckbox) {
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
    }

    setupHeaderClickListener(enterpriseModeCheckbox, universityModeCheckbox) {
        this.calendarHeader.addEventListener('click', (event) => {
            if (event.target.tagName === 'TH' && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
                const columnIndex = event.target.cellIndex;
                const color = enterpriseModeCheckbox.checked ? 'lightblue' : 'orange';
                
                // Parcourir toutes les lignes du tableau
                const rows = this.calendarBody.getElementsByTagName('tr');
                for (let row of rows) {
                    const cell = this.halfDayParam ? 
                        [row.cells[columnIndex * 2], row.cells[columnIndex * 2 + 1]] : 
                        [row.cells[columnIndex]];
                        
                    cell.forEach(td => {
                        if (td && td.classList.contains('valid-day') && !td.classList.contains('has-comment') && !td.classList.contains('holiday')) {
                            td.style.backgroundColor = td.style.backgroundColor === color ? '' : color;
                        }
                    });
                }
            }
        });
    }
} 