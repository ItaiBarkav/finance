import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ViewChild,
  WritableSignal,
  effect,
  signal,
} from '@angular/core';
import { MatTable } from '@angular/material/table';
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
      this.filesLength = _files.length;
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
  transactions: WritableSignal<Transaction[]> = signal([]);
  filesLength = 0;
  chartData: ChartData[] = [];

  constructor(
    private expensesCategoryService: ExpensesCategoryService,
    private rawDataService: RawDataService
  ) {
    effect(() => {
      this.calcSum();
      this.updatePieChart();
    });
  }

  customColors(): ColorScheme[] {
    return Object.entries(Color).map(([name, value]) => ({ name, value }));
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
}
