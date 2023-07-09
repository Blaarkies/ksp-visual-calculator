import { Component, EventEmitter, Input, Output } from '@angular/core';
import {CommonModule} from "@angular/common";
import {ContentPleatComponent} from "../../../components/content-pleat/content-pleat.component";

class Explanation {
  type: 'span' | 'code' | 'search' | 'image';
  content: string;
  query?: string;
  src?: string;
  alt?: string;
  height?: number;
}

export class Section {
  title: string;
  simpleExplanation: string;
  advancedExplanations: Explanation[][];
  tags: string;
}

@Component({
  selector: 'cp-faq-section',
  standalone: true,
  imports: [
    CommonModule,
    ContentPleatComponent,
  ],
  templateUrl: './faq-section.component.html',
  styleUrls: ['./faq-section.component.scss'],
})
export class FaqSectionComponent {

  @Input() section: Section;

  @Output() search = new EventEmitter<string>();

}
