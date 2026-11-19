import openpyxl

def evaluate_kano_moscow():
    wb = openpyxl.load_workbook('prioritization.xlsx')
    sheet = wb.active
    print('================================================================================')
    print(' TASK MANAGEMENT SYSTEM: MoSCoW & KANO DUAL EVALUATION')
    print('================================================================================')
    print(f'{"Req ID":<8} | {"Description":<32} | {"MoSCoW":<11} | {"Kano Category":<18} | {"CS+":<5} | {"CS-":<5}')
    print('-' * 80)
    for row in range(2, 14):
        rid = sheet.cell(row, 1).value
        desc = sheet.cell(row, 2).value
        mos = sheet.cell(row, 3).value
        kano = sheet.cell(row, 4).value
        csp = sheet.cell(row, 5).value
        csm = sheet.cell(row, 6).value
        print(f'{rid:<8} | {desc:<32} | {mos:<11} | {kano:<18} | {csp:<5.2f} | {csm:<5.2f}')

if __name__ == '__main__':
    evaluate_kano_moscow()
