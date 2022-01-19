import { Injectable } from '@angular/core';
import { EventLogs } from './event-logs';
import { AnalyticsService } from './analytics.service';
import { OverlayContainer } from '@angular/cdk/overlay';

export enum ThemeTypeEnum {
  Light = 'light-theme',
  Dark = 'dark-theme',
}

let userThemePreferenceKey = 'ksp-visual-calculator-user-theme-preference';

let themeToggleMap = {
  [ThemeTypeEnum.Light]: ThemeTypeEnum.Dark,
  [ThemeTypeEnum.Dark]: ThemeTypeEnum.Light,
}

enum ThemeOrigin {
  LocalStorage,
  BrowserPreference,
}

const themes: string[] = Object.values(ThemeTypeEnum);

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme: ThemeTypeEnum;
  private readonly themeOriginMessage: string;

  get currentTheme(): ThemeTypeEnum {
    return this.theme;
  }

  constructor(private analyticsService: AnalyticsService,
              private overlayContainer: OverlayContainer) {
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
  }

  private detectThemePreference() {
    let localPreference = localStorage.getItem(userThemePreferenceKey);
    if (localPreference && themes.includes(localPreference)) {
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

    localStorage.setItem(userThemePreferenceKey, theme);
    this.theme = theme;
  }

  private setThemeOnElement(element: HTMLElement, theme: ThemeTypeEnum) {
    let classList = element.classList;

    Array.from(classList)
      .filter(c => themes.includes(c))
      .forEach(c => classList.remove(c));

    classList.add(theme);
  }

  toggleTheme(): ThemeTypeEnum {
    let newTheme = themeToggleMap[this.theme];
    this.setNewTheme(newTheme);
    return newTheme;
  }

}
