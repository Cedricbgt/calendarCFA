/**
 * Classe Calendar pour gérer l'affichage et l'interaction avec un calendrier
 */
class Calendar {
    /**
     * Constructeur de la classe Calendar
     */
    constructor(options) {
        // Dates de début et fin du calendrier
        this.startDate = options.startDate;
        this.endDate = options.endDate;
        this.halfDayParam = options.halfDayParam;
        // Éléments DOM pour l'en-tête et le corps du calendrier
        this.calendarHeader = options.calendarHeader;
        this.calendarBody = options.calendarBody;
        
        // Configuration du calendrier
        this.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        this.dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        
        // Calcul des mois et années de début/fin
        this.startMonth = this.startDate.getMonth();
        this.startYear = this.startDate.getFullYear();
        this.endMonth = this.endDate.getMonth();
        this.endYear = this.endDate.getFullYear();
        
        // État du calendrier
        this.joursFeries = {};
        this.isColoring = false;
        this.currentColor = '';
        this.isAddingComment = false;
        
        // Ajouter les tableaux pour stocker les timestamps
        this.enterprisePeriods = [];
        this.universityPeriods = [];
        
        this.quickClickMode = true; // Mode clic rapide activé par défaut
        
        this.universityTime = 0;
        this.saturdayMode = false;
        this.init();
    }

    /**
     * Initialise le calendrier
     */
    async init() {
        await this.loadJoursFeries();
        this.createHeader();
        this.generateCalendar();
        this.setupEventListeners();
        this.calculateUniversityTime();
    }

    /**
     * Charge les jours fériés depuis une API
     */
    async loadJoursFeries() {
        try {
            const response = await fetch('https://etalab.github.io/jours-feries-france-data/json/metropole.json');
            this.joursFeries = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des jours fériés:', error);
        }
    }

    /**
     * Crée l'en-tête du calendrier avec les mois
     */
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

    /**
     * Génère le corps du calendrier
     */
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

    /**
     * Calcule le numéro de la semaine pour une date donnée
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Crée une cellule pour une journée complète avec le numéro de semaine
     */
    createFullDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday) {
        const cell = document.createElement('td');
        cell.textContent = `${dayOfWeek} ${day}`;
        this.addCellClasses(cell, date, isWeekendOrHoliday);

        // Ajouter le numéro de semaine si c'est un lundi
        if (date.getDay() === 1) { // 1 = Lundi
            const weekNumber = this.getWeekNumber(date);
            const weekLabel = document.createElement('div');
            weekLabel.classList.add('week-number');
            weekLabel.textContent = `S${weekNumber}`;
            cell.appendChild(weekLabel);
        }

        if (!isWeekendOrHoliday) {
            const commentIcon = document.createElement('div');
            commentIcon.classList.add('comment-icon');
            cell.appendChild(commentIcon);
        }

        row.appendChild(cell);
    }

    /**
     * Crée une cellule pour une demi-journée avec le numéro de semaine
     */
    createHalfDayCell(row, dayOfWeek, day, date, isWeekendOrHoliday) {
        const cellMorning = document.createElement('td');
        cellMorning.textContent = `${dayOfWeek}`;
        cellMorning.classList.add('half-day', 'morning');
        this.addCellClasses(cellMorning, date, isWeekendOrHoliday);

        // Ajouter le numéro de semaine si c'est un lundi
        if (date.getDay() === 1) { // 1 = Lundi
            const weekNumber = this.getWeekNumber(date);
            const weekLabel = document.createElement('div');
            weekLabel.classList.add('week-number');
            weekLabel.textContent = `S${weekNumber}`;
            cellMorning.appendChild(weekLabel);
        }

        row.appendChild(cellMorning);

        const cellAfternoon = document.createElement('td');
        cellAfternoon.textContent = `${day}`;
        cellAfternoon.classList.add('half-day', 'afternoon');
        this.addCellClasses(cellAfternoon, date, isWeekendOrHoliday);
        row.appendChild(cellAfternoon);
    }

    /**
     * Ajoute les classes CSS appropriées à une cellule
     */
    addCellClasses(cell, date, isWeekendOrHoliday) {
        if (isWeekendOrHoliday) {
            cell.classList.add('holiday');
            cell.classList.add('invalid-day');
        } else {
            const compareDate = new Date(date.getTime());
            compareDate.setHours(0, 0, 0, 0);
            
            const compareStartDate = new Date(this.startDate.getTime());
            compareStartDate.setHours(0, 0, 0, 0);
            
            const compareEndDate = new Date(this.endDate.getTime());
            compareEndDate.setHours(0, 0, 0, 0);
            
            if (compareDate >= compareStartDate && compareDate <= compareEndDate) {
                cell.classList.add('valid-day');
                
                // Ajouter une classe spéciale pour le premier et dernier jour
                if (compareDate.getTime() === compareStartDate.getTime() || 
                    compareDate.getTime() === compareEndDate.getTime()) {
                    cell.classList.add('fixed-university');
                    cell.style.backgroundColor = '#87CEEB';
                    cell.style.cursor = 'not-allowed';
                }
            } else {
                cell.classList.add('invalid-day');
            }
        }
    }

    /**
     * Crée une cellule vide
     */
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

    /**
     * Vérifie si une date est un jour férié
     */
    isJourFerie(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        return dateString in this.joursFeries;
    }

    /**
     * Vérifie si une date est un dimanche
     */
    isDimanche(date) {
        return date.getDay() === 0 || (!this.saturdayMode && date.getDay() === 6);
    }

    /**
     * Affiche une popup de commentaire
     */
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

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        const enterpriseModeCheckbox = document.getElementById('enterprise-mode');
        const universityModeCheckbox = document.getElementById('university-mode');
        const quickClickModeCheckbox = document.getElementById('quick-click-mode');

        // Gestionnaire du mode clic rapide
        quickClickModeCheckbox.addEventListener('change', (event) => {
            this.quickClickMode = event.target.checked;
        });

        // Modifier le gestionnaire de mousedown
        this.calendarBody.addEventListener('mousedown', (event) => {
            if (this.quickClickMode) {
                if (event.button === 0) { // Clic gauche
                    universityModeCheckbox.checked = true;
                    enterpriseModeCheckbox.checked = false;
                    this.handleQuickClick(event, '#87CEEB'); // Bleu ciel
                } else if (event.button === 2) { // Clic droit
                    enterpriseModeCheckbox.checked = true;
                    universityModeCheckbox.checked = false;
                    this.handleQuickClick(event, '#90EE90'); // Vert clair
                }
            } else {
                // Mode normal avec les checkboxes
                if (enterpriseModeCheckbox.checked || universityModeCheckbox.checked) {
                    this.handleModeClick(event, enterpriseModeCheckbox, universityModeCheckbox);
                }
            }

            // Gestion des commentaires (toujours active)
            if (event.target.tagName === 'TD' && event.target.classList.contains('has-comment')) {
                const comment = event.target.getAttribute('data-comment');
                if (comment) {
                    this.showCommentPopup(comment, event.clientX, event.clientY);
                }
            }
        });

        // Empêcher le menu contextuel sur tout le document quand le mode clic rapide est actif
        document.addEventListener('contextmenu', (event) => {
            if (this.quickClickMode) {
                event.preventDefault();
            }
        });

        this.calendarBody.addEventListener('mousemove', (event) => {
            if (this.isColoring && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
                // Arrêter la coloration si on passe sur une cellule invalide ou un jour férié
                if (event.target.tagName === 'TD' && 
                    (event.target.classList.contains('holiday') || 
                    !event.target.classList.contains('valid-day'))) {
                    this.isColoring = false;
                    return;
                }

                if (event.target.tagName === 'TD' && 
                    event.target.classList.contains('valid-day') && 
                    !event.target.classList.contains('fixed-university')) {
                    if (event.target.classList.contains('has-comment')) {
                        this.isColoring = false;
                        return;
                    }
                    event.target.style.backgroundColor = this.currentColor;
                    this.calculateUniversityTime();
                }
            }
        });

        // Modifier le gestionnaire mouseup pour qu'il fonctionne sur tout le document
        document.addEventListener('mouseup', () => {
            this.isColoring = false;
            this.isAddingComment = false;
        });

        this.setupModeCheckboxes(enterpriseModeCheckbox, universityModeCheckbox);
        this.setupHeaderClickListener(enterpriseModeCheckbox, universityModeCheckbox);

        // Ajouter l'écouteur pour le bouton d'export
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportPeriods();
        });

        // Ajouter les écouteurs pour l'import
        const importBtn = document.getElementById('import-btn');
        const importFile = document.getElementById('import-file');
        
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        
        importFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                this.importPeriods(file);
            }
        });

        // Ajouter l'écouteur pour le bouton de réinitialisation
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment réinitialiser le calendrier ?')) {
                this.clearAllColors();
                // Décocher les cases à cocher
                document.getElementById('enterprise-mode').checked = false;
                document.getElementById('university-mode').checked = false;
            }
        });

        // Ajouter l'écouteur pour le mode samedi
        const saturdayModeCheckbox = document.getElementById('saturday-mode');
        saturdayModeCheckbox.addEventListener('change', (event) => {
            this.saturdayMode = event.target.checked;
            this.updateSaturdayStatus();
        });
    }

    /**
     * Gère le clic selon le mode sélectionné
     */
    handleModeClick(event, enterpriseModeCheckbox, universityModeCheckbox) {
        if (universityModeCheckbox.checked && event.shiftKey) {
            this.handleCommentMode(event);
        } else {
            this.handleColorMode(event, enterpriseModeCheckbox, universityModeCheckbox);
        }
    }

    /**
     * Gère le mode commentaire
     */
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
                    
                    const commentIcon = document.createElement('div');
                    commentIcon.classList.add('comment-icon');
                    event.target.appendChild(commentIcon);
                }
            }
        }
    }

    /**
     * Gère le mode coloration
     */
    handleColorMode(event, enterpriseModeCheckbox, universityModeCheckbox) {
        if (event.target.tagName === 'TD' && 
            event.target.classList.contains('valid-day') && 
            !event.target.classList.contains('fixed-university')) {
            
            if (event.target.classList.contains('has-comment')) {
                alert('Cette cellule contient un commentaire. Utilisez Shift+clic pour supprimer le commentaire avant de modifier la couleur.');
                this.isColoring = false;
                return;
            }
            
            this.isColoring = true;
            if (enterpriseModeCheckbox.checked) {
                this.currentColor = event.target.style.backgroundColor === '#90EE90' ? '' : '#90EE90';
                event.target.style.backgroundColor = this.currentColor;
                this.calculateUniversityTime();
            } else if (universityModeCheckbox.checked) {
                this.currentColor = event.target.style.backgroundColor === '#87CEEB' ? '' : '#87CEEB';
                event.target.style.backgroundColor = this.currentColor;
                this.calculateUniversityTime();
            }

            this.collectTimestamps();
        }
    }

    /**
     * Configure les cases à cocher de mode
     */
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

    /**
     * Configure l'écouteur de clic sur l'en-tête
     */
    setupHeaderClickListener(enterpriseModeCheckbox, universityModeCheckbox) {
        this.calendarHeader.addEventListener('click', (event) => {
            if (event.target.tagName === 'TH' && (enterpriseModeCheckbox.checked || universityModeCheckbox.checked)) {
                const columnIndex = event.target.cellIndex;
                const color = enterpriseModeCheckbox.checked ? '#90EE90' : '#87CEEB'; // Vert clair ou Bleu ciel
                
                // Vérifier l'état de coloration du mois
                const rows = this.calendarBody.getElementsByTagName('tr');
                let validCells = 0;
                let coloredCells = 0;
                
                for (let row of rows) {
                    const cell = this.halfDayParam ? 
                        [row.cells[columnIndex * 2], row.cells[columnIndex * 2 + 1]] : 
                        [row.cells[columnIndex]];
                        
                    cell.forEach(td => {
                        if (td && td.classList.contains('valid-day') && 
                            !td.classList.contains('has-comment') && 
                            !td.classList.contains('holiday') &&
                            !td.classList.contains('fixed-university')) {
                            validCells++;
                            if (td.style.backgroundColor === color) {
                                coloredCells++;
                            }
                        }
                    });
                }

                // Décider de l'action à effectuer
                const shouldClear = coloredCells === validCells;
                
                // Appliquer l'action sur toutes les cellules
                for (let row of rows) {
                    const cell = this.halfDayParam ? 
                        [row.cells[columnIndex * 2], row.cells[columnIndex * 2 + 1]] : 
                        [row.cells[columnIndex]];
                        
                    cell.forEach(td => {
                        if (td && td.classList.contains('valid-day') && 
                            !td.classList.contains('has-comment') && 
                            !td.classList.contains('holiday') &&
                            !td.classList.contains('fixed-university')) {
                            td.style.backgroundColor = shouldClear ? '' : color;
                        }
                    });
                }

                // Recalculer le temps total
                this.calculateUniversityTime();
                this.collectTimestamps();
            }
        });
    }

    /**
     * Collecte les timestamps des périodes sélectionnées
     */
    collectTimestamps() {
        const periods = {
            enterprise: [],
            university: []
        };

        const rows = this.calendarBody.getElementsByTagName('tr');
        for (let row of rows) {
            for (let cell of row.cells) {
                if (cell.classList.contains('valid-day') && !cell.classList.contains('holiday')) {
                    const date = this.getCellDate(cell);
                    if (date) {
                        if (cell.style.backgroundColor === 'lightblue') {
                            periods.enterprise.push(date.getTime());
                        } else if (cell.style.backgroundColor === 'orange') {
                            periods.university.push(date.getTime());
                        }
                    }
                }
            }
        }

        console.log('Périodes entreprise:', periods.enterprise);
        console.log('Périodes université:', periods.university);
        return periods;
    }

    /**
     * Obtient la date d'une cellule
     */
    getCellDate(cell) {
        const rowIndex = cell.parentElement.rowIndex - 1; // -1 pour l'en-tête
        const day = rowIndex + 1;
        let columnIndex = this.halfDayParam ? Math.floor(cell.cellIndex / 2) : cell.cellIndex;
        
        let currentYear = this.startYear;
        let currentMonth = this.startMonth;
        
        for (let i = 0; i < columnIndex; i++) {
            currentMonth++;
            if (currentMonth === 12) {
                currentMonth = 0;
                currentYear++;
            }
        }

        return new Date(currentYear, currentMonth, day);
    }

    /**
     * Exporte les périodes au format JSON
     */
    exportPeriods() {
        const periods = this.collectTimestamps();
        const jsonContent = JSON.stringify(periods, null, 2);
        
        // Créer un blob et un lien de téléchargement
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'periodes.json';
        
        // Déclencher le téléchargement
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Importe les périodes depuis un fichier JSON
     */
    importPeriods(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const periods = JSON.parse(e.target.result);
                this.applyPeriods(periods);
            } catch (error) {
                console.error('Erreur lors de la lecture du fichier JSON:', error);
                alert('Le fichier JSON est invalide');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Applique les périodes importées au calendrier
     */
    applyPeriods(periods) {
        // D'abord, effacer toutes les couleurs existantes
        this.clearAllColors();

        // Appliquer les couleurs pour chaque période
        const rows = this.calendarBody.getElementsByTagName('tr');
        for (let row of rows) {
            for (let cell of row.cells) {
                if (cell.classList.contains('valid-day') && !cell.classList.contains('holiday')) {
                    const date = this.getCellDate(cell);
                    if (date) {
                        const timestamp = date.getTime();
                        if (periods.enterprise.includes(timestamp)) {
                            cell.style.backgroundColor = 'lightblue';
                        } else if (periods.university.includes(timestamp)) {
                            cell.style.backgroundColor = 'orange';
                        }
                    }
                }
            }
        }
    }

    /**
     * Efface toutes les couleurs du calendrier
     */
    clearAllColors() {
        const cells = this.calendarBody.getElementsByTagName('td');
        for (let cell of cells) {
            if (cell.classList.contains('valid-day') && !cell.classList.contains('has-comment')) {
                cell.style.backgroundColor = '';
            }
        }
        this.calculateUniversityTime();
    }

    handleQuickClick(event, color) {
        if (event.target.tagName === 'TD' && 
            event.target.classList.contains('valid-day') && 
            !event.target.classList.contains('fixed-university')) {
            
            if (event.target.classList.contains('has-comment')) {
                alert('Cette cellule contient un commentaire. Utilisez Shift+clic pour supprimer le commentaire avant de modifier la couleur.');
                return;
            }
            
            this.isColoring = true;
            const wasColored = event.target.style.backgroundColor === color;
            this.currentColor = wasColored ? '' : color;
            event.target.style.backgroundColor = this.currentColor;
            
            // Recalculer le temps pour tout changement de couleur
            this.calculateUniversityTime();
            
            this.collectTimestamps();
        }
    }

    updateTimeCounter() {
        const timeElement = document.getElementById('university-time');
        timeElement.textContent = this.universityTime.toFixed(1);
    }

    /**
     * Calcule le temps total université
     */
    calculateUniversityTime() {
        let total = 0;
        const cells = this.calendarBody.getElementsByTagName('td');
        
        for (let cell of cells) {
            if ((cell.classList.contains('valid-day') || cell.classList.contains('fixed-university')) && 
                (cell.style.backgroundColor === '#87ceeb' || cell.style.backgroundColor === 'rgb(135, 206, 235)')) {
                total += this.halfDayParam ? 3.5 : 7;
            }
        }
        
        this.universityTime = total;
        this.updateTimeCounter();
    }

    /**
     * Met à jour le statut des samedis
     */
    updateSaturdayStatus() {
        const cells = this.calendarBody.getElementsByTagName('td');
        for (let cell of cells) {
            const date = this.getCellDate(cell);
            if (date && date.getDay() === 6) { // 6 = Samedi
                if (this.saturdayMode) {
                    cell.classList.remove('holiday');
                    cell.classList.remove('invalid-day');
                    if (this.isDateInRange(date)) {
                        cell.classList.add('valid-day');
                    }
                } else {
                    cell.classList.add('holiday');
                    cell.classList.add('invalid-day');
                    cell.classList.remove('valid-day');
                    cell.style.backgroundColor = ''; // Effacer la couleur si elle existe
                }
            }
        }
        this.calculateUniversityTime(); // Recalculer le temps total
    }

    /**
     * Vérifie si une date est dans la plage sélectionnée
     */
    isDateInRange(date) {
        const compareDate = new Date(date.getTime());
        compareDate.setHours(0, 0, 0, 0);
        
        const compareStartDate = new Date(this.startDate.getTime());
        compareStartDate.setHours(0, 0, 0, 0);
        
        const compareEndDate = new Date(this.endDate.getTime());
        compareEndDate.setHours(0, 0, 0, 0);
        
        return compareDate >= compareStartDate && compareDate <= compareEndDate;
    }
} 