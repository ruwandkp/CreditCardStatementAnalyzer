# Deployment Guide for Credit Card Statement Analyzer

This document outlines the deployment process for both the frontend and backend components of the Credit Card Statement Analyzer application.

## Prerequisites

- Node.js (v16 or later)
- Python (v3.8 or later)
- pip (Python package manager)
- npm (Node.js package manager)
- Git

## Backend Deployment

### Local Development Deployment

1. Clone the repository:
   ```
   git clone <repository-url>
   cd CCAnalyzer
   ```

2. Create a virtual environment:
   ```
   cd backend
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the development server:
   ```
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Production Deployment

#### Option 1: Docker Deployment

1. Build the Docker image:
   ```
   docker build -t ccanalyzer-backend ./backend
   ```

2. Run the container:
   ```
   docker run -d -p 8000:8000 --name ccanalyzer-api ccanalyzer-backend
   ```

#### Option 2: Traditional Server Deployment

1. Set up a Python environment on your server
2. Install production dependencies:
   ```
   pip install -r requirements.txt
   pip install gunicorn
   ```

3. Configure a systemd service (Linux):
   ```
   # /etc/systemd/system/ccanalyzer.service
   [Unit]
   Description=Credit Card Statement Analyzer API
   After=network.target

   [Service]
   User=<user>
   WorkingDirectory=/path/to/CCAnalyzer/backend
   ExecStart=/path/to/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. Enable and start the service:
   ```
   sudo systemctl enable ccanalyzer
   sudo systemctl start ccanalyzer
   ```

5. Set up nginx as a reverse proxy (recommended):
   ```
   # /etc/nginx/sites-available/ccanalyzer
   server {
       listen 80;
       server_name api.ccanalyzer.example.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Frontend Deployment

### Local Development Deployment

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm start
   ```

4. Access the application at `http://localhost:4200`

### Production Deployment

#### Option 1: Build and Deploy Static Files

1. Build the production version:
   ```
   cd frontend
   npm run build --prod
   ```

2. This creates a `dist/` directory with static files that can be served by any web server (Apache, Nginx, etc.)

3. Example nginx configuration:
   ```
   # /etc/nginx/sites-available/ccanalyzer-frontend
   server {
       listen 80;
       server_name ccanalyzer.example.com;
       root /path/to/CCAnalyzer/frontend/dist;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

#### Option 2: Docker Deployment

1. Build the Docker image:
   ```
   docker build -t ccanalyzer-frontend ./frontend
   ```

2. Run the container:
   ```
   docker run -d -p 80:80 --name ccanalyzer-ui ccanalyzer-frontend
   ```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DEBUG=False
ALLOWED_ORIGINS=https://ccanalyzer.example.com
PDF_STORAGE_PATH=/path/to/storage
```

### Frontend Environment Configuration

Update the environment files in `frontend/src/environments/`:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.ccanalyzer.example.com'
};
```

## Database Considerations

For production, consider replacing the in-memory database with a persistent solution:

1. SQLite (simple, file-based):
   - Update database.py to use SQLAlchemy with SQLite
   - Configure the database path in environment variables

2. PostgreSQL (recommended for production):
   - Install PostgreSQL on your server
   - Add SQLAlchemy and psycopg2 to requirements.txt
   - Update database connection string in environment variables

## Security Considerations

1. Enable HTTPS with Let's Encrypt certificates
2. Implement user authentication
3. Add CSRF protection
4. Configure proper CORS settings
5. Implement rate limiting

## Monitoring and Maintenance

1. Set up logging with rotating log files
2. Configure monitoring with tools like Prometheus/Grafana
3. Set up automated backup for the database
4. Create a maintenance schedule for updates and security patches 