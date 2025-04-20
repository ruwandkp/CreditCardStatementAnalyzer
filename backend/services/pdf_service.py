import os
import re
from datetime import datetime
from typing import List, Optional
import pdfplumber
from pypdf import PdfReader

from models.models import Statement, Transaction

class PDFService:
    """Service for processing PDF credit card statements"""
    
    def __init__(self):
        # Pattern to match transaction rows in the statement
        # Using a two-step approach for transaction parsing
        self.transaction_date_pattern = re.compile(
            r'^(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})'
        )
        # Updated amount pattern to handle numbers with or without commas
        self.transaction_amount_pattern = re.compile(
            r'(\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})(?:\s+CR)?$'
        )
        
        # Default password for encrypted PDFs
        self.default_password = "12345678"
    
    def process_pdf(self, pdf_path: str, password: Optional[str] = None) -> Statement:
        """
        Process a PDF credit card statement
        
        Args:
            pdf_path: Path to the PDF file
            password: Password to decrypt the PDF (if needed)
            
        Returns:
            Statement object with extracted data
        """
        # Use provided password or default
        pdf_password = password if password else self.default_password
        
        # Extract filename from path
        filename = os.path.basename(pdf_path)
        
        # First check if PDF is encrypted and try to decrypt
        reader = PdfReader(pdf_path)
        if reader.is_encrypted:
            try:
                reader.decrypt(pdf_password)
            except:
                raise ValueError("Invalid password for encrypted PDF")
        
        # Extract month and year from filename (assuming format "Month YYYY.pdf")
        month_year_match = re.match(r'(\w+)\s+(\d{4})\.pdf', filename)
        if month_year_match:
            month_name = month_year_match.group(1)
            year = int(month_year_match.group(2))
            
            # Convert month name to number
            month_map = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12
            }
            month = month_map.get(month_name, 1)  # Default to January if not found
        else:
            # Use current date if filename doesn't match expected pattern
            now = datetime.now()
            month = now.month
            year = now.year
        
        # Create statement object
        statement = Statement(
            filename=filename,
            month=month,
            year=year,
            transactions=[]
        )
        
        # Extract transactions using pdfplumber for better text extraction
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                
                # Find the transaction section
                if "POST DATE" in text and "INV. DATE" in text and "DESCRIPTION/REFERENCE NUMBER" in text and "AMOUNT" in text:
                    # Process each line after the headers
                    lines = text.split('\n')
                    in_transaction_section = False
                    
                    for line in lines:
                        if "POST DATE" in line and "INV. DATE" in line:
                            in_transaction_section = True
                            continue
                        
                        if in_transaction_section:
                            # Skip non-transaction lines
                            if "Page" in line or "Credit Card Statement" in line or not line.strip():
                                continue
                                
                            # Try to match date pattern at the beginning of the line
                            date_match = self.transaction_date_pattern.match(line)
                            if not date_match:
                                continue
                                
                            # Try to match amount pattern at the end of the line
                            amount_match = self.transaction_amount_pattern.search(line)
                            if not amount_match:
                                continue
                            
                            # Extract dates
                            post_date_str, inv_date_str = date_match.groups()
                            
                            # Extract amount
                            amount_str = amount_match.group(1)
                            
                            # Extract description (everything between dates and amount)
                            date_end = date_match.end()
                            amount_start = amount_match.start()
                            description = line[date_end:amount_start].strip()
                            
                            # Clean and convert data
                            amount = float(amount_str.replace(',', ''))
                            
                            # Check if it's a credit transaction (ends with CR)
                            is_credit = line.strip().endswith("CR")
                            
                            # Parse dates
                            try:
                                post_date = datetime.strptime(post_date_str, "%d/%m/%Y")
                                inv_date = datetime.strptime(inv_date_str, "%d/%m/%Y")
                            except ValueError:
                                # Try alternate date format
                                post_date = datetime.strptime(post_date_str, "%m/%d/%Y")
                                inv_date = datetime.strptime(inv_date_str, "%m/%d/%Y")
                            
                            # Create transaction and add to statement
                            transaction = Transaction(
                                post_date=post_date,
                                inv_date=inv_date,
                                description=description,
                                amount=amount
                            )
                            statement.transactions.append(transaction)
        
        # If no transactions were found, raise an error
        if not statement.transactions:
            raise ValueError("No transactions found in the PDF. The format may not be supported.")
        
        return statement 