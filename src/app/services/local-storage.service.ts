import { Injectable } from '@angular/core';

enum CpKeys {
  localStorageKeyFirstVisitDeprecated = 'ksp-visual-calculator-first-visit',
  localStorageKeyTutorialViewed = 'ksp-visual-calculator-tutorial-viewed',
  localStorageKeySnackbarViewed = 'ksp-visual-calculator-snackbar-viewed',
  localStorageKeySignUpViewed = 'ksp-visual-calculator-sign-up-viewed',
}

@Injectable({providedIn: 'root'})
export class LocalStorageService {

  constructor(private localStorage: Storage) {
    this.fixDeprecations();
  }

  hasViewedTutorial(): boolean {
    return this.getValue(CpKeys.localStorageKeyTutorialViewed)?.toBoolean();
  }

  hasViewedSupportDeveloperSnackbar(): boolean {
    return this.getValue(CpKeys.localStorageKeySnackbarViewed)?.toBoolean();
  }

  hasViewedSignUpDialogViewed(): boolean {
    return this.getValue(CpKeys.localStorageKeySignUpViewed)?.toBoolean();
  }

  setTutorialViewed() {
    this.localStorage.setItem(CpKeys.localStorageKeyTutorialViewed, true.toString());
  }

  setSupportDeveloperSnackbarViewed() {
    this.localStorage.setItem(CpKeys.localStorageKeySnackbarViewed, true.toString());
  }

  setSignUpDialogViewed() {
    this.localStorage.setItem(CpKeys.localStorageKeySignUpViewed, true.toString());
  }

  private getValue(key: CpKeys): string {
    return this.localStorage.getItem(key);
  }

  private fixDeprecations() {
    if (!this.getValue(CpKeys.localStorageKeyFirstVisitDeprecated)?.toBoolean()
      && !this.getValue(CpKeys.localStorageKeyTutorialViewed)?.toBoolean()) {
      this.localStorage.setItem(CpKeys.localStorageKeyFirstVisitDeprecated, true.toString());
    }
  }
}
