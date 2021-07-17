import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  templateUrl: './faq-section.component.html',
  styleUrls: ['./faq-section.component.scss'],
})
export class FaqSectionComponent {

  @Input() section: Section;

  @Output() search = new EventEmitter<string>();

}
