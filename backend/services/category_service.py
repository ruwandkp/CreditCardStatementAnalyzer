import re
from typing import Dict, List, Set
import json
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

class CategoryService:
    """Service for categorizing credit card transactions"""
    
    def __init__(self):
        # Define keyword patterns for each category
        self.category_keywords = {
            "Grocery": [
                "CARGILLS", "KEELLS", "SUPERMARKET", "MARKET", "GROCERY", "FOOD CITY", 
                "ARPICO", "LAUGFS", "SPAR", "LAUGHS", "KADA", "BAKERY", "FARM", "STORE", 
                "MART", "SUPER CENTER"
            ],
            "Fuel": [
                "CEYPETCO", "IOC", "FUEL", "PETROL", "LANKA IOC", "FILLING STATION", 
                "GAS STATION", "DIESEL", "SHELL", "PETROLEUM"
            ],
            "Textile": [
                "FASHION", "CLOTHING", "TEXTILE", "GARMENT", "FABRIC", "ODEL", "NOLIMIT", 
                "COOL PLANET", "DRESS", "SAREE", "BOUTIQUE", "TAILOR", "ACCESSORY", "JEWELRY"
            ],
            "Dining/Restaurants": [
                "RESTAURANT", "CAFE", "PIZZA", "BURGER", "DINE", "DINING", "FOOD", "EAT", 
                "TAKEOUT", "DELIVERY", "BISTRO", "KITCHEN", "GRILL", "BUFFET", "BAR", "PUB",
                "FAST FOOD", "COFFEE", "TEA", "BAKE"
            ],
            "Utilities": [
                "ELECTRICITY", "WATER", "GAS", "INTERNET", "PHONE", "MOBILE", "TELECOM", 
                "BILL PAY", "UTILITY", "BROADBAND", "CELL", "SERVICE PROVIDER", "POWER", 
                "ENERGY", "CONNECTION", "COMMUNICATION"
            ],
            "Housing": [
                "RENT", "MORTGAGE", "PROPERTY", "TAX", "MAINTENANCE", "REPAIR", "HOUSING", 
                "APARTMENT", "CONDO", "LEASE", "TENANT", "LANDLORD", "HOME", "REAL ESTATE", 
                "HOA", "CLEANING", "PLUMBER", "ELECTRICIAN"
            ],
            "Healthcare": [
                "MEDICAL", "HEALTH", "DOCTOR", "HOSPITAL", "PHARMACY", "PRESCRIPTION", 
                "CLINIC", "INSURANCE", "DENTAL", "VISION", "THERAPY", "MEDICINE", "LABORATORY", 
                "PHYSICIAN", "HEALTHCARE", "WELLNESS"
            ],
            "Entertainment": [
                "ENTERTAINMENT", "MOVIE", "THEATRE", "CONCERT", "TICKET", "NETFLIX", "SPOTIFY", 
                "DISNEY", "STREAMING", "SUBSCRIPTION", "SHOW", "EVENT", "GAME", "PLAY", "FUN", 
                "LEISURE", "RECREATION", "AMUSEMENT", "PARK"
            ],
            "Travel": [
                "HOTEL", "FLIGHT", "AIRLINE", "AIRWAYS", "BOOKING", "TRAVEL", "VACATION", 
                "HOLIDAY", "TRIP", "TOUR", "RESORT", "LODGE", "AIRBNB", "CAR RENTAL", "TAXI", 
                "TRANSPORT", "TOURISM", "AIRPORT"
            ],
            "Transportation": [
                "BUS", "TRAIN", "METRO", "SUBWAY", "PUBLIC TRANSIT", "UBER", "LYFT", "RIDESHARE", 
                "VEHICLE", "MAINTENANCE", "AUTO", "SERVICE", "OIL CHANGE", "REPAIR", "FARE", 
                "TICKET", "COMMUTE", "TRANSPORTATION"
            ],
            "Shopping": [
                "RETAIL", "SHOP", "STORE", "MALL", "ONLINE", "E-COMMERCE", "AMAZON", "EBAY", 
                "DEPARTMENT", "PURCHASE", "BUY", "CONSUMER", "MERCHANDISE", "PRODUCT", "ITEM", 
                "SHOPPING"
            ],
            "Education": [
                "TUITION", "SCHOOL", "COLLEGE", "UNIVERSITY", "COURSE", "CLASS", "EDUCATION", 
                "STUDENT", "BOOK", "LEARNING", "STUDY", "TRAINING", "WORKSHOP", "SEMINAR", 
                "INSTITUTE", "ACADEMY", "TUTORIAL"
            ],
            "Personal Care": [
                "SALON", "HAIRCUT", "SPA", "MASSAGE", "BEAUTY", "COSMETIC", "PERSONAL CARE", 
                "HYGIENE", "GROOMING", "BARBER", "STYLIST", "NAIL", "GYM", "FITNESS", "EXERCISE", 
                "WELLNESS", "SELF-CARE"
            ],
            "Subscriptions": [
                "SUBSCRIPTION", "MEMBERSHIP", "MONTHLY", "ANNUAL", "RECURRING", "SERVICE", 
                "MAGAZINE", "NEWSPAPER", "SOFTWARE", "APP", "DIGITAL", "ACCESS", "PREMIUM", 
                "ACCOUNT", "PLATFORM", "CLOUD"
            ],
            "Insurance": [
                "INSURANCE", "POLICY", "PREMIUM", "COVERAGE", "PROTECT", "LIFE", "AUTO", 
                "HOME", "RENTER", "HEALTH", "LIABILITY", "CLAIM", "INSURER", "UNDERWRITER"
            ],
            "Gifts/Donations": [
                "GIFT", "PRESENT", "DONATION", "CHARITY", "CONTRIBUTE", "FOUNDATION", 
                "NONPROFIT", "WEDDING", "BIRTHDAY", "ANNIVERSARY", "HOLIDAY", "FUNDRAISER", 
                "SUPPORT", "CAUSE", "ORGANIZATION"
            ],
            "Financial": [
                "BANK", "FEE", "INTEREST", "INVESTMENT", "FINANCE", "CREDIT", "DEBIT", "LOAN", 
                "MORTGAGE", "PAYMENT", "TRANSACTION", "TRANSFER", "DEPOSIT", "WITHDRAWAL", 
                "BALANCE", "ACCOUNT", "MONEY", "CASH", "ATM", "WIRE"
            ],
            "Payment": [  # New category for credit card payments
                "PAYMENT CR", "INTERNET PAYMENT", "BILL PAYMENT", "CREDIT PAYMENT", "ONLINE PAYMENT"
            ]
        }
        
        # Initialize machine learning model
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', MultinomialNB())
        ])
        
        # Training data
        self.training_data = []
        self.training_labels = []
        
        # Load saved training data if available
        self.model_path = os.path.join(os.path.dirname(__file__), "category_model.json")
        self.load_training_data()
        
        # Train initial model
        if self.training_data:
            self.train_model()
    
    def categorize(self, description: str) -> str:
        """
        Categorize a transaction based on its description
        
        Args:
            description: Transaction description
            
        Returns:
            Category: One of the defined categories or "Other"
        """
        # Check if it's a credit card payment (ending with CR)
        if description.strip().endswith("CR") or "PAYMENT" in description and "CR" in description:
            return "Payment"
        
        # First try rule-based categorization
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword.lower() in description.lower():
                    return category
        
        # If rule-based fails and we have a trained model, use ML
        if self.training_data and len(self.training_data) > 10:
            try:
                category = self.model.predict([description])[0]
                return category
            except:
                # Fall back to "Other"
                return "Other"
        
        # Default to "Other"
        return "Other"
    
    def learn(self, description: str, category: str) -> bool:
        """
        Learn from user feedback
        
        Args:
            description: Transaction description
            category: Correct category
            
        Returns:
            True if learning was successful
        """
        # Add to training data
        self.training_data.append(description)
        self.training_labels.append(category)
        
        # Retrain model if we have enough data
        if len(self.training_data) >= 10:
            self.train_model()
        
        # Save training data
        self.save_training_data()
        
        return True
    
    def train_model(self) -> None:
        """Train the categorization model"""
        try:
            self.model.fit(self.training_data, self.training_labels)
        except Exception as e:
            print(f"Error training model: {e}")
    
    def save_training_data(self) -> None:
        """Save training data to disk"""
        try:
            data = {
                "training_data": self.training_data,
                "training_labels": self.training_labels
            }
            
            with open(self.model_path, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            print(f"Error saving training data: {e}")
    
    def load_training_data(self) -> None:
        """Load training data from disk"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'r') as f:
                    data = json.load(f)
                
                self.training_data = data.get("training_data", [])
                self.training_labels = data.get("training_labels", [])
        except Exception as e:
            print(f"Error loading training data: {e}")
            # Initialize empty if loading fails
            self.training_data = []
            self.training_labels = [] 