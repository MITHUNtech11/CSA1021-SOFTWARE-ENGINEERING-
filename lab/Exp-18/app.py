def compute_tax(subtotal: float, rate: float = 0.18) -> float:
    return round(subtotal * rate, 2)

def compute_total(subtotal: float, tax: float) -> float:
    return round(subtotal + tax, 2)
