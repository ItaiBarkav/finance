import { Component, Input, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { MaterialModule } from '../material.module';
import { CARD, TITLE as HEADERS } from './config';
import { Transaction } from './types';

@Component({
  selector: 'app-credit-charge',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './credit-charge.component.html',
  styleUrl: './credit-charge.component.scss',
})
export class CreditChargeComponent {
  @ViewChild(MatTable) table: MatTable<any> | undefined;

  @Input() set file(_file: File | undefined) {
    if (_file) {
      this.hasFile = true;
      this.createTable(_file);
    }
  }

  hasFile = false;
  headers = HEADERS;
  title: string = '';
  sum = 0;
  transactions = new Array<Transaction>();

  private createTable(file: File): void {
    const reader = new FileReader();

    reader.readAsText(file);
    reader.onload = () => this.buildTable(reader.result as string);
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
    this.calcSum();
    this.table?.renderRows();
  }

  private setHeader(row: string[]): void {
    if (row.find((value) => value.includes(CARD))) {
      this.title = row.toString().replaceAll(',', '');
    }
  }

  private getDataIndex(row: string[], index: number): number {
    if (row.every((value) => value !== '')) {
      return index + 1;
    }
    return -1;
  }

  private buildRows(data: string[][], dataIndex: number) {
    for (let index = dataIndex; index < data.length; index++) {
      this.transactions.push({
        date: data[index][0],
        name: data[index][1],
        amount: Number(data[index][2]),
        type: data[index][3],
        details: data[index][4],
        debitAmount: Number(data[index][5]),
      });
    }
  }

  private calcSum(): void {
    this.sum = this.transactions.reduce(
      (transactions, transaction) => transactions + transaction.amount,
      0
    );
  }
}
