# Todo List App

A simple full-stack Todo List app built with Flask (backend) and vanilla JS + HTML/CSS (frontend).

## Tech Stack

- **Backend:** Python, Flask, SQLAlchemy, SQLite
- **Frontend:** HTML, CSS, JavaScript

## Features

- Add, edit, and delete tasks
- Mark tasks as complete
- Data persists via SQLite database

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/todo-list-app.git
cd todo-list-app

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the app
python backend/run.py
```

Then open `frontend/index.html` in your browser.

## Project Structure

```
todo-list-app/
├── backend/        # Flask API
├── frontend/       # HTML, CSS, JS
├── docs/           # Documentation
└── README.md
```

## License

MIT