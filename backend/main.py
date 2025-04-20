from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import uvicorn
import tempfile
from typing import List, Optional

from services.pdf_service import PDFService
from services.category_service import CategoryService
from models.models import StatementList, Statement, Transaction, TransactionUpdate
from database.database import get_db, init_db, Database

app = FastAPI(title="Credit Card Statement Analyzer")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
pdf_service = PDFService()
category_service = CategoryService()

# Initialize database on startup
@app.on_event("startup")
async def startup():
    init_db()

# Mount static files directory for PDF viewer
os.makedirs("./temp_pdfs", exist_ok=True)
app.mount("/pdfs", StaticFiles(directory="temp_pdfs"), name="pdfs")

@app.get("/")
async def root():
    return {"message": "Credit Card Statement Analyzer API"}

@app.get("/statements", response_model=StatementList)
async def get_statements(db: Database = Depends(get_db)):
    """Get all statements"""
    return db.get_all_statements()

@app.post("/statements/upload")
async def upload_statement(
    file: UploadFile = File(...),
    password: str = Form(None),
    db: Database = Depends(get_db)
):
    """Upload a new statement"""
    # Check file extension
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file temporarily
    temp_file_path = f"./temp_pdfs/{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    try:
        # Process the PDF
        statement_data = pdf_service.process_pdf(temp_file_path, password)
        
        # Categorize transactions
        for transaction in statement_data.transactions:
            transaction.category = category_service.categorize(transaction.description)
        
        # Save to database
        db.add_statement(statement_data)
        
        return {"filename": file.filename, "month": statement_data.month, "year": statement_data.year}
    except Exception as e:
        # Delete temp file if there's an error
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statements/{statement_id}", response_model=Statement)
async def get_statement(statement_id: str, db: Database = Depends(get_db)):
    """Get a specific statement by ID"""
    statement = db.get_statement(statement_id)
    if not statement:
        raise HTTPException(status_code=404, detail="Statement not found")
    return statement

@app.put("/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: str, 
    transaction_update: TransactionUpdate,
    db: Database = Depends(get_db)
):
    """Update transaction category"""
    success = db.update_transaction_category(
        transaction_id, 
        transaction_update.category
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update categorization model with new data
    if transaction_update.learn:
        transaction = db.get_transaction(transaction_id)
        if transaction:
            category_service.learn(transaction.description, transaction_update.category)
    
    return {"message": "Transaction updated successfully"}

@app.get("/analytics/summary")
async def get_summary(
    statement_id: Optional[str] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Database = Depends(get_db)
):
    """Get expense summary by category"""
    # Define all supported categories
    categories = [
        "Grocery", "Fuel", "Textile", "Dining/Restaurants", "Utilities", "Housing", 
        "Healthcare", "Entertainment", "Travel", "Transportation", "Shopping", 
        "Education", "Personal Care", "Subscriptions", "Insurance", 
        "Gifts/Donations", "Financial", "Other"
    ]
    
    if statement_id:
        # Get summary for specific statement
        statement = db.get_statement(statement_id)
        if not statement:
            raise HTTPException(status_code=404, detail="Statement not found")
        
        summary = {}
        for category in categories:
            # Exclude transactions with "Payment" category - these are credit card payments
            total = sum(t.amount for t in statement.transactions 
                       if t.category == category and t.category != "Payment")
            summary[category] = total
            
        return {
            "id": statement.id,
            "month": statement.month,
            "year": statement.year,
            "summary": summary,
            "total": sum(summary.values())
        }
    else:
        # Get summary for all statements or filtered by month/year
        statements = db.get_all_statements().statements
        
        if month is not None and year is not None:
            statements = [s for s in statements if s.month == month and s.year == year]
        elif month is not None:
            statements = [s for s in statements if s.month == month]
        elif year is not None:
            statements = [s for s in statements if s.year == year]
        
        summaries = []
        for statement in statements:
            summary = {}
            for category in categories:
                # Exclude transactions with "Payment" category
                total = sum(t.amount for t in statement.transactions 
                           if t.category == category and t.category != "Payment")
                summary[category] = total
            
            summaries.append({
                "id": statement.id,
                "month": statement.month,
                "year": statement.year,
                "summary": summary,
                "total": sum(summary.values())
            })
        
        return {"summaries": summaries}

@app.get("/analytics/compare")
async def compare_statements(
    statement_ids: List[str] = Query(...),
    db: Database = Depends(get_db)
):
    """Compare multiple statements"""
    # Define all supported categories
    categories = [
        "Grocery", "Fuel", "Textile", "Dining/Restaurants", "Utilities", "Housing", 
        "Healthcare", "Entertainment", "Travel", "Transportation", "Shopping", 
        "Education", "Personal Care", "Subscriptions", "Insurance", 
        "Gifts/Donations", "Financial", "Other"
    ]
    
    comparison = []
    
    for statement_id in statement_ids:
        statement = db.get_statement(statement_id)
        if not statement:
            raise HTTPException(status_code=404, detail=f"Statement {statement_id} not found")
        
        summary = {}
        for category in categories:
            # Exclude transactions with "Payment" category
            total = sum(t.amount for t in statement.transactions 
                       if t.category == category and t.category != "Payment")
            summary[category] = total
            
        comparison.append({
            "id": statement.id,
            "month": statement.month,
            "year": statement.year,
            "summary": summary,
            "total": sum(summary.values())
        })
    
    return {"comparison": comparison}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 