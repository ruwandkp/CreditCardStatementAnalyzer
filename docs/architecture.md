# Credit Card Statement Analyzer - Architecture Documentation

## System Architecture Overview

The Credit Card Statement Analyzer (CCSA) is built using a client-server architecture with a clear separation between the frontend and backend components.

```
┌─────────────────┐      ┌─────────────────┐       ┌─────────────────┐
│                 │      │                 │       │                 │
│    Frontend     │◄────►│     Backend     │◄─────►│    Database     │
│    (Angular)    │      │    (FastAPI)    │       │   (In-memory)   │
│                 │      │                 │       │                 │
└─────────────────┘      └─────────────────┘       └─────────────────┘
```

### Frontend (Angular)

The Angular frontend provides a responsive and interactive user interface with the following key features:
- PDF statement viewing
- Transaction categorization interface
- Data visualization using Chart.js
- Responsive design for desktop and mobile

### Backend (FastAPI)

The Python backend built with FastAPI handles:
- PDF processing and data extraction
- Category classification using rule-based and ML approaches
- RESTful API for CRUD operations
- Authentication and data security
- In-memory database management

### Database (In-memory)

Data is stored in an in-memory database for this implementation, with a focus on:
- Fast access and processing
- Temporary storage to respect privacy
- Structured data model for statements and transactions

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Angular)                       │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │  Dashboard  │  │  Statement  │  │ Transaction │  │ Upload  │ │
│  │  Component  │  │   Viewer    │  │  Component  │  │Component│ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │  Analytics  │  │   Common    │                               │
│  │  Component  │  │ Components  │                               │
│  └─────────────┘  └─────────────┘                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         Services                            ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         ││
│  │  │ API Service │  │ Auth Service│  │ Data Service│         ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Backend (FastAPI)                         │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Routes    │  │  Middleware │  │   Models    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         Services                            ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         ││
│  │  │PDF Processing│  │ Categorizer │  │ Database   │         ││
│  │  │   Service   │  │   Service   │  │  Service   │         ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Flow Chart - PDF Processing and Categorization

```
┌──────────────┐       ┌───────────────┐       ┌──────────────┐
│              │       │               │       │              │
│  Upload PDF  ├──────►│ Process PDF   ├──────►│Extract Data  │
│              │       │(decrypt if    │       │(transactions)│
└──────────────┘       │needed)        │       │              │
                       └───────────────┘       └──────┬───────┘
                                                      │
                                                      ▼
┌───────────────┐       ┌───────────────┐       ┌──────────────┐
│               │       │               │       │              │
│ Save to       │◄──────┤ Apply user    │◄──────┤ Categorize   │
│ database      │       │ corrections   │       │ transactions │
│               │       │ (if any)      │       │              │
└───────────────┘       └───────────────┘       └──────────────┘
       │                                               ▲
       │                                               │
       │                       ┌───────────────┐       │
       │                       │               │       │
       └──────────────────────►│ Display data  ├───────┘
                               │ to user       │
                               │               │
                               └───────────────┘
```

## Sequence Diagram - Statement Processing

```
┌─────┐          ┌─────────┐          ┌────────────┐          ┌──────────┐
│User │          │Frontend │          │Backend     │          │Database  │
└──┬──┘          └────┬────┘          └─────┬──────┘          └────┬─────┘
   │                  │                     │                      │
   │  Upload PDF      │                     │                      │
   │─────────────────►│                     │                      │
   │                  │                     │                      │
   │                  │  POST /statements   │                      │
   │                  │────────────────────►│                      │
   │                  │                     │                      │
   │                  │                     │  Process PDF         │
   │                  │                     │  Extract data        │
   │                  │                     │  Categorize expenses │
   │                  │                     │  ─────────────────►  │
   │                  │                     │                      │
   │                  │                     │       Save data      │
   │                  │                     │  ─────────────────►  │
   │                  │                     │                      │
   │                  │  Response (success) │                      │
   │                  │◄────────────────────│                      │
   │                  │                     │                      │
   │ View Statements  │                     │                      │
   │─────────────────►│                     │                      │
   │                  │  GET /statements    │                      │
   │                  │────────────────────►│                      │
   │                  │                     │  Fetch statements    │
   │                  │                     │  ─────────────────►  │
   │                  │                     │                      │
   │                  │                     │  Return data         │
   │                  │                     │  ◄─────────────────  │
   │                  │  Response (data)    │                      │
   │                  │◄────────────────────│                      │
   │                  │                     │                      │
   │ Select Statement │                     │                      │
   │─────────────────►│                     │                      │
   │                  │  GET /statements/id │                      │
   │                  │────────────────────►│                      │
   │                  │                     │  Fetch details       │
   │                  │                     │  ─────────────────►  │
   │                  │                     │                      │
   │                  │                     │  Return details      │
   │                  │                     │  ◄─────────────────  │
   │                  │  Response (details) │                      │
   │                  │◄────────────────────│                      │
   │                  │                     │                      │
   │ Change Category  │                     │                      │
   │─────────────────►│                     │                      │
   │                  │  PUT /transactions  │                      │
   │                  │────────────────────►│                      │
   │                  │                     │  Update category     │
   │                  │                     │  ─────────────────►  │
   │                  │                     │                      │
   │                  │                     │  Learn from change   │
   │                  │                     │  (improve ML model)  │
   │                  │                     │                      │
   │                  │  Response (success) │                      │
   │                  │◄────────────────────│                      │
   │                  │                     │                      │
└──┬──┘          └────┬────┘          └─────┬──────┘          └────┬─────┘
   │User              │Frontend             │Backend               │Database 
```

## Data Model

### Statement

```json
{
  "id": "unique-statement-id",
  "filename": "February 2025.pdf",
  "month": 2,
  "year": 2025,
  "upload_date": "2025-03-01T12:34:56",
  "transactions": [
    {
      "id": "unique-transaction-id",
      "post_date": "2025-02-05T00:00:00",
      "inv_date": "2025-01-31T00:00:00",
      "description": "CARGILLS FC - MAHARA, MAHARA",
      "amount": 829.65,
      "category": "Grocery"
    },
    {
      "id": "unique-transaction-id-2",
      "post_date": "2025-02-07T00:00:00",
      "inv_date": "2025-02-06T00:00:00",
      "description": "CEYPETCO FILLING STATION",
      "amount": 1500.00,
      "category": "Fuel"
    }
  ]
}
```

## Technology Stack Details

### Frontend
- **Framework**: Angular 16
- **Styling**: SCSS with custom styles
- **Data Visualization**: Chart.js with ng2-charts wrapper
- **PDF Viewing**: ng2-pdf-viewer
- **HTTP Communication**: Angular HttpClient
- **Forms**: Angular Reactive Forms

### Backend
- **Framework**: FastAPI (Python)
- **PDF Processing**: PyPDF2 and pdfplumber
- **ML/NLP**: scikit-learn with basic text classification
- **Data Models**: Pydantic
- **Security**: Input validation, authenticated routes

### Database
- **Storage**: In-memory data structures using Python dictionaries
- **Persistence**: Optional JSON serialization for backup 