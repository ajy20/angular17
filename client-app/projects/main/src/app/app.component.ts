import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, filter, mergeMap, of } from 'rxjs';
import { LoaderComponent } from './core/loader/loader.component';
import { MenuComponent } from './core/menu/menu.component';
import { TranslationService } from './core/translation/translation.service';
import { UserService } from './core/user/user.service';
 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, LoaderComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private userService: UserService, private translateService: TranslateService, private translationService: TranslationService) { }

  ngOnInit(): void {
    this.userService.init();

    // Initialize list of languages
    this.translateService.addLangs(this.translationService.languages.map(l => l.code));

    // Default language
    this.translateService.setDefaultLang(this.translationService.defaultLanguage.code);

    // Subscribe to language changes
    combineLatest(
      this.translationService.selectedApplicationLanguage$,
      this.translationService.selectedDocumentLanguage$
    ).pipe(
      filter(([appLanguage, docLanguage]) => !!appLanguage),
      mergeMap(([appLanguage, docLanguage]) => combineLatest(of(appLanguage), this.translateService.reloadLang(appLanguage?.code || '')))
    ).subscribe(([appLanguage, translations]) => {
      this.translateService.use(appLanguage?.code || '');
      // onLangChange is not emitted upon reloadLang. Must do it manually to force translations to update
      this.translateService.onLangChange.emit({ lang: appLanguage?.code || '', translations: translations });
    })

    // Set initial language
    this.translationService.setApplicationLanguage(this.translationService.defaultLanguage);
  }
}
