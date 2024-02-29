import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  WritableSignal,
  effect,
  signal,
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TranslocoModule } from '@ngneat/transloco';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { map } from 'rxjs';
import { HighlightRowDirective } from '../directives/highlight-row.directive';
import { MaterialModule } from '../material.module';
import { Color } from '../services/config';
import { ExpensesCategoryService } from '../services/expenses-category.service';
import { RawDataService } from '../services/raw-data.service';
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
      _files.forEach((file) => {
        this.rawDataService
          .createTable(file)
          .pipe(map((a) => this.transactions.set(a)))
          .subscribe();
      });
    }
  }

  hasFile = false;
  headers = HEADERS;
  sum = 0;
  chartData: ChartData[] = [];
  dataSource = new MatTableDataSource<Transaction>([]);

  private transactions: WritableSignal<Transaction[]> = signal([]);

  constructor(
    private expensesCategoryService: ExpensesCategoryService,
    private rawDataService: RawDataService
  ) {
    effect(() => {
      this.dataSource = new MatTableDataSource(this.transactions());
      this.calcSum();
      this.updatePieChart();
    });
  }

  customColors(): ColorScheme[] {
    return Object.entries(Color).map(([name, value]) => ({ name, value }));
  }

  sortTransactions(sort: Sort): void {
    switch (sort.active) {
      case 'amount': {
        if (sort.direction === 'asc') {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) => b.amount - a.amount),
          ];
        } else {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) => a.amount - b.amount),
          ];
        }
        break;
      }
      case 'debitAmount': {
        if (sort.direction === 'asc') {
          this.dataSource.data = [
            ...this.dataSource.data.sort(
              (a, b) => b.debitAmount - a.debitAmount
            ),
          ];
        } else {
          this.dataSource.data = [
            ...this.dataSource.data.sort(
              (a, b) => a.debitAmount - b.debitAmount
            ),
          ];
        }
        break;
      }
      case 'card': {
        if (sort.direction === 'asc') {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) => b.card - a.card),
          ];
        } else {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) => a.card - b.card),
          ];
        }
        break;
      }
      case 'name': {
        if (sort.direction === 'asc') {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) =>
              b.name.localeCompare(a.name)
            ),
          ];
        } else {
          this.dataSource.data = [
            ...this.dataSource.data.sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          ];
        }
        break;
      }
      case 'date': {
        if (sort.direction === 'asc') {
          this.dataSource.data = [
            ...this.dataSource.data.sort(
              (a, b) =>
                this.parseDate(b.date).getTime() -
                this.parseDate(a.date).getTime()
            ),
          ];
        } else {
          this.dataSource.data = [
            ...this.dataSource.data.sort(
              (a, b) =>
                this.parseDate(a.date).getTime() -
                this.parseDate(b.date).getTime()
            ),
          ];
        }
        break;
      }
    }
  }

  private calcSum(): void {
    this.sum = this.transactions().reduce(
      (transactions, transaction) => transactions + transaction.debitAmount,
      0
    );
  }

  private updatePieChart(): void {
    this.chartData = [];
    this.transactions().map((transaction) => {
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

  private parseDate(date: string): Date {
    const splitDate = date.split('/');
    return new Date(
      Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`)
    );
  }
}
