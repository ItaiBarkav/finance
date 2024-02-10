import { Component } from '@angular/core';
import { CreditChargeComponent } from '../credit-charge/credit-charge.component';
import { MaterialModule } from '../material.module';
import { UploadFileComponent } from '../upload-file/UploadFileComponent';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule, UploadFileComponent, CreditChargeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  file: File | undefined;

  getFiles(file: File): void {
    this.file = file;
  }
}
