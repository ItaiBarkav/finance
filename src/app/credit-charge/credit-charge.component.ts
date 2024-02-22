import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, Component, Input, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  TranslocoModule,
  TranslocoService,
  translate,
  translocoConfig,
} from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { HighlightRowDirective } from '../directives/highlight-row.directive';
import { MaterialModule } from '../material.module';
import { TranslocoHttpLoader } from '../transloco-loader';
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
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (translocoService: TranslocoService) => async () =>
        await firstValueFrom(translocoService.load('he')),
      deps: [TranslocoService],
    },
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['he'],
        defaultLang: 'he',
        prodMode: true,
        missingHandler: {
          allowEmpty: true,
        },
      }),
    },
    {
      provide: TRANSLOCO_LOADER,
      useClass: TranslocoHttpLoader,
    },
  ],
})
export class CreditChargeComponent {
  @ViewChild(MatTable) table: MatTable<any> | undefined;

  @Input() set files(_files: File[] | undefined) {
    if (_files) {
      this.hasFile = true;
      _files.map((file) => this.createTable(file));
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

  constructor(private translocoService: TranslocoService) {}

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

  private async setHeader(row: string[]): Promise<void> {
    // console.log('!!!!!!');
    // this.translocoService
    //   .selectTranslate('data.card', {}, 'he')
    //   .subscribe(console.log);
    // console.log('@@@@');
    // await firstValueFrom(this.translocoService.load('he'));
    console.log(this.translocoService.getTranslation());
    console.log(this.translocoService.getTranslation('he'));
    console.log(translate('data.card'));

    if (
      row.find(
        (value) => value.includes(translate('data.card')) // TODO: use transloco
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
