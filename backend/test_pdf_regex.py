import re

# Test transactions with problematic format
test_transactions = [
    "10/02/2025 08/02/2025 NEW NAWALOKA HOSPITALS PV, COLOMBO 02 2,934.25",
    "24/02/2025 20/02/2025 UMANDAWA GREEN HUT, COLOMBO 03 2,800.00",
    "25/03/2025 25/03/2025 INTERNET PAYMENT 113,000.00 CR",
    "12/01/2025 10/01/2025 ARPICO SUPER CENTER 12,345.67",
    "05/04/2025 01/04/2025 DIALOG AXIATA 3,500.00"
]

# Old pattern (problematic)
old_pattern = re.compile(
    r'(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})\s+([^0-9]+)([0-9,.]+)'
)

# Final fixed pattern
final_pattern = re.compile(
    r'(\d{2}/\d{2}/\d{4})\s+(\d{2}/\d{2}/\d{4})\s+(.*?)(?=\s+\d{1,3}(?:,\d{3})*\.\d{2}(?:\s+CR)?$)\s+(\d{1,3}(?:,\d{3})*\.\d{2})'
)

def print_results(pattern, name):
    print(f"{name} PATTERN RESULTS:")
    print("-" * 80)
    for tx in test_transactions:
        match = pattern.search(tx)
        if match:
            post_date, inv_date, desc, amount = match.groups()
            print(f"Transaction: {tx}")
            print(f"Post Date: {post_date}")
            print(f"Inv Date: {inv_date}")
            print(f"Description: '{desc.strip()}'")
            print(f"Amount: {amount}")
            print("-" * 80)
        else:
            print(f"NO MATCH: {tx}")
            print("-" * 80)

print("Testing transaction parsing...\n")
print_results(old_pattern, "OLD")
print()
print_results(final_pattern, "FINAL") 