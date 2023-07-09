import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  Router,
  RouterModule,
  Scroll,
} from '@angular/router';
import {
  filter,
  sampleTime,
  scan,
  skip,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { WithDestroy } from '../../common/with-destroy';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'cp-page-intro',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './page-article.component.html',
  styleUrls: ['./page-article.component.scss']
})
export class PageArticleComponent extends WithDestroy() implements OnDestroy {

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
  scrollEvent$ = new Subject<number>();

  constructor(router: Router,
              private self: ElementRef,
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

  updateNavbar(event: Event) {
    let typedEvent = event as Event & { target: HTMLElement };
    this.scrollEvent$.next(typedEvent.target.scrollTop);
  }

  updateSidebar(event: Event) {
    let typedEvent = event as PointerEvent & { path: { id: string }[] };
    if (!this.showSidebar) {
      return;
    }
    let clickedOnSidebar = (<HTMLElement>typedEvent.target).closest('#sidebar,#sidebar-button');
    if (!clickedOnSidebar) {
      this.showSidebar = false;
    }
  }

}
