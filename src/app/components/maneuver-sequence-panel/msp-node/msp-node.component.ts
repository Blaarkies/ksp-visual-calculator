import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MissionNode } from '../maneuver-sequence-panel.component';
import { Icons } from '../../../common/domain/icons';
import { TravelConditions } from '../../../common/data-structures/delta-v-map/travel-conditions';
import { MatSelectChange } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'cp-msp-node',
    templateUrl: './msp-node.component.html',
    styleUrls: ['./msp-node.component.scss'],
    animations: [
        trigger('animateSelected', [
            state('false', style({opacity: .3})),
            state('true', style({opacity: 1, backgroundColor: '#0003'})),
            transition('false => true', [
                animate('.2s ease-in', style({opacity: 1, backgroundColor: '#0003'})),
            ]),
            transition('true => false', [
                animate('.2s ease-out', style({opacity: .3})),
            ]),
        ]),
    ],
})
export class MspNodeComponent {

    @Input() details: MissionNode;

    @Output() remove = new EventEmitter();
    @Output() update = new EventEmitter();

    icons = Icons;
    conditionReadableMap = {
        [TravelConditions.Surface]: 'Surface',
        [TravelConditions.LowOrbit]: 'Low Orbit',
        [TravelConditions.EllipticalOrbit]: 'Elliptical Orbit',
        [TravelConditions.PlaneWith]: 'Plane With',
        [TravelConditions.InterceptWith]: 'Intercept With',
        [TravelConditions.GeostationaryOrbit]: 'Geostationary Orbit',
    };
    isPopoverOpen = false;

    constructor() {
    }

    setCondition(event: MatSelectChange) {
        this.details.condition = event.value;
        this.update.emit();
    }

    toggleAerobraking() {
        this.details.aerobraking = !this.details.aerobraking;
    }

    toggleGravityAssist() {
        this.details.gravityAssist = !this.details.gravityAssist;
    }
}
