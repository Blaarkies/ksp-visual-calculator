import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cp-msp-node',
  templateUrl: './msp-node.component.html',
  styleUrls: ['./msp-node.component.scss']
})
export class MspNodeComponent implements OnInit {

  @Input() details: {destination, situation};

  constructor() { }

  ngOnInit(): void {
  }

}
