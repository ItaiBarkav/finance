import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaction } from '../credit-charge/types';

@Injectable({
  providedIn: 'root',
})
export class RawDataService {
  private transactions = new BehaviorSubject<Array<Transaction>>([]);
  private translateScope = 'data';
  private card = 0;
  private detailsIndex = 4;
  private debitAmountIndex = 5;
  private dataIndex = 0;

  constructor() {}

  createTable(file: File): Observable<Transaction[]> {
    const reader = new FileReader();

    reader.onload = () => this.buildTable(reader.result as string);
    reader.readAsText(file);

    return this.transactions.asObservable();
  }

  private buildTable(fileData: string): void {
    const data = fileData
      .split('\n')
      .map((row) => row.trim().split(','))
      .filter((values) => values[0] !== '');
    let dataIndex = -1;

    data.map((row, index) => {
      this.setHeader(row);
      if (dataIndex === -1) {
        dataIndex = this.getDataIndex(row, index);
      }
    });

    this.buildRows(data, dataIndex);
  }

  private setHeader(row: string[]): void {
    if (
      row.find(
        (value) => value.includes('לכרטיס') // TODO: use transloco
      )
    ) {
      this.card = Number(row[0].split(' ').pop()!);
      this.detailsIndex = 4;
      this.debitAmountIndex = 5;
      this.dataIndex = 0;
    }

    if (
      row.find(
        (value) => value.includes('אמריקן אקספרס') // TODO: use transloco
      )
    ) {
      this.card = Number(row[0].split(' ').pop()!);
      this.detailsIndex = 7;
      this.debitAmountIndex = 4;
      this.dataIndex = 1;
    }
  }

  private getDataIndex(row: string[], index: number): number {
    if (row.every((value) => value !== '')) {
      return index + 1;
    }

    return -1;
  }

  private buildRows(data: string[][], dataIndex: number): void {
    for (let index = dataIndex; index < data.length - this.dataIndex; index++) {
      this.transactions.next([
        {
          card: this.card,
          date: data[index][0],
          name: data[index][1],
          amount: Number(data[index][2]),
          type: data[index][3],
          details: data[index][this.detailsIndex],
          debitAmount: Number(data[index][this.debitAmountIndex]),
        },
        ...this.transactions.value,
      ]);
    }
  }
}
