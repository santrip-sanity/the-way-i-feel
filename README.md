# The Way I Feel - Mood Tracker App

A beautiful, interactive mood tracking application that helps you visualize your emotional journey throughout the year. Track your daily moods with emojis and see insightful summaries of your emotional patterns.

## Features

### 🗓️ Annual Calendar View
- **365-day grid layout** with a checker-style design
- **Interactive day cells** that highlight on hover
- **Today indicator** to show the current date
- **Year navigation** to view past and future years

### 😊 Mood Tracking
- **10 different mood emojis** to choose from:
  - 😄 Very Happy
  - 😊 Happy
  - 🙂 Content
  - 😐 Neutral
  - 😕 Slightly Sad
  - 😢 Sad
  - 😭 Very Sad
  - 😡 Angry
  - 😴 Tired
  - 🤒 Sick

### 📊 Analytics & Summaries
- **Weekly summaries** - Click on any day to see that week's mood distribution
- **Monthly summaries** - Click on month labels to see monthly mood trends
- **Real-time statistics**:
  - Total days tracked
  - Most common mood
  - Current tracking streak

### 💾 Data Persistence
- All your mood data is **automatically saved** in your browser's local storage
- **No account required** - your data stays private on your device
- **Works offline** - track your moods anytime

## How to Use

1. **Open the app** by opening `index.html` in your web browser
2. **Select a mood** by clicking one of the emoji buttons at the top
3. **Click on a day** in the calendar to assign that mood to that day
4. **View summaries**:
   - Click any day to see the weekly summary for that week
   - Click month labels to see monthly mood trends
5. **Navigate years** using the arrow buttons next to the year display
6. **Track your progress** with the statistics at the bottom

## Technical Details

### Built With
- **Pure HTML, CSS, and JavaScript** (no frameworks required)
- **CSS Grid** for responsive calendar layout
- **LocalStorage API** for data persistence
- **Modern CSS** with gradients, shadows, and animations

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design works on desktop, tablet, and mobile devices

### File Structure
```
the-way-i-feel/
├── index.html      # Main HTML structure
├── styles.css      # All styling and responsive design
├── script.js       # JavaScript functionality and data management
└── README.md       # This documentation
```

## Features in Detail

### Calendar Layout
The calendar displays all 365 days of the year in a grid format with 52 columns (weeks) and 7 rows (days of the week). The checker-style alternating colors make it easy to visually distinguish between days.

### Mood Selection
Simply click on a mood emoji and then click on any day to assign that mood. The day will display the emoji and change its appearance to indicate it has a mood assigned.

### Weekly Summary
When you click on any day, the weekly summary panel will show:
- The date range for that week
- Distribution of moods for that week
- Number of days tracked out of 7
- The most common mood for the week

### Monthly Summary  
Click on any month label to see:
- All moods recorded for that month
- Percentage of days tracked in the month
- The dominant mood for the month

### Statistics
The bottom statistics panel shows:
- **Days Tracked**: Total number of days with mood entries for the current year
- **Most Common Mood**: Your most frequently recorded mood emoji and name
- **Current Streak**: How many consecutive days (including today) you've been tracking

## Privacy
Your mood data is stored locally in your browser and never sent to any servers. Your emotional data remains completely private to you.

## Tips for Best Results
- Try to track your mood consistently each day
- Use the streak counter as motivation to maintain daily tracking
- Review weekly and monthly summaries to identify patterns
- Use different years to track long-term emotional trends

## Getting Started
Simply open `index.html` in your web browser and start tracking your moods today!

---

*Built with ❤️ for emotional awareness and self-reflection*