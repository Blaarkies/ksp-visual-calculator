import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  map,
  Observable,
  Subject,
} from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { EventLogs } from './domain/event-logs';

export enum ThemeTypeEnum {
  Light = 'light-theme',
  Dark = 'dark-theme',
}

enum ThemeOrigin {
  LocalStorage,
  BrowserPreference,
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  get theme(): ThemeTypeEnum {
    return this._selectedTheme;
  }

  private set theme(value: ThemeTypeEnum) {
    this._selectedTheme = value;
    this.theme$.next(value);
  }

  themeLabel$: Observable<string>;
  theme$ = new BehaviorSubject<ThemeTypeEnum>(this.theme);
  isLightTheme$ = this.theme$.pipe(map(t => t === ThemeTypeEnum.Light));

  private _selectedTheme: ThemeTypeEnum;
  private readonly themeOriginMessage: string;

  private userThemePreferenceKey = 'ksp-visual-calculator-user-theme-preference';

  private themeToggleMap = {
    [ThemeTypeEnum.Light]: ThemeTypeEnum.Dark,
    [ThemeTypeEnum.Dark]: ThemeTypeEnum.Light,
  };

  private themeLabelMap = {
    [ThemeTypeEnum.Light]: 'Light',
    [ThemeTypeEnum.Dark]: 'Dark',
  };

  private themes: string[] = Object.values(ThemeTypeEnum);


  constructor(private analyticsService: AnalyticsService,
              private overlayContainer: OverlayContainer,
              private snackBar: MatSnackBar) {
    let {theme, origin} = this.detectThemePreference();

    this.setNewTheme(theme);

    switch (origin) {
      case ThemeOrigin.LocalStorage:
        this.themeOriginMessage = `Applied theme selection [${theme}] found in local storage.`;
        break;
      case ThemeOrigin.BrowserPreference:
        this.themeOriginMessage = `Applied theme selection [${theme}] according to browser preference.`;
        break;
      default:
        this.themeOriginMessage = `Applied theme selection [${theme}] found from unknown source.`;
    }

    this.themeLabel$ = this.theme$.pipe(map(t => this.themeLabelMap[t]));
  }

  private detectThemePreference() {
    let localPreference = localStorage.getItem(this.userThemePreferenceKey);
    if (localPreference && this.themes.includes(localPreference)) {
      this.theme = localPreference as ThemeTypeEnum;
      return {theme: this.theme, origin: ThemeOrigin.LocalStorage};
    }

    const browserPreferenceDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = browserPreferenceDarkMode ? ThemeTypeEnum.Dark : ThemeTypeEnum.Light;

    this.analyticsService.logEvent(`Default color scheme was ${this.theme}`, {
      category: EventLogs.Category.Theme,
    });

    return {theme: this.theme, origin: ThemeOrigin.BrowserPreference};
  }

  logThemeOrigin() {
    console.info(`%c ${this.themeOriginMessage}`, 'color: #9ff');
  }

  private setNewTheme(theme: ThemeTypeEnum) {
    this.setThemeOnElement(document.body, theme);
    this.setThemeOnElement(this.overlayContainer.getContainerElement(), theme);

    localStorage.setItem(this.userThemePreferenceKey, theme);
    this.theme = theme;
  }

  private setThemeOnElement(element: HTMLElement, theme: ThemeTypeEnum) {
    let classList = element.classList;

    Array.from(classList)
      .filter(c => this.themes.includes(c))
      .forEach(c => classList.remove(c));

    classList.add(theme);
  }

  toggleTheme(): ThemeTypeEnum {
    let newTheme = this.themeToggleMap[this.theme];
    this.setNewTheme(newTheme);
    this.snackBar.open(`${newTheme === ThemeTypeEnum.Dark ? 'Dark theme' : 'Light theme'} is now selected`,
      null, {duration: 5e3});
    return newTheme;
  }

}
