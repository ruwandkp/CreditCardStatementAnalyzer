# Credit Card Statement Analyzer - Project Structure

## Directory Structure

```
CCAnalyzer/
├── backend/                # Python FastAPI backend
│   ├── database/           # Database module
│   │   ├── __init__.py
│   │   └── database.py     # In-memory database implementation
│   ├── models/             # Data models
│   │   ├── __init__.py
│   │   └── models.py       # Pydantic models for API
│   ├── services/           # Business logic services
│   │   ├── __init__.py
│   │   ├── category_service.py  # Transaction categorization logic
│   │   └── pdf_service.py  # PDF processing logic
│   ├── temp_pdfs/          # Directory for storing uploaded PDFs
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # Angular frontend
│   ├── src/                # Source files
│   │   ├── app/            # Application code
│   │   │   ├── core/       # Core functionality
│   │   │   │   ├── models/ # TypeScript interfaces
│   │   │   │   └── services/ # API services
│   │   │   ├── modules/    # Feature modules
│   │   │   │   ├── analytics/       # Analytics component
│   │   │   │   ├── dashboard/       # Dashboard component
│   │   │   │   ├── statement-list/  # Statement list component
│   │   │   │   ├── statement-viewer/ # Statement viewer component
│   │   │   │   ├── transaction-list/ # Transaction list component
│   │   │   │   └── upload/          # Upload component
│   │   │   ├── shared/     # Shared components
│   │   │   │   └── navigation/  # Navigation component
│   │   │   ├── app.component.ts # Root component
│   │   │   ├── app.module.ts    # Root module
│   │   │   └── app-routing.module.ts # Routing configuration
│   │   ├── assets/         # Static assets
│   │   ├── environments/   # Environment configuration
│   │   ├── index.html      # Main HTML file
│   │   ├── main.ts         # Main entry point
│   │   └── styles.scss     # Global styles
│   ├── angular.json        # Angular CLI configuration
│   ├── package.json        # NPM dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── docs/                   # Documentation
│   ├── images/             # Screenshots for documentation
│   ├── architecture.md     # Architecture documentation
│   ├── project_structure.md # This file
│   └── user_guide.md       # User guide
│
├── Bills/                  # Sample credit card statements
│   ├── February 2025.pdf
│   └── March 2025.pdf
│
└── README.md               # Project overview
```

## Key Files and Their Purpose

### Backend

- **main.py**: The entry point for the FastAPI application, defining API routes and handling HTTP requests.
- **database/database.py**: Implements an in-memory database for storing statement and transaction data.
- **models/models.py**: Defines Pydantic data models for statements and transactions.
- **services/pdf_service.py**: Handles PDF processing, including extraction of transaction data.
- **services/category_service.py**: Handles categorization of transactions using rule-based and ML approaches.

### Frontend

- **app.module.ts**: Main Angular module that imports all required features and dependencies.
- **app-routing.module.ts**: Defines the application's routes.
- **core/models/statement.model.ts**: TypeScript interfaces for statement and transaction data.
- **core/services/api.service.ts**: Service for communicating with the backend API.
- **modules/**: Contains feature components like dashboard, statements, analytics, etc.
- **shared/navigation/navigation.component.ts**: Navigation component for the app sidebar.

### Documentation

- **architecture.md**: Technical documentation of the system architecture, with diagrams.
- **user_guide.md**: User-focused guide on how to use the application.
- **project_structure.md**: Overview of the project structure (this file).

## Development Workflow

1. Start the backend server:
   ```
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm install
   npm start
   ```

3. Access the application at http://localhost:4200/

## Build and Deployment

### Backend

The backend can be deployed as a standalone FastAPI application. For production, consider:
- Using a production ASGI server like uvicorn behind a reverse proxy
- Implementing proper database storage (e.g., SQL database)
- Adding authentication and more robust security measures

### Frontend

The Angular frontend can be built for production:
```
cd frontend
npm run build
```

This creates a `dist/` directory with optimized static files that can be served by any web server. 