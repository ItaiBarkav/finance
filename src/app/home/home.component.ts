import { Component } from '@angular/core';
import { CreditChargeComponent } from '../credit-charge/credit-charge.component';
import { MaterialModule } from '../material.module';
import { UploadFileComponent } from '../upload-file/upload-file.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule, UploadFileComponent, CreditChargeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  files: File[] | undefined;

  getFiles(files: File[]): void {
    this.files = files;
  }
}
