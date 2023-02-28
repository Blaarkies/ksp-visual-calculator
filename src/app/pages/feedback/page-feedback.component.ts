import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackDialogComponent } from '../../overlays/feedback-dialog/feedback-dialog.component';
import { ConductInfoDisplayComponent } from '../components/conduct-info-display/conduct-info-display.component';

@Component({
  selector: 'cp-page-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FeedbackDialogComponent,
    ConductInfoDisplayComponent,
  ],
  templateUrl: './page-feedback.component.html',
  styleUrls: ['./page-feedback.component.scss']
})
export class PageFeedbackComponent {

}
