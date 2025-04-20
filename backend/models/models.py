from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_date: datetime
    inv_date: datetime
    description: str
    amount: float
    category: str = "Other"  # Default category

class TransactionUpdate(BaseModel):
    category: str
    learn: bool = True  # Whether to learn from this categorization

class Statement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    month: int
    year: int
    upload_date: datetime = Field(default_factory=datetime.now)
    transactions: List[Transaction] = []

class StatementList(BaseModel):
    statements: List[Statement] = [] 