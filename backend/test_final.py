import re

# Our test cases, including the problematic ones highlighted by the user
test_transactions = [
    "10/02/2025 08/02/2025 NEW NAWALOKA HOSPITALS PV, COLOMBO 02 2,934.25",
    "24/02/2025 20/02/2025 UMANDAWA GREEN HUT, COLOMBO 03 2,800.00",
    "25/03/2025 25/03/2025 INTERNET PAYMENT 113,000.00 CR",
    "09/09/2025 07/09/2025 AMAZON PAYMENT 125.99",
    "14/10/2025 11/10/2025 ODEL STORE 2ND FLOOR COLOMBO 3 8,750.00"
]

# Our improved regex patterns
date_pattern = re.compile(r'^(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})')
amount_pattern = re.compile(r'(\d{1,3}(?:,\d{3})*\.\d{2}|\d+\.\d{2})(?:\s+CR)?$')

print("Testing final transaction parsing algorithm")
print("=" * 80)

for tx in test_transactions:
    print(f"Original transaction: {tx}")
    
    # Step 1: Extract dates from beginning
    date_match = date_pattern.match(tx)
    if not date_match:
        print("❌ FAILED: Could not extract dates")
        continue
        
    post_date, inv_date = date_match.groups()
    
    # Step 2: Extract amount from end
    amount_match = amount_pattern.search(tx)
    if not amount_match:
        print("❌ FAILED: Could not extract amount")
        continue
        
    amount = amount_match.group(1)
    
    # Step 3: Extract description (everything between)
    date_end = date_match.end()
    amount_start = amount_match.start()
    description = tx[date_end:amount_start].strip()
    
    # Is it a credit transaction?
    is_credit = tx.strip().endswith("CR")
    
    # Print the parsed data
    print(f"✅ EXTRACTED DATA:")
    print(f"  Post Date: {post_date}")
    print(f"  Inv Date: {inv_date}")
    print(f"  Description: '{description}'")
    print(f"  Amount: {amount}")
    print(f"  Credit Transaction: {'Yes' if is_credit else 'No'}")
    print("-" * 80) 