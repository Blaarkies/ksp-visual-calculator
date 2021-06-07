import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { ActionOption } from './common/domain/action-option';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from './dialogs/simple-dialog/simple-dialog.component';
import { WithDestroy } from './common/with-destroy';
import { filter, takeUntil } from 'rxjs/operators';
import { TutorialService } from './services/tutorial.service';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent extends WithDestroy() implements OnInit {

  routes = UsableRoutes;
  pages: ActionOption[] = [
    new ActionOption(
      'Signal Check',
      Icons.PlanetSearch,
      {route: UsableRoutes.SignalCheck},
      'Page that calculates CommNet ranges'),
    new ActionOption(
      'Source Code - GitHub',
      Icons.SourceCode,
      {externalRoute: 'https://github.com/Blaarkies/ksp-commnet-planner'}),
    new ActionOption(
      'Blaarkies Hub',
      Icons.Blaarkies,
      {externalRoute: 'https://blaarkies.com/'},
      'More tools made by Blaarkies'),
  ];

  constructor(private dialog: MatDialog,
              private tutorialService: TutorialService) {
    super();
  }

  ngOnInit() {
    // x912:y528 , minimum screen size to use the app
    if (window.innerWidth < 912
      || window.innerHeight < 528) {
      this.triggerUnsupportedScreenSizeDialog();
      return;
    }

    if (!localStorage.getItem('ksp-commnet-planner-first-visit')) {
      localStorage.setItem('ksp-commnet-planner-first-visit', true.toString());
      this.triggerFirstVisitDialog();
    }
  }

  private triggerUnsupportedScreenSizeDialog() {
    this.dialog.open(SimpleDialogComponent, {
      data: {
        title: 'Unsupported Screen Size',
        descriptions: [
          'The detected screen size is too small to use without visual issues.',
          'Currently, only computer monitors, and mouse input (as opposed to touch screen input) is supported.',
        ],
        okButtonText: 'Continue',
        cancelButtonText: null,
      } as SimpleDialogData,
    });
  }

  private triggerFirstVisitDialog() {
    this.dialog.open(SimpleDialogComponent, {
      data: {
        title: 'First Visit?',
        descriptions: [
          'You can start the tutorial now, or if you prefer later, you can find it in the "Information" menu in the top right.',
          'This is a tool to help players visualize their communication networks in Kerbal Space Program.',
          'Players can plan the details around a CommNet before even launching their first rocket.',
        ],
        okButtonText: 'Start Tutorial',
        cancelButtonText: 'Skip',
      } as SimpleDialogData,
    })
      .afterClosed()
      .pipe(
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => this.tutorialService.startFullTutorial());
  }
}
