import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Language } from './language.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  // The list of supported languages and the default language to use when none is specified
  languages: Language[];
  defaultLanguage: Language;

  // The currently selected application language
  selectedApplicationLanguage$:BehaviorSubject<Language | null > = new BehaviorSubject<Language | null>(null);

  // The currently selected document language
  selectedDocumentLanguage$: BehaviorSubject<Language | null> = new BehaviorSubject<Language | null>(null);

  // The document translation provider
  documentTranslationProvider!: (languague: Language) => Observable<any>;

  constructor(private httpClient: HttpClient) {
    this.languages = [
      { code: 'en', name: 'LANGUAGE.ENGLISH', flag: 'gb' },
      { code: 'fr', name: 'LANGUAGE.FRENCH', flag: 'fr' },
      { code: 'es', name: 'LANGUAGE.SPANISH', flag: 'es' },
      { code: 'zh', name: 'LANGUAGE.CHINESE', flag: 'cn' },
      { code: 'de', name: 'LANGUAGE.GERMAN', flag: 'de' }
    ];
    this.defaultLanguage = this.languages[0];
  }

  getAssetTranslations(lang: string, assetFolderPath: string = 'assets/i18n/'): Observable<any> {
    const path = assetFolderPath + lang + '.json';
    return this.httpClient.get(path);
  }

  getDatabaseTranslations(lang: string): Observable<{ [key: string]: any }> {
    // Simulating call to translation database
    const databaseTranslations: { [key: string]: any } =
    {
      "en": {
        "TEST2": {
          "TEST": "This is TEST2"
        }
      },
      "fr": {
        "TEST2": {
          "TEST": "Ceci est TEST2"
        }
      }
    };

    return of(databaseTranslations[lang]);
  }

  getDocumentTranslations(): Observable<any> {
    const lang = this.selectedDocumentLanguage$.getValue() || this.defaultLanguage;
    return this.documentTranslationProvider ? this.documentTranslationProvider(lang) : of(null);
  }

  // Set the language for the document displayed by the application (i.e Selection Navigator Emulator, Drawings,....)
  setDocumentLanguage(lang: Language) {
    this.selectedDocumentLanguage$.next(lang);
  }

  // Set the translation provider for the current document
  setDocumentTranslationProvider(provider: (languague: Language) => Observable<any>) {
    this.documentTranslationProvider = provider;
  }

  // Set the application language (UI)
  setApplicationLanguage(lang: Language) {
    this.selectedApplicationLanguage$.next(lang);
  }
}
