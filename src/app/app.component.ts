import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  Subject,
  takeUntil,
  takeWhile,
  timer,
} from 'rxjs';
import { WithDestroy } from './common/with-destroy';
import { HolidayThemeSpriteComponent } from './overlays/holiday-theme-sprite/holiday-theme-sprite.component';
import { LocalStorageService } from './services/local-storage.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'cp-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HolidayThemeSpriteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends WithDestroy() implements OnDestroy {

  showHolidayTheme = false;

  private unsubscribeHoliday$ = new Subject<void>();

  constructor(
    cdr: ChangeDetectorRef,
    themeService: ThemeService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    storageService: LocalStorageService,
  ) {
    super();

    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    themeService.logThemeOrigin();

    timer(30e3, 300e3)
      .pipe(
        takeWhile(() => storageService.hasHolidays()),
        takeUntil(this.unsubscribeHoliday$),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.showHolidayTheme = false;
        cdr.detectChanges();
        this.showHolidayTheme = true;
      });
  }

  ngOnDestroy() {
    this.unsubscribeHoliday$.next();
    this.unsubscribeHoliday$.complete();
  }

  cancelHolidayTheme() {
    this.unsubscribeHoliday$.next();
    this.unsubscribeHoliday$.complete();
  }
}
