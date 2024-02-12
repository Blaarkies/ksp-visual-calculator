import { MountResponse } from 'cypress/angular/angular';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { OrbitLineComponent } from './orbit-line.component';

describe('OrbitLineComponent', () => {

  let mountResponse: MountResponse<OrbitLineComponent>;

  beforeEach(() => {
    let orbit = Orbit.fromJson({
        id: '',
        type: 'moon',
        name: 'test',
        parent: undefined,
        semiMajorAxis: 1e10,
        equatorialRadius: 0,
        sphereOfInfluence: undefined,
        imageUrl: '',
        orbitLineColor: '#d04010',
      },
      {} as Draggable);

    cy.mount(OrbitLineComponent, {
      componentProperties: {orbit},
    }).then(m => mountResponse = m);
  });

  it('exists', () => {
    cy.get('svg').should('exist');
  });

  it('draws svg circle element', () => {
    cy.get('svg').should('exist');
    cy.get('circle').should('exist').then(e => {
      let orbitColor = e.css('stroke');
      expect(orbitColor).to.be.equal('rgba(208, 64, 16, 0.627)');

      let outerWidth = e.outerWidth();
      let outerHeight = e.outerHeight();
      expect(outerWidth).to.be.equal(100);
      expect(outerHeight).to.be.equal(100);
    });
  });

  it('moves according to orbit parameters', () => {
    mountResponse.component.orbit.parameters.xy = [42e9, 69e9];
    mountResponse.fixture.detectChanges();

    cy.get('svg').then(e => {
      let {left, top} = e.position();
      expect(left).to.be.equal(160);
      expect(top).to.be.equal(295);
    });
  });

});
