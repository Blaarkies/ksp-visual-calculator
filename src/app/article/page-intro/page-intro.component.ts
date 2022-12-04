import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { filter, map, Observable, sampleTime, scan, skip, Subject, takeUntil, tap } from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { Router, Scroll } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AdDispenserService } from '../../adsense-manager/services/ad-dispenser.service';

@Component({
  selector: 'cp-page-intro',
  templateUrl: './page-intro.component.html',
  styleUrls: ['./page-intro.component.scss']
})
export class PageIntroComponent extends WithDestroy() implements OnInit, OnDestroy {

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
  isMobile$ = this.breakpointObserver.observe(['(max-width: 1000px)'])
    .pipe(map(bp => bp.matches));
  isNotMobile$ = this.isMobile$.pipe(map(is => !is));
  isAdBlocked$: Observable<boolean>;

  constructor(router: Router,
              private self: ElementRef,
              private themeService: ThemeService,
              private breakpointObserver: BreakpointObserver,
              adDispenserService: AdDispenserService) {
    super();

    this.isAdBlocked$ = adDispenserService.isAdBlocked$.asObservable();

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

  ngOnInit() {
    (Array.from(this.self.nativeElement.querySelectorAll(`section[id]`)) as HTMLElement[])
      .map(e => e.querySelector('h1, h2, h3, h4, h5, h6').querySelector('a'))
      .forEach((e: any) => {
        let cssEncapsulationId = (Array.from(e.attributes) as any).find((a: any) => a.name.includes('_ngcontent-')).name;
        e.innerHTML = createLinkSvgIcon(cssEncapsulationId);
      })
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

function createLinkSvgIcon(cssEncapsulationId) {
  return `<svg ${cssEncapsulationId} viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>`;
}
