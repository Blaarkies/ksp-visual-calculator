import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  Subject,
  takeUntil,
  takeWhile,
  timer,
} from 'rxjs';
import { HolidayThemeSpriteComponent } from './overlays/holiday-theme-sprite/holiday-theme-sprite.component';
import { LocalStorageService } from './services/local-storage.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'cp-root',
  standalone: true,
  imports: [
    RouterModule,
    HolidayThemeSpriteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  showHolidayTheme = false;

  private unsubscribeHoliday$ = new Subject<void>();

  constructor(
    cdr: ChangeDetectorRef,
    themeService: ThemeService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    storageService: LocalStorageService,
    destroyRef: DestroyRef,
  ) {
    destroyRef.onDestroy(() => this.cancelHolidayTheme());

    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    themeService.logThemeOrigin();

    timer(30e3, 300e3)
      .pipe(
        takeWhile(() => storageService.hasHolidays()),
        takeUntil(this.unsubscribeHoliday$),
        takeUntilDestroyed())
      .subscribe(() => {
        this.showHolidayTheme = false;
        cdr.detectChanges();
        this.showHolidayTheme = true;
      });
  }

  cancelHolidayTheme() {
    this.unsubscribeHoliday$.next();
    this.unsubscribeHoliday$.complete();
  }
}
