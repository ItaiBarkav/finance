import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HighlightRowDirective } from '../directives/highlight-row.directive';
import { MaterialModule } from '../material.module';
import { Color } from '../services/config';
import { ExpensesCategoryService } from '../services/expenses-category.service';
import { HEADERS } from './config';
import { ChartData, ColorScheme, Transaction } from './types';

@Component({
  selector: 'app-credit-charge',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslocoModule,
    HighlightRowDirective,
    NgxChartsModule,
  ],
  templateUrl: './credit-charge.component.html',
  styleUrl: './credit-charge.component.scss',
})
export class CreditChargeComponent {
  @ViewChild(MatTable) table: MatTable<any> | undefined;

  @Input() set files(_files: File[] | undefined) {
    if (_files) {
      this.hasFile = true;
      this.filesLength = _files.length;
      _files.map((file, index) => this.createTable(file, index));
    }
  }

  hasFile = false;
  headers = HEADERS;
  sum = 0;
  transactions = new Array<Transaction>();
  filesLength = 0;
  chartData: ChartData[] = [];

  private translateScope = 'data';
  private card = 0;
  private detailsIndex = 4;
  private debitAmountIndex = 5;
  private dataIndex = 0;

  constructor(private expensesCategoryService: ExpensesCategoryService) {}

  customColors(): ColorScheme[] {
    return Object.entries(Color).map(([name, value]) => ({ name, value }));
  }

  private createTable(file: File, index: number): void {
    const reader = new FileReader();

    reader.readAsText(file);
    reader.onload = () => this.buildTable(reader.result as string, index);
  }

  private buildTable(fileData: string, index: number): void {
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

    if (index === this.filesLength - 1) {
      this.updatePieChart();
    }
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

  private updatePieChart(): void {
    this.transactions.map((transaction) => {
      let value = 0;
      const category = this.expensesCategoryService.getCategory(
        transaction.name
      );

      if (this.chartData.some((data) => data.name === category)) {
        const currentCategory = this.chartData.filter(
          (data) => data.name === category
        );
        const categoryValue = this.chartData.splice(
          this.chartData.indexOf(currentCategory[0]),
          1
        );
        value = categoryValue[0].value;
      }

      this.chartData.push({
        name: category,
        value: value + transaction.debitAmount,
      });

      this.chartData = [...this.chartData];
    });
  }
}
