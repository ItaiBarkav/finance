import { Component, EventEmitter, Output } from '@angular/core';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [MaterialModule, NgxFileDropModule],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
})
export class UploadFileComponent {
  @Output() files = new EventEmitter<File>();

  dropped(files: NgxFileDropEntry[]): void {
    files.forEach((droppedFile) => {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file) => this.files.emit(file));
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    });
  }
}
