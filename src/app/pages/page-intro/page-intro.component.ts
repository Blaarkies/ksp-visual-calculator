import { Component, ElementRef, OnDestroy } from '@angular/core';
import { filter, sampleTime, scan, skip, Subject, takeUntil, tap } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { Router, Scroll } from '@angular/router';
import { ThemeService, ThemeTypeEnum } from '../../services/theme.service';
import { Icons } from '../../common/domain/icons';

@Component({
  selector: 'cp-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent extends WithDestroy() implements OnDestroy {

  calcDv = {
    result: 0,
    isp: 350,
    wet: 8,
    dry: 3,
    update: () => {
      let dv = this.calcDv.isp * 9.81 * Math.log(this.calcDv.wet / this.calcDv.dry);
      this.calcDv.result = dv.toInt();
    }
  };
  showSidebar = false;
  showNavbar = true;
  scrollEvent$ = new Subject<number>()
  pageHeight = 1000;

  log(a: any) {
    console.log(a)
  }

  constructor(router: Router,
              self: ElementRef,
              private themeService: ThemeService) {
    super();

    this.calcDv.update();

    this.scrollEvent$
      .pipe(
        sampleTime(17),
        scan((acc, value) => {
          acc.show = value < acc.lastValue;
          acc.lastValue = value;
          return acc;
        }, {lastValue: 0, show: true}),
        skip(1),
        tap(({show}) => {
          this.showNavbar = show;
          if (!show) {
            this.showSidebar = false;
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();

    router.events
      .pipe(
        filter((e: any) => e instanceof Scroll),
        filter((e: Scroll) => !!e.anchor),
        tap((e: Scroll) => self.nativeElement
          .querySelector(`#${e.anchor}`)
          .scrollIntoView({behavior: 'smooth', block: 'start'})),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.scrollEvent$.complete();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  updateNavbar(event: Event & { target: HTMLElement }) {
    this.scrollEvent$.next(event.target.scrollTop);
  }

  updateSidebar(event: PointerEvent & { path: HTMLElement[] }) {
    if (!this.showSidebar) {
      return;
    }
    let clickedOnSidebar = event.path.some(e => e.id === 'sidebar' || e.id === 'sidebar-button');
    if (!clickedOnSidebar) {
      this.showSidebar = false;
    }
  }

}
