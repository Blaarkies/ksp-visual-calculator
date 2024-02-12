import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MountResponse } from 'cypress/angular/angular';
import { MountResult } from '../../cypress/support/types';
import { AppComponent } from './app.component';
import { LocalStorageService } from './services/local-storage.service';
import { ThemeService } from './services/theme.service';

describe('AppComponent', () => {

  describe('if basic', () => {
    beforeEach(() => {
      cy.mount(AppComponent, {
        providers: [
          {provide: ThemeService, useValue: {logThemeOrigin: cy.spy()}},
          {provide: LocalStorageService, useValue: {hasHolidays: cy.spy(() => true)}},
          {provide: Window, useValue: {}},
        ],
      });
    });

    it('exists', () => {
      cy.get('*').should('exist');
    });

    it('contains correct elements', () => {
      cy.get('router-outlet').should('exist');
    });

  });

  describe('if timing sensitive', () => {
    let mountResponse: MountResponse<AppComponent>;

    let mountComponent = (): MountResult<AppComponent> =>
      cy.mount(AppComponent, {
        providers: [
          {provide: ThemeService, useValue: {logThemeOrigin: cy.spy()}},
          {provide: LocalStorageService, useValue: {hasHolidays: cy.spy(() => true)}},
          {provide: Window, useValue: {}},
        ],
        imports: [BrowserAnimationsModule],
      }).then(m => {
        mountResponse = m;
        return m;
      });

    it('cp-holiday-theme-sprite appears on holidays', (done) => {
      const now = new Date(2021, 9, 31).getTime(); // Halloween
      cy.clock(now);

      mountComponent()
        .then(() => cy.tick(30e3))
        .then(() => {
          mountResponse.fixture.detectChanges();
          cy.get('cp-holiday-theme-sprite').should('exist');

          cy.clock().invoke('restore');
          done();
        });
    });

    it('cp-holiday-theme-sprite disappears on other days', (done) => {
      const now = new Date(2021, 1, 14).getTime(); // Some random day
      cy.clock(now);

      mountComponent()
        .then(() => cy.tick(30e3))
        .then(() => {
          mountResponse.fixture.detectChanges();
          cy.get('cp-holiday-theme-sprite').should('not.exist');

          cy.clock().invoke('restore');
          done();
        });
    });

  });

});
