# Experiment 05: Lexicographically Smallest String by Swapping Two Characters

def lexicographically_smallest_swap(s: str) -> tuple[str, int, int]:
    chars = list(s)
    n = len(chars)
    for i in range(n):
        min_char = chars[i]
        min_idx = i
        for j in range(n - 1, i, -1):
            if chars[j] < min_char:
                min_char = chars[j]
                min_idx = j
        if min_idx != i:
            chars[i], chars[min_idx] = chars[min_idx], chars[i]
            return ''.join(chars), i, min_idx
    return s, -1, -1

if __name__ == '__main__':
    test_cases = ['DCBA', 'BADC', 'BCDA', 'FEDCBA', 'ABCDE']
    print('==================================================')
    print(' RAPTOR SIMULATION: LEXICOGRAPHIC MINIMUM SWAP')
    print('==================================================')
    for tc in test_cases:
        res, idx1, idx2 = lexicographically_smallest_swap(tc)
        print(f'Original: {tc} -> Swapped ({idx1}, {idx2}) -> Result: {res}')
