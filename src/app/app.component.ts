import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { ActionOption } from './common/domain/action-option';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from './dialogs/simple-dialog/simple-dialog.component';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {

  routes = UsableRoutes;
  pages: ActionOption[] = [
    new ActionOption('Signal Check', Icons.PlanetSearch,
      {route: UsableRoutes.SignalCheck}),
    new ActionOption('Source Code - GitHub', Icons.SourceCode,
      {externalRoute: 'https://github.com/Blaarkies/ksp-commnet-planner'}),
    new ActionOption('Blaarkies Hub', Icons.Blaarkies,
      {externalRoute: 'https://blaarkies.com/'}),
  ];

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    // x912:y528 , minimum screen size to use the app
    if (window.innerWidth < 912
      || window.innerHeight < 528) {
      this.dialog.open(SimpleDialogComponent, {
        data: {
          title: 'Unsupported Screen Size',
          descriptions: [
            'The detected screen size is too small to use without visual issues.',
            'Currently, only computer monitors, and mouse input (as opposed to touch screen input) is supported.',
          ],
          okButtonText: 'Fine',
          cancelButtonText: null,
        } as SimpleDialogData,
      });
    }
  }

}
