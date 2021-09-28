import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cp-msp-edge',
  templateUrl: './msp-edge.component.html',
  styleUrls: ['./msp-edge.component.scss']
})
export class MspEdgeComponent implements OnInit {

  @Input() details: {dv, twr};

  constructor() { }

  ngOnInit(): void {
  }

}
