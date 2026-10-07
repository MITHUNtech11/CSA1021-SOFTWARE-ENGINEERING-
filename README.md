# CSA1021 - Software Engineering

Course repository for CSA1021 Software Engineering coursework, laboratory assignments, assessments, and capstone project.

## Repository Structure

```text
CSA1021-SOFTWARE-ENGINEERING-/
├── assessment&activity/       # Coursework assessments and class activities
├── lab/                       # Laboratory exercises and practicals
└── Capstone/                  # Capstone Project: EventFlow (FastAPI + React)
```

---

## Capstone Project: EventFlow

**EventFlow** is a smart campus event coordination platform designed to streamline discovery, registration, QR ticket generation, and administrative operations for university events.

### Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, QR Canvas
- **Backend**: Python 3.11+, FastAPI, SQLite 3 (WAL mode), Pydantic v2, Uvicorn
- **Testing**: Pytest, HTTPX

### Quick Start

#### 1. Backend Setup
```bash
cd Capstone
python -m venv .venv
.venv\Scripts\activate   # Windows (.venv/bin/activate on Linux/macOS)
pip install -r server/requirements.txt
python server/run.py
```
Backend runs on `http://localhost:5000` with Swagger docs at `http://localhost:5000/docs`.

#### 2. Frontend Setup
```bash
cd Capstone/client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

#### 3. Running All Tests
```bash
cd Capstone
npm test
```
Runs the full 28-test pytest suite across database, API routes, attendance, registrations, and analytics.
