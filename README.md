# FACE-SECURE

## Overview
FACE-SECURE is a modern web‑based facial‑recognition security solution that provides **secure, password‑less authentication** using real‑time face verification and anti‑spoofing (liveness) detection. The application combines a lightweight backend API with a responsive frontend to deliver a seamless user experience across desktop and mobile devices.

## Features
- **Password‑less login** – Users authenticate by simply presenting their face.
- **Liveness detection** – Built‑in anti‑spoofing to ensure the presented face is from a live person (prevents photos, videos, or masks).
- **Secure API** – FastAPI backend with JWT token handling and environment‑based secret management.
- **Responsive UI** – Modern, glass‑morphism styled frontend built with Vite/React (or plain JavaScript) that works on all screen sizes.
- **Environment‑driven configuration** – API keys and secrets are stored in `.env` files and loaded via Vite, keeping credentials out of source control.
- **Docker / Railway ready** – Pre‑configured `Procfile`, `railway.toml`, and Docker support for easy deployment.
- **Extensible design** – Clear separation of concerns between `frontend/` and `backend/` makes it easy to add new authentication methods or integrate with existing services.

## Purpose
The primary goal of FACE-SECURE is to **eliminate password‑based attacks** by leveraging biometric authentication while maintaining user privacy and data security. It demonstrates how to:
1. Capture webcam video streams in the browser.
2. Process facial embeddings on the server side.
3. Detect liveness to protect against replay attacks.
4. Issue short‑lived JWT tokens for session management.

## Installation
```bash
# Clone the repository
git clone <repo-url>
cd FACE-SECURE

# Backend setup (Python)
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp railway-backend.env.example .env
# Edit .env with your API keys

# Frontend setup (Node.js)
npm install
cp .env.example .env   # if needed for Vite variables

# Run development servers
npm run dev   # starts Vite dev server (frontend)
uvicorn backend.main:app --reload   # starts FastAPI backend
```

## Usage
1. Open the frontend URL (usually `http://localhost:5173`).
2. Click **Register** and follow the on‑screen instructions to capture your face data.
3. After registration, use **Login** – the webcam will activate, perform face verification and liveness check, and log you in automatically.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Ensure code passes existing tests (`npm test` and `pytest`).
4. Open a pull request with a clear description of changes.

## License
This project is licensed under the MIT License – see the `LICENSE` file for details.
