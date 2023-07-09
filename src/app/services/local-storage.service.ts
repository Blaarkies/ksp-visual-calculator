import { Injectable } from '@angular/core';
import { ThemeTypeEnum } from './theme.service';

enum CpKeys {
  firstVisitDeprecated = 'ksp-visual-calculator-first-visit',
  tutorialViewed = 'ksp-visual-calculator-tutorial-viewed',
  snackbarViewed = 'ksp-visual-calculator-snackbar-viewed',
  signUpViewed = 'ksp-visual-calculator-sign-up-viewed',
  doNotTrack = 'ksp-visual-calculator-user-opted-out-of-tracking',
  userThemePreference = 'ksp-visual-calculator-user-theme-preference',
  privacyPolicyViewed = 'ksp-visual-calculator-privacy-policy-viewed',
}

@Injectable({providedIn: 'root'})
export class LocalStorageService {

  constructor(private localStorage: Storage) {
    this.fixDeprecations();
  }

  getTheme(): ThemeTypeEnum {
    let themeMap = new Map<string, ThemeTypeEnum>(
      [ThemeTypeEnum.Light, ThemeTypeEnum.Dark]
        .map(theme => [theme.toString(), theme]));
    let value = this.getValue(CpKeys.userThemePreference);
    return themeMap.get(value) ?? ThemeTypeEnum.Light;
  }

  setTheme(value: ThemeTypeEnum) {
    this.localStorage.setItem(CpKeys.userThemePreference, value.toString());
  }

  hasDoNotTrack(): boolean {
    return this.getValue(CpKeys.doNotTrack)?.toBoolean();
  }

  setDoNotTrack(value: boolean) {
    this.localStorage.setItem(CpKeys.doNotTrack, value.toString());
  }

  hasViewedTutorial(): boolean {
    return this.getValue(CpKeys.tutorialViewed)?.toBoolean();
  }

  hasViewedSupportDeveloperSnackbar(): boolean {
    return this.getValue(CpKeys.snackbarViewed)?.toBoolean();
  }

  hasViewedSignUpDialogViewed(): boolean {
    return this.getValue(CpKeys.signUpViewed)?.toBoolean();
  }

  setTutorialViewed() {
    this.localStorage.setItem(CpKeys.tutorialViewed, true.toString());
  }

  setSupportDeveloperSnackbarViewed() {
    this.localStorage.setItem(CpKeys.snackbarViewed, true.toString());
  }

  setSignUpDialogViewed() {
    this.localStorage.setItem(CpKeys.signUpViewed, true.toString());
  }

  hasViewedPrivacyPolicy(): boolean {
    return this.getValue(CpKeys.privacyPolicyViewed)?.toBoolean();
  }

  setPrivacyPolicyViewed() {
    this.localStorage.setItem(CpKeys.privacyPolicyViewed, true.toString());
  }

  private getValue(key: CpKeys): string {
    return this.localStorage.getItem(key);
  }

  private fixDeprecations() {
    if (!this.getValue(CpKeys.firstVisitDeprecated)?.toBoolean()
      && !this.getValue(CpKeys.tutorialViewed)?.toBoolean()) {
      this.localStorage.setItem(CpKeys.firstVisitDeprecated, true.toString());
    }
  }
}
