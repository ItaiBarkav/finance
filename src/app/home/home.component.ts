import { Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { MaterialModule } from '../material.module';
import { Transaction } from './types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgxFileDropModule, MaterialModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild(MatTable) table: MatTable<any> | undefined;

  files: NgxFileDropEntry[] = [];
  transactions = new Array<Transaction>();
  title = ['date', 'name', 'amount', 'type', 'details', 'debitAmount'];

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);
          let card: string[];
          let titleIndex = 0;
          let data: string[][] = [];
          var reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
            data = (reader.result! as string)
              .split('\n')
              .map((a) => a.trim().split(','))
              .filter((x) => x[0] !== '');

            data.map((arr, index) => {
              if (arr.find((r) => r.includes('כרטיס'))) {
                card = arr;
              }

              if (arr.every((x) => x !== '')) {
                titleIndex = index;
              }
            });

            // console.log(card);
            // console.log(title);
            // console.log(data);

            for (let index = titleIndex + 1; index < data.length; index++) {
              this.transactions.push({
                date: data[index][0],
                name: data[index][1],
                amount: Number(data[index][2]),
                type: data[index][3],
                details: data[index][4],
                debitAmount: Number(data[index][5]),
              });
            }

            this.table?.renderRows();

            return;
          };
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }
}
