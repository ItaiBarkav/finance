import { Component, EventEmitter, Output } from '@angular/core';
import {
  FileSystemFileEntry,
  NgxFileDropEntry,
  NgxFileDropModule,
} from 'ngx-file-drop';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [MaterialModule, NgxFileDropModule],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
})
export class UploadFileComponent {
  @Output() files = new EventEmitter<File[]>();

  dropped(files: NgxFileDropEntry[]): void {
    let _files: File[] = [];

    files.forEach((droppedFile) => {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file) => {
        _files.push(file);
        this.files.emit(_files);
      });
    });
  }
}
