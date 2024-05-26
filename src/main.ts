import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './angular/app/app.config';
import { AppComponent } from './angular/app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
