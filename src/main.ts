import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { MelaModule } from './app/mela.module';

platformBrowserDynamic().bootstrapModule(MelaModule)
  .catch(err => console.log(err));
