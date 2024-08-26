import { TranslateLoader } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from './translation.service';

// This is the translation loader service that is passed to ngxTranslate service
// It retrieves translation from both CSPS and the asset folder
export class CustomTranslationLoader implements TranslateLoader {
  constructor(private translationService: TranslationService) { }

  getTranslation(lang: string): Observable<any> {
    return combineLatest(
      this.translationService.getAssetTranslations(lang),
      this.translationService.getDatabaseTranslations(lang),
      this.translationService.getDocumentTranslations(),
    ).pipe(map(v => {
      // Return the merged translation object
      return Object.assign({}, v[1], v[2], v[0]);
    }));
  }
}
