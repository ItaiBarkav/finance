import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { read, utils, WorkBook, WorkSheet } from 'xlsx';
import { Transaction } from '../credit-charge/types';

@Injectable({
  providedIn: 'root',
})
export class RawDataService {
  private readonly CSV = 'csv';

  private transactions = new BehaviorSubject<Array<Transaction>>([]);
  private translateScope = 'data';
  private card: number | null = 0;
  private detailsIndex = 4;
  private debitAmountIndex = 5;
  private nameIndex = 1;
  private amountIndex = 2;
  private typeIndex = 3;
  private dateIndex = 0;
  private isUsDate = false;

  constructor(private datePipe: DatePipe) {}

  createTable(file: File): Observable<Transaction[]> {
    const reader = new FileReader();
    const format = file.name.split('.')[1];

    if (format === this.CSV) {
      reader.onload = () =>
        this.buildTable(this.buildTableFromCsv(reader.result as string));
      reader.readAsText(file);
    } else {
      reader.onload = (event: any) =>
        this.buildTable(this.readExcelData(event));
      reader.readAsArrayBuffer(file);
    }

    return this.transactions.asObservable();
  }

  private readExcelData(event: any): string[][] {
    const data: Uint8Array = new Uint8Array(event.target.result);
    const workbook: WorkBook = read(data, { type: 'array' });

    const firstSheetName: string = workbook.SheetNames[0];
    const worksheet: WorkSheet = workbook.Sheets[firstSheetName];

    return utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      blankrows: false,
      defval: '',
      raw: false,
    });
  }

  private buildTable(data: string[][]): void {
    data.map((row) => this.setHeader(row));
    const dataIndex = this.getDataIndex(data);
    this.buildRows(data, dataIndex);
  }

  private buildTableFromCsv(fileData: string): string[][] {
    const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

    return fileData
      .split('\n')
      .map((row) =>
        row
          .trim()
          .split(regex)
          .map((part) => part.replace(/^"|"$/g, ''))
      )
      .filter((values) => values[0] !== '');
  }

  private setHeader(row: string[]): void {
    if (
      row.find(
        (value) => value.includes('לכרטיס') // TODO: use transloco
      )
    ) {
      this.card = Number(row[0].split(' ').pop());
      this.detailsIndex = 4;
      this.debitAmountIndex = 5;
      this.nameIndex = 1;
      this.amountIndex = 2;
      this.typeIndex = 3;
      this.isUsDate = true;
    }

    if (
      row.find(
        (value) =>
          value.includes('אמריקן אקספרס') || value.includes('גולד - מסטרקארד') // TODO: use transloco
      )
    ) {
      this.card = Number(row[0].split(' ').pop());
      this.detailsIndex = 7;
      this.debitAmountIndex = 5;
      this.nameIndex = 2;
      this.amountIndex = 3;
      this.typeIndex = 4;
    }

    if (
      row.find(
        (value) => value.includes('max executive') // TODO: use transloco
      )
    ) {
      this.card = Number(row[0].split('-').at(0));
      this.amountIndex = 7;
      this.typeIndex = 8;
      this.detailsIndex = 9;
      this.debitAmountIndex = 5;
      this.nameIndex = 1;
    }

    if (row.find((value) => value.includes('debitAmount'))) {
      this.card = null;
      this.dateIndex = 1;
      this.nameIndex = 2;
      this.amountIndex = 3;
      this.typeIndex = 4;
      this.detailsIndex = 5;
      this.debitAmountIndex = 6;
    }

    if (
      row.find(
        (value) => value.includes('פלטינום עסקי') // TODO: use transloco
      )
    ) {
      this.card = 5343;
      this.detailsIndex = 5;
      this.debitAmountIndex = 3;
      this.nameIndex = 1;
      this.amountIndex = 2;
      this.typeIndex = 4;
    }

    if (row.find((value) => value.includes('max בהצדעה'))) {
      this.card = Number(row[0].split('-')[0]);
      this.detailsIndex = 10;
      this.debitAmountIndex = 5;
      this.nameIndex = 1;
      this.amountIndex = 7;
      this.typeIndex = 4;
    }
  }

  private getDataIndex(data: string[][]): number {
    let maxLength = 0;
    let maxIndex = -1;

    data.forEach((row, index) => {
      if (row.length === 0) return;

      if (this.isValidDate(row[this.dateIndex]) && row.length > maxLength) {
        maxLength = row.length;
        maxIndex = index;
      }
    });

    return maxIndex;
  }

  private isValidDate(value: string): boolean {
    return !isNaN(this.getDate(value).getTime());
  }

  private getDate(value: string): Date {
    let splitChar = '/';
    let monthIndex = 1;
    let dayIndex = 0;

    if (value.includes('-')) {
      splitChar = '-';
    }

    const splitDate = value.split(splitChar);

    if (this.isUsDate) {
      monthIndex = 0;
      dayIndex = 1;
    }

    return new Date(
      `${splitDate[monthIndex]}/${splitDate[dayIndex]}/${splitDate[2]}`
    );
  }

  private buildRows(data: string[][], dataIndex: number): void {
    for (let index = dataIndex; index < data.length; index++) {
      if (
        data[index][0].includes('את המידע') ||
        data[index][1].includes('סך חיוב') ||
        !this.isValidDate(data[index][this.dateIndex])
      ) {
        continue;
      }

      if (
        data[index][0] === 'עסקאות בחו˝ל' ||
        data[index][0] === 'תאריך רכישה' ||
        data[index][0] === 'תאריך העסקה'
      ) {
        this.nameIndex = 2;
        this.amountIndex = 3;
        this.typeIndex = 4;
        this.detailsIndex = 1;
        this.debitAmountIndex = 5;
        continue;
      }

      if (data[index][0].includes('עסקאות מחויבות בש')) {
        this.detailsIndex = 4;
        this.debitAmountIndex = 5;
        this.nameIndex = 1;
        this.amountIndex = 2;
        this.typeIndex = 3;
        continue;
      }

      this.transactions.next([
        {
          card: this.card ?? Number(data[index][0]),
          date: this.datePipe.transform(
            this.getDate(data[index][this.dateIndex]).toDateString(),
            'dd/MM/yyyy'
          )!,
          name: data[index][this.nameIndex],
          amount: Number(
            this.amountTrim(data[index][this.amountIndex])
              .replaceAll(',', '')
              .replace(/\u200E/g, '')
          ),
          type: data[index][this.typeIndex],
          details: data[index][this.detailsIndex],
          debitAmount: Number(
            this.amountTrim(data[index][this.debitAmountIndex])
              .replaceAll(',', '')
              .replace(/\u200E/g, '')
          ),
        },
        ...this.transactions.value,
      ]);
    }
  }

  private amountTrim(amount: string): string {
    const splitedAmount = amount.split(' ');
    return splitedAmount.length === 1 ? splitedAmount[0] : splitedAmount[1];
  }
}
