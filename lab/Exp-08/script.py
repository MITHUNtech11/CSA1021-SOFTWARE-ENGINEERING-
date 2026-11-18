# Experiment 08: Cyclomatic Complexity Calculation
# Program under test: Triangle Classifier (Equilateral, Isosceles, Scalene, Invalid)
# McCabe's Cyclomatic Complexity Formulas:
#   1. V(G) = E - N + 2P  (Edges - Nodes + 2*Components)
#   2. V(G) = P + 1       (Predicate Nodes + 1)
#   3. V(G) = Number of bounded regions in planar graph

def classify_triangle(a: float, b: float, c: float) -> str:
    # Node 1: Entry / Validation
    if a + b <= c or a + c <= b or b + c <= a:
        return 'Invalid'  # Node 2
    # Node 3: Check Equilateral
    if a == b and b == c:
        return 'Equilateral'  # Node 4
    # Node 5: Check Isosceles
    if a == b or b == c or a == c:
        return 'Isosceles'  # Node 6
    return 'Scalene'  # Node 7

def compute_cyclomatic_complexity():
    # Graph Metrics for Triangle Classifier:
    nodes = 7
    edges = 9
    connected_components = 1
    predicate_nodes = 3  # (Valid check, Equilateral check, Isosceles check)
    regions = 4

    v1 = edges - nodes + 2 * connected_components
    v2 = predicate_nodes + 1
    v3 = regions

    print('==================================================')
    print(' MCCABE CYCLOMATIC COMPLEXITY VERIFICATION')
    print('==================================================')
    print(f'Method 1 [E - N + 2P] : {edges} - {nodes} + 2({connected_components}) = {v1}')
    print(f'Method 2 [P + 1]      : {predicate_nodes} + 1 = {v2}')
    print(f'Method 3 [Regions]    : {regions} closed/open regions = {v3}')
    assert v1 == v2 == v3 == 4, 'Cyclomatic complexity formula mismatch!'
    print('\nBasis Paths for 100% Coverage (Independent Paths = 4):')
    print('  Path 1: 1 -> 2 (Invalid triangle: 1, 2, 3)')
    print('  Path 2: 1 -> 3 -> 4 (Equilateral: 5, 5, 5)')
    print('  Path 3: 1 -> 3 -> 5 -> 6 (Isosceles: 5, 5, 8)')
    print('  Path 4: 1 -> 3 -> 5 -> 7 (Scalene: 3, 4, 5)')

if __name__ == '__main__':
    compute_cyclomatic_complexity()
