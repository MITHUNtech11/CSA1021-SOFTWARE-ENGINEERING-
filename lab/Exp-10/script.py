import openpyxl
from collections import Counter

def analyze_moscow():
    wb = openpyxl.load_workbook('analysis.xlsx')
    sheet = wb.active
    categories = []
    for r in range(2, 12):
        cat = sheet.cell(r, 2).value
        if cat:
            categories.append(cat)
    counts = Counter(categories)
    total = len(categories)
    print('==================================================')
    print(' LIBRARY MANAGEMENT SYSTEM: MoSCoW ANALYSIS')
    print('==================================================')
    for cat, count in counts.items():
        pct = (count / total) * 100
        print(f'  {cat:<12}: {count} requirements ({pct:.1f}%)')
    print(f'\nTotal Scoped Requirements: {total}')

if __name__ == '__main__':
    analyze_moscow()
