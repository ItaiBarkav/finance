import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { HighlightRowDirective } from '../directives/highlight-row.directive';
import { MaterialModule } from '../material.module';
import { HEADERS } from './config';
import { Transaction } from './types';

@Component({
  selector: 'app-credit-charge',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslocoModule,
    HighlightRowDirective,
  ],
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
  sum = 0;
  transactions = new Array<Transaction>();

  private translateScope = 'data';
  private card = 0;
  private detailsIndex = 4;
  private debitAmountIndex = 5;
  private dataIndex = 0;

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

  private buildRows(data: string[][], dataIndex: number) {
    for (let index = dataIndex; index < data.length - this.dataIndex; index++) {
      this.transactions.push({
        card: this.card,
        date: data[index][0],
        name: data[index][1],
        amount: Number(data[index][2]),
        type: data[index][3],
        details: data[index][this.detailsIndex],
        debitAmount: Number(data[index][this.debitAmountIndex]),
      });
    }
  }

  private calcSum(): void {
    this.sum = this.transactions.reduce(
      (transactions, transaction) => transactions + transaction.debitAmount,
      0
    );
  }
}
