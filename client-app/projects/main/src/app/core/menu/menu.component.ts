import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleUser, faCog, faGlobe, faMoon, faSun, faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Language } from '../translation/language.model';
import { TranslationService } from '../translation/translation.service';
import { UserService } from '../user/user.service';
import { AuthenticatedUser } from '../user/model/authenticated-user.model';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
 
@Component({
  selector: 'csps-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FontAwesomeModule, NgbDropdownModule, NgbPopoverModule, CommonModule, TranslateModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {
  // Collapsed status of menu navbar
  navbarCollapsed = false;

  // User profile icons
  faUser: IconDefinition = faUser;
  faCircleUser: IconDefinition = faCircleUser;
  faGlobe: IconDefinition = faGlobe;
  faCog: IconDefinition = faCog;
  faEnvelope: IconDefinition = faEnvelope;
  
  // Dark/light theme icons
  themeIcon: IconDefinition = faSun;
  faMoon: IconDefinition = faMoon;
  faSun: IconDefinition = faSun;

  // The list of languages and the selected language
  languages: Language[] = [];
  selectedLanguage$!: BehaviorSubject<Language | null>;

  // Indicates whether the user is authenticated
  public isAuthenticated: boolean = false;

  // The authenticated user
  public authenticatedUser: AuthenticatedUser | null = null;

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(private userService: UserService, private translationService: TranslationService, private Renderer2: Renderer2) { }

  ngOnInit(): void {
    //this.searchService.init();

    // Wire languages
    this.languages = this.translationService.languages
    this.selectedLanguage$ = this.translationService.selectedApplicationLanguage$;

    //this.menuService.menuItems$.pipe(takeUntil(this.unsubscribe)).subscribe(menu => this.menu = menu);

    this.userService.authenticatedUserSubject$.pipe(takeUntil(this.unsubscribe)).subscribe(authenticatedUser => {
      this.authenticatedUser = authenticatedUser;
      this.isAuthenticated = authenticatedUser !== null
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  // Set the theme of the app
  setTheme(theme: 'light' | 'dark'): void {
    this.themeIcon = theme === 'light' ? faSun : faMoon;
    this.Renderer2.setAttribute(document.querySelector('html'), 'data-bs-theme', theme);
  }

  // Set the language of the app
  setLanguage(lang: Language): void {
    this.translationService.setApplicationLanguage(lang);
  }
}

