import { Component } from '@angular/core';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgxFileDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file
          console.log(droppedFile.relativePath, file);

          var reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
            console.log(
              (reader.result! as string)
                .split('\n')
                .map((a) =>
                  a
                    .trim()
                    .split(',')
                    .filter((c) => c !== '')
                )
                .filter((x) => x.length !== 0)
            );
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
