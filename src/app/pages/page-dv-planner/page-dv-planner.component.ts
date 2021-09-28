import { Component } from '@angular/core';
import { Icons } from '../../common/domain/icons';
import { UsableRoutes } from '../../usable-routes';
import { takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { HudService } from '../../services/hud.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'cp-page-dv-planner',
  templateUrl: './page-dv-planner.component.html',
  styleUrls: ['./page-dv-planner.component.scss']
})
export class PageDvPlannerComponent extends WithDestroy() {

  icons = Icons;

  constructor(hudService: HudService,
              stateService: StateService,) {
    super();

    hudService.pageContext = UsableRoutes.DvPlanner;
    stateService.pageContext = UsableRoutes.DvPlanner;
    stateService.loadState().pipe(takeUntil(this.destroy$)).subscribe();
  }


}
