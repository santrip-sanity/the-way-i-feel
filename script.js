class MoodTracker {
    constructor() {
        this.currentYear = 2026;
        this.selectedMood = null;
        this.selectedDay = null;
        this.clearMode = false;
        this.moodData = this.loadData();
        this.weeklyChart = null;
        this.monthlyChart = null;
        this.viewMode = 'year'; // 'year' or 'month'
        this.selectedMonth = null; // 0-11 for month view
        
        this.moodEmojis = ['🤩', '😊', '😌', '🙂', '😐', '😢', '😰', '😡', '😤', '😴'];
        this.moodNames = {
            '🤩': 'Excited',
            '😊': 'Happy', 
            '😌': 'Calm',
            '🙂': 'Content',
            '😐': 'Neutral',
            '😢': 'Sad',
            '😰': 'Anxious',
            '😡': 'Angry',
            '😤': 'Frustrated',
            '😴': 'Tired'
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateCalendar();
        this.updateStats();
        this.updateYearDisplay();
        this.updateTrackingStatus();
    }

    getTodayKey() {
        const today = new Date();
        return this.formatDate(today);
    }

    updateTrackingStatus() {
        const statusElement = document.getElementById('tracking-status');
        const todayKey = this.getTodayKey(); // Always get fresh today key
        const todayData = this.moodData[this.currentYear] && this.moodData[this.currentYear][todayKey];
        
        if (todayData) {
            statusElement.textContent = '✓ Today logged';
            statusElement.className = 'tracking-status logged';
        } else {
            statusElement.textContent = '◯ Not logged today';
            statusElement.className = 'tracking-status not-logged';
        }
    }
    
    setupEventListeners() {
        // Mood selection buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(e.target.dataset.mood);
            });
        });
        
        // Clear mood button
        document.querySelector('.clear-mood-btn').addEventListener('click', () => {
            this.selectClearMode();
        });
        
        // Year navigation
        document.getElementById('prev-year').addEventListener('click', () => {
            this.changeYear(-1);
        });
        
        document.getElementById('next-year').addEventListener('click', () => {
            this.changeYear(1);
        });
        
        // Month labels - now switches to month view
        document.querySelectorAll('.month-label').forEach((label, index) => {
            label.addEventListener('click', () => {
                if (this.viewMode === 'year') {
                    this.switchToMonthView(index);
                }
            });
        });
        
        // Back to year view button
        document.getElementById('back-to-year').addEventListener('click', () => {
            this.switchToYearView();
        });
        
        // Data export/import
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.importData(e);
        });

        // Mood note input
        document.getElementById('mood-note').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveMoodWithNote();
            }
        });

        document.getElementById('mood-note').addEventListener('blur', () => {
            if (this.selectedMood && this.selectedDay) {
                this.saveMoodWithNote();
            }
        });
    }
    
    selectMood(mood) {
        // Update selected mood
        this.selectedMood = mood;
        this.clearMode = false;
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector('.clear-mood-btn').classList.remove('selected');
        document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
        
        // Show note input
        this.showNoteInput();
        
        // If a day is selected, apply the mood to that day
        // Otherwise, apply to today by default
        if (this.selectedDay) {
            this.setDayMood(this.selectedDay, mood);
        } else {
            // Auto-log to today if no specific day is selected
            const todayKey = this.getTodayKey();
            this.setDayMood(todayKey, mood);
        }
    }

    showNoteInput() {
        const container = document.getElementById('mood-note-container');
        const input = document.getElementById('mood-note');
        container.style.display = 'block';
        
        // Load existing note if available
        if (this.selectedDay) {
            const dayKey = this.selectedDay;
            const dayData = this.moodData[this.currentYear] && this.moodData[this.currentYear][dayKey];
            input.value = dayData?.note || '';
        } else {
            input.value = '';
        }
        
        // Focus on input for immediate typing
        setTimeout(() => input.focus(), 100);
    }

    saveMoodWithNote() {
        const note = document.getElementById('mood-note').value.trim();
        
        if (this.selectedMood) {
            const dayKey = this.selectedDay || this.getTodayKey();
            this.setDayMood(dayKey, this.selectedMood, note);
        }
    }
    
    selectClearMode() {
        // Update to clear mode
        this.selectedMood = null;
        this.clearMode = true;
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector('.clear-mood-btn').classList.add('selected');
        
        // If a day is selected, clear its mood
        if (this.selectedDay) {
            this.clearDayMood(this.selectedDay);
        }
    }
    
    generateCalendar() {
        if (this.viewMode === 'year') {
            this.generateYearCalendar();
        } else {
            this.generateMonthCalendar();
        }
    }
    
    generateYearCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        calendarGrid.className = 'calendar-grid';
        
        const isLeapYear = this.currentYear % 4 === 0 && (this.currentYear % 100 !== 0 || this.currentYear % 400 === 0);
        const daysInYear = isLeapYear ? 366 : 365;
        
        const startDate = new Date(this.currentYear, 0, 1);
        const startDay = startDate.getDay(); // 0 = Sunday
        
        // Add empty cells for the start of the year
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Generate all days of the year
        for (let day = 1; day <= daysInYear; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            
            const currentDate = new Date(this.currentYear, 0, day);
            const dateString = this.formatDate(currentDate);
            
            // Check if this day has a mood
            const dayData = this.moodData[this.currentYear]?.[dateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            if (mood) {
                dayCell.textContent = mood;
                dayCell.classList.add('has-mood');
                let tooltipText = `${this.formatDisplayDate(currentDate)}: ${this.moodNames[mood]}`;
                if (dayData?.note) {
                    tooltipText += ` - ${dayData.note}`;
                }
                dayCell.title = tooltipText;
            } else {
                dayCell.title = this.formatDisplayDate(currentDate);
            }
            
            // Check if it's today
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            // Add click event
            dayCell.addEventListener('click', () => {
                this.selectDay(dayCell, dateString);
            });
            
            // Add right-click to clear mood
            dayCell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.moodData[this.currentYear]?.[dateString]) {
                    this.clearDayMood(dateString);
                }
            });
            
            calendarGrid.appendChild(dayCell);
        }
    }
    
    generateMonthCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        calendarGrid.className = 'calendar-grid month-view';
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Add day labels (Monday first - European style)
        const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dayLabels.forEach(day => {
            const labelCell = document.createElement('div');
            labelCell.className = 'day-label';
            labelCell.textContent = day;
            calendarGrid.appendChild(labelCell);
        });
        
        const firstDay = new Date(this.currentYear, this.selectedMonth, 1);
        const lastDay = new Date(this.currentYear, this.selectedMonth + 1, 0);
        // Adjust for Monday-first week (0=Monday, 6=Sunday)
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;
        const daysInMonth = lastDay.getDate();
        
        // Add empty cells for days before the month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell month-day';
            dayCell.textContent = day;
            
            const currentDate = new Date(this.currentYear, this.selectedMonth, day);
            const dateString = this.formatDate(currentDate);
            
            // Check if this day has a mood
            const dayData = this.moodData[this.currentYear]?.[dateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            if (mood) {
                const moodSpan = document.createElement('span');
                moodSpan.className = 'day-mood';
                moodSpan.textContent = mood;
                dayCell.appendChild(moodSpan);
                dayCell.classList.add('has-mood');
                let tooltipText = `${this.formatDisplayDate(currentDate)}: ${this.moodNames[mood]}`;
                if (dayData?.note) {
                    tooltipText += ` - ${dayData.note}`;
                }
                dayCell.title = tooltipText;
            } else {
                dayCell.title = this.formatDisplayDate(currentDate);
            }
            
            // Check if it's today
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            // Add click event
            dayCell.addEventListener('click', () => {
                this.selectDay(dayCell, dateString);
            });
            
            // Add right-click to clear mood
            dayCell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.moodData[this.currentYear]?.[dateString]) {
                    this.clearDayMood(dateString);
                }
            });
            
            calendarGrid.appendChild(dayCell);
        }
        
        // Auto-show monthly summary for this month
        this.showMonthlySummary(this.selectedMonth);
    }
    
    selectDay(dayCell, dateString) {
        // Remove previous selection
        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Select new day
        dayCell.classList.add('selected');
        this.selectedDay = dateString;
        
        // If clear mode is active, clear the mood
        if (this.clearMode) {
            this.clearDayMood(dateString);
        }
        // If a mood is selected, apply it
        else if (this.selectedMood) {
            this.setDayMood(dateString, this.selectedMood);
        }
        
        // Show weekly summary for this day
        this.showWeeklySummary(dateString);
    }
    
    setDayMood(dateString, mood, note = '') {
        // Ensure year data exists
        if (!this.moodData[this.currentYear]) {
            this.moodData[this.currentYear] = {};
        }
        
        // Set the mood and note
        this.moodData[this.currentYear][dateString] = {
            mood: mood,
            note: note
        };
        
        // Save to localStorage
        this.saveData();
        
        // Update the calendar display
        this.generateCalendar();
        
        // Update stats
        this.updateStats();
        
        // Update tracking status
        this.updateTrackingStatus();
        
        // Clear selections
        this.clearSelections();
    }
    
    clearDayMood(dateString) {
        // Remove the mood from data
        if (this.moodData[this.currentYear]?.[dateString]) {
            delete this.moodData[this.currentYear][dateString];
        }
        
        // Save to localStorage
        this.saveData();
        
        // Update the calendar display
        this.generateCalendar();
        
        // Update stats
        this.updateStats();

        // Update tracking status
        this.updateTrackingStatus();
        
        // Clear selections
        this.clearSelections();
    }
    
    clearSelections() {
        this.selectedMood = null;
        this.selectedDay = null;
        this.clearMode = false;
        
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.querySelector('.clear-mood-btn').classList.remove('selected');
        
        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Hide note input
        document.getElementById('mood-note-container').style.display = 'none';
    }
    
    showWeeklySummary(dateString) {
        const date = this.parseDate(dateString);
        const startOfWeek = new Date(date);
        // Go to Monday (Monday-first week)
        startOfWeek.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        
        const weeklyMoods = {};
        const weekDates = [];
        
        // Collect moods for the week
        for (let i = 0; i < 7; i++) {
            const weekDay = new Date(startOfWeek);
            weekDay.setDate(startOfWeek.getDate() + i);
            const weekDateString = this.formatDate(weekDay);
            weekDates.push(weekDateString);
            
            const dayData = this.moodData[this.currentYear]?.[weekDateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            if (mood) {
                weeklyMoods[mood] = (weeklyMoods[mood] || 0) + 1;
            }
        }
        
        this.displayWeeklySummary(weeklyMoods, startOfWeek, weekDates);
    }
    
    displayWeeklySummary(weeklyMoods, startDate, weekDates) {
        const summaryEl = document.getElementById('weekly-summary');
        const chartEl = document.getElementById('weekly-chart');
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        let html = `<h4>Week of ${this.formatDisplayDate(startDate)} - ${this.formatDisplayDate(endDate)}</h4>`;
        
        if (Object.keys(weeklyMoods).length === 0) {
            html += '<p>No moods recorded this week.</p>';
            chartEl.style.display = 'none';
        } else {
            html += '<div class="mood-distribution">';
            Object.entries(weeklyMoods)
                .sort((a, b) => b[1] - a[1])
                .forEach(([mood, count]) => {
                    html += `<div class="mood-count">${mood} <span>${count}</span></div>`;
                });
            html += '</div>';
            
            // Enhanced analytics
            const totalDays = Object.values(weeklyMoods).reduce((sum, count) => sum + count, 0);
            const dominantMood = Object.entries(weeklyMoods).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            const weeklyScore = this.calculateWeeklyScore(weeklyMoods);
            
            html += `<p style="margin-top: 10px;"><strong>Tracked ${totalDays}/7 days</strong></p>`;
            html += `<p>Most common: ${dominantMood} ${this.moodNames[dominantMood]}</p>`;
            html += `<p>Week score: ${weeklyScore}/5 ${this.getScoreDescription(weeklyScore)}</p>`;
            
            // Create mini chart
            this.createWeeklyChart(weeklyMoods);
            chartEl.style.display = 'block';
        }
        
        summaryEl.innerHTML = html;
    }
    
    calculateWeeklyScore(weeklyMoods) {
        const moodScores = {
            '🤩': 5, '😊': 4, '😌': 3, '🙂': 3, '😐': 2, '😢': 1, '😰': 0, '😡': 0, '😤': 0, '😴': 1
        };
        
        let totalScore = 0;
        let totalDays = 0;
        
        Object.entries(weeklyMoods).forEach(([mood, count]) => {
            totalScore += (moodScores[mood] || 2) * count;
            totalDays += count;
        });
        
        return totalDays > 0 ? Math.round((totalScore / totalDays) * 10) / 10 : 0;
    }
    
    getScoreDescription(score) {
        if (score >= 4) return '😊';
        if (score >= 3) return '🙂';
        if (score >= 2) return '😐';
        return '😢';
    }
    
    createWeeklyChart(weeklyMoods) {
        const ctx = document.getElementById('weekly-chart');
        
        // Destroy existing chart
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }
        
        const labels = Object.keys(weeklyMoods);
        const data = Object.values(weeklyMoods);
        
        this.weeklyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0'],
                    borderWidth: 1,
                    borderColor: '#000000'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    showMonthlySummary(monthIndex) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        const monthlyMoods = {};
        const daysInMonth = new Date(this.currentYear, monthIndex + 1, 0).getDate();
        
        // Collect moods for the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, monthIndex, day);
            const dateString = this.formatDate(date);
            const dayData = this.moodData[this.currentYear]?.[dateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            
            if (mood) {
                monthlyMoods[mood] = (monthlyMoods[mood] || 0) + 1;
            }
        }
        
        this.displayMonthlySummary(monthlyMoods, monthNames[monthIndex], daysInMonth);
    }
    
    displayMonthlySummary(monthlyMoods, monthName, daysInMonth) {
        const summaryEl = document.getElementById('monthly-summary');
        const chartEl = document.getElementById('monthly-chart');
        
        let html = `<h4>${monthName} ${this.currentYear}</h4>`;
        
        if (Object.keys(monthlyMoods).length === 0) {
            html += '<p>No moods recorded this month.</p>';
            chartEl.style.display = 'none';
        } else {
            html += '<div class="mood-distribution">';
            Object.entries(monthlyMoods)
                .sort((a, b) => b[1] - a[1])
                .forEach(([mood, count]) => {
                    html += `<div class="mood-count">${mood} <span>${count}</span></div>`;
                });
            html += '</div>';
            
            // Enhanced analytics
            const totalDays = Object.values(monthlyMoods).reduce((sum, count) => sum + count, 0);
            const dominantMood = Object.entries(monthlyMoods).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            const percentage = ((totalDays / daysInMonth) * 100).toFixed(1);
            const monthlyScore = this.calculateWeeklyScore(monthlyMoods); // Same calculation works for monthly
            
            html += `<p style="margin-top: 10px;"><strong>Tracked ${totalDays}/${daysInMonth} days (${percentage}%)</strong></p>`;
            html += `<p>Most common: ${dominantMood} ${this.moodNames[dominantMood]}</p>`;
            html += `<p>Month score: ${monthlyScore}/5 ${this.getScoreDescription(monthlyScore)}</p>`;
            
            // Create mini chart
            this.createMonthlyChart(monthlyMoods);
            chartEl.style.display = 'block';
        }
        
        summaryEl.innerHTML = html;
    }
    
    createMonthlyChart(monthlyMoods) {
        const ctx = document.getElementById('monthly-chart');
        
        // Destroy existing chart
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
        }
        
        const labels = Object.keys(monthlyMoods);
        const data = Object.values(monthlyMoods);
        
        this.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: '#f0f0f0',
                    borderColor: '#000000',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#666666'
                        },
                        grid: {
                            color: '#e0e0e0'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#666666'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    updateStats() {
        const yearData = this.moodData[this.currentYear] || {};
        const totalDays = Object.keys(yearData).length;
        
        // Show better empty state messages
        if (totalDays === 0) {
            document.getElementById('days-tracked').textContent = 'Start tracking today!';
            document.getElementById('most-common-mood').textContent = 'Select a mood above ↑';
            document.getElementById('current-streak').textContent = 'Begin your journey';
            document.getElementById('best-streak').textContent = 'Your first streak awaits';
            this.updateInsights({});
            return;
        }
        
        // Days tracked
        document.getElementById('days-tracked').textContent = totalDays;
        
        // Most common mood
        const moodCounts = {};
        Object.values(yearData).forEach(dayData => {
            const mood = dayData?.mood || dayData; // Support both old and new formats
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        
        const mostCommon = Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b);
        document.getElementById('most-common-mood').textContent = `${mostCommon[0]} ${this.moodNames[mostCommon[0]]}`;
        
        // Current streak
        const streak = this.calculateStreak();
        document.getElementById('current-streak').textContent = `${streak} days`;
        
        // Best streak
        const bestStreak = this.calculateBestStreak();
        document.getElementById('best-streak').textContent = `${bestStreak} days`;
        
        // Generate insights
        this.updateInsights(yearData);
    }

    updateInsights(yearData) {
        const insightsElement = document.getElementById('insights-content');
        
        if (Object.keys(yearData).length === 0) {
            insightsElement.innerHTML = '<p>Track your mood for a few days to see personalized insights</p>';
            return;
        }

        const insights = this.generateInsights(yearData);
        insightsElement.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
    }

    generateInsights(yearData) {
        const insights = [];
        const currentMonth = new Date().getMonth() + 1;
        const monthName = new Date(2026, currentMonth - 1, 1).toLocaleDateString('en', { month: 'long' });
        
        // Get current month data
        const currentMonthData = {};
        Object.entries(yearData).forEach(([dateString, dayData]) => {
            const [month] = dateString.split('-').map(Number);
            if (month === currentMonth) {
                currentMonthData[dateString] = dayData;
            }
        });

        if (Object.keys(currentMonthData).length === 0) {
            insights.push(`Start tracking this month to see your ${monthName} patterns.`);
            return insights;
        }

        // Analyze mood frequency for current month
        const moodCounts = {};
        const dayOfWeekCounts = { weekday: 0, weekend: 0 };
        const moodsByDayType = { weekday: {}, weekend: {} };

        Object.entries(currentMonthData).forEach(([dateString, dayData]) => {
            const mood = dayData?.mood || dayData;
            const [month, day] = dateString.split('-').map(Number);
            const date = new Date(2026, month - 1, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const dayType = isWeekend ? 'weekend' : 'weekday';

            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            dayOfWeekCounts[dayType]++;
            moodsByDayType[dayType][mood] = (moodsByDayType[dayType][mood] || 0) + 1;
        });

        // Most frequent mood insight
        const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
        if (sortedMoods.length > 0) {
            const [topMood, count] = sortedMoods[0];
            const moodName = this.moodNames[topMood];
            insights.push(`You felt ${topMood} ${moodName} ${count} times this month${count > 1 ? ', making it your most common mood' : ''}.`);
        }

        // Weekday vs weekend pattern
        if (dayOfWeekCounts.weekday > 0 && dayOfWeekCounts.weekend > 0) {
            const weekdayMoods = Object.entries(moodsByDayType.weekday);
            const weekendMoods = Object.entries(moodsByDayType.weekend);
            
            if (weekdayMoods.length > 0 && weekendMoods.length > 0) {
                const topWeekdayMood = weekdayMoods.reduce((a, b) => a[1] > b[1] ? a : b)[0];
                const topWeekendMood = weekendMoods.reduce((a, b) => a[1] > b[1] ? a : b)[0];
                
                if (topWeekdayMood !== topWeekendMood) {
                    insights.push(`You tend to feel ${topWeekdayMood} on weekdays and ${topWeekendMood} on weekends.`);
                }
            }
        }

        // Activity insight based on tracking frequency
        const daysInMonth = new Date(2026, currentMonth, 0).getDate();
        const trackingRate = Object.keys(currentMonthData).length / daysInMonth;
        if (trackingRate >= 0.8) {
            insights.push(`Great consistency! You've been tracking regularly this ${monthName}.`);
        } else if (trackingRate >= 0.5) {
            insights.push(`You're building a good tracking habit this ${monthName}.`);
        }

        return insights.slice(0, 3); // Limit to 3 insights
    }
    
    updateAdvancedStats(yearData) {
        if (Object.keys(yearData).length === 0) {
            document.getElementById('happiest-day').textContent = 'Track for insights';
            document.getElementById('mood-trend').textContent = 'Coming soon';
            document.getElementById('best-streak').textContent = 'Your first streak awaits';
            return;
        }
        
        // Happiest day of the week
        const dayMoodData = this.analyzeDayOfWeekPatterns(yearData);
        document.getElementById('happiest-day').textContent = dayMoodData.happiestDay;
        
        // Mood trend analysis
        const trend = this.analyzeMoodTrend(yearData);
        document.getElementById('mood-trend').textContent = trend;
        
        // Best streak
        const bestStreak = this.calculateBestStreak(yearData);
        document.getElementById('best-streak').textContent = `${bestStreak} days`;
    }
    
    analyzeDayOfWeekPatterns(yearData) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayMoodScores = [0, 0, 0, 0, 0, 0, 0]; // Sum of mood scores for each day
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Count of entries for each day
        
        // Mood score mapping (higher = more positive)
        const moodScores = {
            '🤩': 5, '😊': 4, '😌': 3, '🙂': 3, '😐': 2, '😢': 1, '😰': 0, '😡': 0, '😤': 0, '😴': 1
        };
        
        Object.entries(yearData).forEach(([dateString, dayData]) => {
            const mood = dayData?.mood || dayData; // Support both old and new formats
            const date = new Date(dateString);
            // Adjust for Monday-first week (0=Monday, 6=Sunday)  
            const dayOfWeek = (date.getDay() + 6) % 7;
            const score = moodScores[mood] || 2;
            
            dayMoodScores[dayOfWeek] += score;
            dayCounts[dayOfWeek]++;
        });
        
        // Calculate averages and find happiest day
        let happiestDay = 'Monday';
        let highestAverage = 0;
        
        for (let i = 0; i < 7; i++) {
            if (dayCounts[i] > 0) {
                const average = dayMoodScores[i] / dayCounts[i];
                if (average > highestAverage) {
                    highestAverage = average;
                    happiestDay = dayNames[i];
                }
            }
        }
        
        return { happiestDay };
    }
    
    analyzeMoodTrend(yearData) {
        const dates = Object.keys(yearData).sort();
        if (dates.length < 7) return 'Not enough data';
        
        const moodScores = {
            '🤩': 5, '😊': 4, '😌': 3, '🙂': 3, '😐': 2, '😢': 1, '😰': 0, '😡': 0, '😤': 0, '😴': 1
        };
        
        // Calculate trend over recent entries
        const recentCount = Math.min(14, dates.length);
        const recentDates = dates.slice(-recentCount);
        const firstHalf = recentDates.slice(0, Math.floor(recentCount / 2));
        const secondHalf = recentDates.slice(Math.floor(recentCount / 2));
        
        const firstAvg = firstHalf.reduce((sum, date) => {
            const dayData = yearData[date];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            return sum + (moodScores[mood] || 2);
        }, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, date) => {
            const dayData = yearData[date];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            return sum + (moodScores[mood] || 2);
        }, 0) / secondHalf.length;
        
        const difference = secondAvg - firstAvg;
        
        if (difference > 0.5) return 'Improving ↗';
        if (difference < -0.5) return 'Declining ↘';
        return 'Stable →';
    }
    
    calculateBestStreak() {
        const yearData = this.moodData[this.currentYear] || {};
        const dates = Object.keys(yearData).sort();
        const positiveMoods = ['🤩', '😊', '😌', '🙂'];
        
        let bestStreak = 0;
        let currentStreak = 0;
        
        dates.forEach(dateString => {
            const dayData = yearData[dateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            if (positiveMoods.includes(mood)) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });
        
        return bestStreak;
    }
    
    calculateStreak() {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const dateString = this.formatDate(currentDate);
            const dayData = this.moodData[currentDate.getFullYear()]?.[dateString];
            const mood = dayData?.mood || dayData; // Support both old and new formats
            
            if (mood) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
            
            // Don't go back more than 365 days
            if (streak > 365) break;
        }
        
        return streak;
    }
    
    changeYear(direction) {
        this.currentYear += direction;
        this.updateYearDisplay();
        
        // Update month view title if in month view
        if (this.viewMode === 'month') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                               'July', 'August', 'September', 'October', 'November', 'December'];
            document.getElementById('month-view-title').textContent = `${monthNames[this.selectedMonth]} ${this.currentYear}`;
        }
        
        this.generateCalendar();
        this.updateStats();
        this.clearSummaries();
    }
    
    updateYearDisplay() {
        document.getElementById('current-year').textContent = this.currentYear;
    }
    
    clearSummaries() {
        document.getElementById('weekly-summary').innerHTML = '<p>Start tracking to see weekly insights</p>';
        document.getElementById('monthly-summary').innerHTML = '<p>Monthly patterns will appear here</p>';
        
        // Hide and destroy charts
        document.getElementById('weekly-chart').style.display = 'none';
        document.getElementById('monthly-chart').style.display = 'none';
        
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
            this.weeklyChart = null;
        }
        
        if (this.monthlyChart) {
            this.monthlyChart.destroy();
            this.monthlyChart = null;
        }
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    parseDate(dateString) {
        return new Date(dateString);
    }
    
    formatDisplayDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    switchToMonthView(monthIndex) {
        this.viewMode = 'month';
        this.selectedMonth = monthIndex;
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Update UI
        document.getElementById('month-labels').style.display = 'none';
        document.getElementById('back-to-year').style.display = 'inline-block';
        document.getElementById('month-view-title').style.display = 'block';
        document.getElementById('month-view-title').textContent = `${monthNames[monthIndex]} ${this.currentYear}`;
        
        // Generate month calendar
        this.generateCalendar();
        
        // Clear other summaries
        document.getElementById('weekly-summary').innerHTML = '<p>Click on days to see weekly summaries</p>';
        document.getElementById('weekly-chart').style.display = 'none';
    }
    
    switchToYearView() {
        this.viewMode = 'year';
        this.selectedMonth = null;
        
        // Update UI
        document.getElementById('month-labels').style.display = 'grid';
        document.getElementById('back-to-year').style.display = 'none';
        document.getElementById('month-view-title').style.display = 'none';
        
        // Generate year calendar
        this.generateCalendar();
        
        // Clear summaries
        this.clearSummaries();
    }
    
    saveData() {
        localStorage.setItem('moodTracker', JSON.stringify(this.moodData));
    }
    
    loadData() {
        const saved = localStorage.getItem('moodTracker');
        return saved ? JSON.parse(saved) : {};
    }
    
    exportData() {
        try {
            // Create export object with metadata
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                appName: 'The Way I Feel - Mood Tracker',
                data: this.moodData
            };
            
            // Convert to JSON
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Create download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create temporary download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `mood-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            console.log('Data exported successfully');
        } catch (error) {
            alert('Error exporting data. Please try again.');
            console.error('Export error:', error);
        }
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (importedData.data && typeof importedData.data === 'object') {
                        // Confirm with user
                        const confirmed = confirm(
                            'This will replace all your current mood data. Are you sure you want to continue?\n\n' +
                            'Tip: Export your current data first if you want to keep it as backup.'
                        );
                        
                        if (confirmed) {
                            // Import the data
                            this.moodData = importedData.data;
                            this.saveData();
                            
                            // Refresh the display
                            this.generateCalendar();
                            this.updateStats();
                            this.clearSummaries();
                            
                            alert('Data imported successfully!');
                            console.log('Data imported successfully');
                        }
                    } else {
                        alert('Invalid file format. Please select a valid mood tracker export file.');
                    }
                } catch (parseError) {
                    alert('Error reading file. Please make sure it\'s a valid JSON file.');
                    console.error('Parse error:', parseError);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            alert('Error importing data. Please try again.');
            console.error('Import error:', error);
        }
        
        // Clear the input
        event.target.value = '';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MoodTracker();
});