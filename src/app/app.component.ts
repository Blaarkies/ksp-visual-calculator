import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WithDestroy } from './common/with-destroy';
import { Subject, takeUntil, timer } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HolidayThemeSpriteComponent } from './overlays/holiday-theme-sprite/holiday-theme-sprite.component';

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
  unsubscribeHoliday$ = new Subject<void>();

  constructor(
    dialog: MatDialog,
    router: Router,
    cdr: ChangeDetectorRef,
    themeService: ThemeService,
    // authService: AuthService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    super();

    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));

    themeService.logThemeOrigin();

    timer(30e3, 300e3)
      .pipe(
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

}
