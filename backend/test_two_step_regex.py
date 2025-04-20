import re

# Test transactions with problematic format
test_transactions = [
    "10/02/2025 08/02/2025 NEW NAWALOKA HOSPITALS PV, COLOMBO 02 2,934.25",
    "24/02/2025 20/02/2025 UMANDAWA GREEN HUT, COLOMBO 03 2,800.00",
    "25/03/2025 25/03/2025 INTERNET PAYMENT 113,000.00 CR",
    "12/01/2025 10/01/2025 ARPICO SUPER CENTER 12,345.67",
    "05/04/2025 01/04/2025 DIALOG AXIATA 3,500.00"
]

# Two-step parsing approach
date_pattern = re.compile(
    r'^(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})'
)
amount_pattern = re.compile(
    r'(\d{1,3}(?:,\d{3})*\.\d{2})(?:\s+CR)?$'
)

print("Testing two-step transaction parsing...\n")
print("-" * 80)

for tx in test_transactions:
    print(f"Transaction: {tx}")
    
    # Match date pattern
    date_match = date_pattern.match(tx)
    if date_match:
        post_date_str, inv_date_str = date_match.groups()
        print(f"Post Date: {post_date_str}")
        print(f"Inv Date: {inv_date_str}")
    else:
        print("NO DATE MATCH")
    
    # Match amount pattern
    amount_match = amount_pattern.search(tx)
    if amount_match:
        amount_str = amount_match.group(1)
        print(f"Amount: {amount_str}")
    else:
        print("NO AMOUNT MATCH")
    
    # Extract description (everything between dates and amount)
    if date_match and amount_match:
        date_end = date_match.end()
        amount_start = amount_match.start()
        description = tx[date_end:amount_start].strip()
        print(f"Description: '{description}'")
    
    is_credit = tx.strip().endswith("CR")
    print(f"Is Credit: {is_credit}")
    
    print("-" * 80) 