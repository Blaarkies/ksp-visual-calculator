import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConductInfoDisplayComponent } from '../../components/conduct-info-display/conduct-info-display.component';
import { FeedbackDialogComponent } from '../../overlays/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'cp-page-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ConductInfoDisplayComponent,
    FeedbackDialogComponent,
  ],
  templateUrl: './page-feedback.component.html',
  styleUrls: ['./page-feedback.component.scss'],
})
export class PageFeedbackComponent {
}
