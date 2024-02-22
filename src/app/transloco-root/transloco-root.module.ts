import { HttpClient } from '@angular/common/http';
import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  Translation,
  TranslocoLoader,
  TranslocoModule,
  translocoConfig,
} from '@ngneat/transloco';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'any' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {
    console.log('Loader');
  }

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`assets/i18n/${lang}.json`).pipe(
      map((a) => {
        console.log('aaaaaa');
        console.log(a);
        return a;
      })
    );
  }
}

@NgModule({
  exports: [TranslocoModule],
})
export class TranslocoRootModule {
  static forRoot(): ModuleWithProviders<TranslocoModule> {
    console.log('ForRoot');

    return {
      ngModule: TranslocoRootModule,
      providers: [
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
    };
  }
}
