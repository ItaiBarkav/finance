import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { DatePipe } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideTransloco } from '@ngneat/transloco';
import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: ['he'],
        defaultLang: 'he',
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    DatePipe,
  ],
};
