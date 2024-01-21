import { MountResponse } from 'cypress/angular/angular';
import { Draggable } from '../../common/domain/space-objects/draggable';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { OrbitLineComponent } from './orbit-line.component';

describe('OrbitLineComponent', () => {

  describe('if basic', () => {
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
      cy.get('*').should('exist');
    });

    it('draws svg circle element', () => {
      cy.get('svg').should('exist');
      cy.get('circle').should('exist');
    });

    it('moves according to orbit parameters', () => {
      mountResponse.component.orbit.parameters.xy = [42e9, 69e9];
      mountResponse.fixture.detectChanges();

      cy.get('svg').should('have.css', 'left', '160px');
      cy.get('svg').should('have.css', 'top', '295px');
    });

  });

});
