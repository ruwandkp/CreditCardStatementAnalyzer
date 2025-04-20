from typing import Dict, List, Optional
import json
from models.models import Statement, StatementList, Transaction
import threading

class Database:
    """In-memory database for statements and transactions"""
    
    def __init__(self):
        self.statements: Dict[str, Statement] = {}
        self.transactions: Dict[str, Transaction] = {}
        self._lock = threading.Lock()
    
    def add_statement(self, statement: Statement) -> str:
        """Add a statement to the database"""
        with self._lock:
            # Store statement
            self.statements[statement.id] = statement
            
            # Index transactions for quick access
            for transaction in statement.transactions:
                self.transactions[transaction.id] = transaction
                
            return statement.id
    
    def get_statement(self, statement_id: str) -> Optional[Statement]:
        """Get a statement by ID"""
        return self.statements.get(statement_id)
    
    def get_all_statements(self) -> StatementList:
        """Get all statements"""
        return StatementList(statements=list(self.statements.values()))
    
    def get_transaction(self, transaction_id: str) -> Optional[Transaction]:
        """Get a transaction by ID"""
        return self.transactions.get(transaction_id)
    
    def update_transaction_category(self, transaction_id: str, category: str) -> bool:
        """Update transaction category"""
        with self._lock:
            transaction = self.transactions.get(transaction_id)
            if not transaction:
                return False
            
            transaction.category = category
            return True

# Singleton database instance
_db_instance = None
_db_lock = threading.Lock()

def get_db() -> Database:
    """Get the database instance"""
    global _db_instance
    if _db_instance is None:
        with _db_lock:
            if _db_instance is None:
                _db_instance = Database()
    return _db_instance

def init_db() -> None:
    """Initialize the database"""
    get_db() 