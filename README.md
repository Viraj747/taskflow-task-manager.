
# TaskFlow — Task Management Dashboard

TaskFlow is a responsive task management web application built using HTML5, CSS3, and vanilla JavaScript. It helps users organize tasks, track progress, and manage priorities through a clean dashboard interface.

## Features

- Dashboard with total, pending, in-progress, and completed task counts
- Task creation, editing, and deletion
- Task status and priority management
- Search by task title
- Combined status and priority filters
- Overall task completion progress
- Form validation and helpful error messages
- Persistent task data using browser LocalStorage
- Responsive layout for desktop and mobile devices
- Empty states when no tasks match the selected filters

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage
- Git and GitHub
- GitHub Pages (deployment, when enabled)

## Project Structure

```text
taskflow-task-manager/
├── index.html
├── style.css
├── script.js
├── README.md
└── screenshots/
    └── dashboard.png
```

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/taskflow-task-manager.git
   ```

2. Open the project folder.

3. Open `index.html` in your browser.

No framework, package installation, or backend is required.

## Screenshot

![TaskFlow dashboard](screenshots/dashboard.png)

## Data Storage

TaskFlow uses browser LocalStorage to save tasks. Data remains available in the same browser and origin after refreshing the page. It is not synchronized across devices.

## Future Improvements

- Improve keyboard navigation and accessibility
- Add task sorting and overdue-task indicators
- Add automated tests
- Refine the dashboard UI and user experience

## Author

Built as a frontend portfolio project to practise web development fundamentals.
