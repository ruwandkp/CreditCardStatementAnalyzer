import re

# More complex test transactions
test_transactions = [
    "10/02/2025 08/02/2025 NEW NAWALOKA HOSPITALS PV, COLOMBO 02 2,934.25",
    "24/02/2025 20/02/2025 UMANDAWA GREEN HUT, COLOMBO 03 2,800.00",
    "25/03/2025 25/03/2025 INTERNET PAYMENT 113,000.00 CR",
    "12/01/2025 10/01/2025 ARPICO SUPER CENTER 12,345.67",
    "05/04/2025 01/04/2025 DIALOG AXIATA 3,500.00",
    "15/05/2025 12/05/2025 PAYMENT - THANK YOU 245,678.90 CR",
    "30/06/2025 28/06/2025 CARGILLS FOOD CITY NO. 42 COLOMBO 4,567.89",
    "17/07/2025 15/07/2025 KEELLS SUPER #003 NAWALA RD 2,345.67",
    "23/08/2025 22/08/2025 DOCTORS VISIT - ASIRI HOSPITAL 10,500.00",
    "09/09/2025 07/09/2025 AMAZON PAYMENT 125.99",
    "14/10/2025 11/10/2025 ODEL STORE 2ND FLOOR COLOMBO 3 8,750.00",
]

# Two-step parsing approach
date_pattern = re.compile(
    r'^(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})'
)
# Updated amount pattern to handle numbers with or without commas
amount_pattern = re.compile(
    r'(\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})(?:\s+CR)?$'
)

print("Testing complex transaction parsing...\n")

for tx in test_transactions:
    print(f"Transaction: {tx}")
    
    # Match date pattern
    date_match = date_pattern.match(tx)
    if not date_match:
        print("❌ NO DATE MATCH")
        print("-" * 80)
        continue
    
    # Match amount pattern
    amount_match = amount_pattern.search(tx)
    if not amount_match:
        print("❌ NO AMOUNT MATCH")
        print("-" * 80)
        continue
    
    # Extract data
    post_date_str, inv_date_str = date_match.groups()
    amount_str = amount_match.group(1)
    
    # Extract description (everything between dates and amount)
    date_end = date_match.end()
    amount_start = amount_match.start()
    description = tx[date_end:amount_start].strip()
    
    is_credit = tx.strip().endswith("CR")
    
    # Print results
    print(f"✅ Successfully parsed:")
    print(f"  Post Date: {post_date_str}")
    print(f"  Inv Date: {inv_date_str}")
    print(f"  Description: '{description}'")
    print(f"  Amount: {amount_str}")
    print(f"  Is Credit: {is_credit}")
    print("-" * 80) 