# Credit Card Statement Analyzer (CCSA)

This web application analyzes credit card statements, categorizes expenses, and visualizes spending patterns.

## Features

- Upload and process password-protected PDF statements
- Extract transaction details automatically
- Categorize expenses into Grocery, Fuel, Textile, and Other
- Manually correct categorizations
- Visualize spending distribution with interactive charts
- Compare spending across months or categories

## Technology Stack

- **Backend**: Python (FastAPI)
- **Frontend**: Angular with modern UI components
- **Database**: In-memory database (Redis)
- **PDF Processing**: PyPDF2/pdfplumber
- **ML/NLP**: Basic text classification for expense categorization
- **Visualization**: Chart.js for interactive graphs

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   OR 
   npm install --legacy-peer-deps
   ```

3. Start the Angular development server:
   ```
   npm run start
   ```

4. Open your browser and navigate to `http://localhost:4200`

## User Guide

Please see the [User Guide](docs/user_guide.md) for detailed instructions on how to use the application.

## Architecture

The architecture documentation, including sequence diagrams, flow charts, and component diagrams, can be found in the [Architecture Documentation](docs/architecture.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details. 