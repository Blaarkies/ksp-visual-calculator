import { Component } from '@angular/core';
import { AbstractStateService } from '../../../services/state.abstract.service';
import { PageCommnetPlannerComponent } from '../page-commnet-planner.component';
import { CommnetStateService } from '../services/commnet-state.service';

@Component({
  selector: 'cp-page-commnet-planner-provider',
  standalone: true,
  imports: [PageCommnetPlannerComponent],
  providers: [
    {provide: AbstractStateService, useClass: CommnetStateService},
  ],
  templateUrl: 'page-commnet-planner.provider.html',
})
export default class PageCommnetPlannerProvider {
}
