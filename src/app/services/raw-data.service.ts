import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction } from '../credit-charge/types';

@Injectable({
  providedIn: 'root',
})
export class RawDataService {
  private transactions = new BehaviorSubject<Array<Transaction>>([]);
  private translateScope = 'data';
  private card: number | null = 0;
  private detailsIndex = 4;
  private debitAmountIndex = 5;
  private nameIndex = 1;
  private amountIndex = 2;
  private typeIndex = 3;
  private dateIndex = 0;

  createTable(file: File): Observable<Transaction[]> {
    const reader = new FileReader();

    reader.onload = () => this.buildTable(reader.result as string);
    reader.readAsText(file);

    return this.transactions.asObservable();
  }

  private buildTable(fileData: string): void {
    const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
    const data = fileData
      .split('\n')
      .map((row) =>
        row
          .trim()
          .split(regex)
          .map((part) => part.replace(/^"|"$/g, ''))
      )
      .filter((values) => values[0] !== '');

    data.map((row) => this.setHeader(row));
    const dataIndex = this.getDataIndex(data);
    this.buildRows(data, dataIndex);
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
  }

  private isValidDate(value: string): boolean {
    const splitDate = value.split('/');
    const date = new Date(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`);

    return !isNaN(date.getTime());
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

  private buildRows(data: string[][], dataIndex: number): void {
    for (let index = dataIndex; index < data.length; index++) {
      if (
        data[index][0].includes('את המידע') ||
        data[index][1].includes('סך חיוב')
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
          date: data[index][this.dateIndex],
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
