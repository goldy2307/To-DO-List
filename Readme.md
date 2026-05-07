# Todo App

Simple To-Do app with Node.js + Express backend. Supports creating, editing, deleting, and toggling tasks.

## Features

- Add tasks with due date, due time, and remarks
- Edit existing tasks
- Toggle task status (pending / done)
- Delete tasks
- Serves static frontend from `/public` folder

## Tech Stack

- Node.js
- Express.js

## Local Setup

```bash
# Clone repo
git clone https://github.com/your-username/todo-app.git
cd todo-app

# Install dependencies
npm install

# Start server
npm start
```

App runs at `http://localhost:3000`

## Project Structure

```
todo-app/
├── public/          # Frontend files (HTML, CSS, JS)
├── server.js        # Express backend
├── package.json
└── .gitignore
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Edit task |
| PATCH | `/tasks/:id/toggle` | Toggle done/pending |
| DELETE | `/tasks/:id` | Delete task |

### POST /tasks — Request Body

```json
{
  "task": "Buy groceries",
  "dueDate": "2025-05-10",
  "dueTime": "18:00",
  "remarks": "Optional note"
}