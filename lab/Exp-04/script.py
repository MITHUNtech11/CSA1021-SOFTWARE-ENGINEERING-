# Experiment 04: Flowchart to Find the Length of a String using RAPTOR
# Logic: Traverse the string character by character until index exceeds bounds

def find_string_length(input_str: str) -> int:
    length = 0
    try:
        while True:
            _ = input_str[length]
            length += 1
    except IndexError:
        pass
    return length

if __name__ == '__main__':
    test_strings = ['SoftwareEngineering', 'RAPTOR', 'Hello World!', '', 'CSA1021-Lab']
    print('==================================================')
    print(' RAPTOR SIMULATION: STRING LENGTH CALCULATION')
    print('==================================================')
    for s in test_strings:
        calculated_len = find_string_length(s)
        print(f'Input: "{s}" -> Calculated Length: {calculated_len}')
