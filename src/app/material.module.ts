import { ScrollingModule } from '@angular/cdk/scrolling';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { TranslocoRootModule } from './transloco-root/transloco-root.module';
@NgModule({
  imports: [
    MatSort,
    MatSortHeader,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCheckboxModule,
    ScrollingModule,
    TranslocoRootModule.forRoot(),
  ],
  exports: [
    MatSort,
    MatSortHeader,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCheckboxModule,
    ScrollingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (translocoService: TranslocoService) => async () =>
        await firstValueFrom(translocoService.load('he')),
      deps: [TranslocoService],
    },
  ],
})
export class MaterialModule {}
