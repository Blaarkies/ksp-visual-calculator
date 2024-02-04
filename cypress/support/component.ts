// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************


// Load project extension methods into prototypes
import '../../src/extensions';

import './commands';
import {
  Component,
  Provider,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  mount,
  MountResponse,
} from 'cypress/angular';
import {
  MockComponent,
  MockService,
} from 'ng-mocks';
import { MountConfigOverrides } from './types';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: <T>(componentType: Type<T>,
                 config?: MountConfigType<T> & MountConfigOverrides)
        => Cypress.Chainable<MountResponse<T>>;
    }
  }
}

Cypress.Commands.add('mount', (component, config) => {
  let newConfig = overrideMount(component, config);
  return mount(component, newConfig);
});

type OverrideConfig = Parameters<typeof TestBed.overrideComponent>[1];
type MountConfigType<T> = Parameters<typeof mount<T>>[1];

function overrideMount<T>(
  componentType: Type<T>,
  config?: MountConfigType<T> & MountConfigOverrides,
): MountConfigType<T> {
  if (config.override && config.TestBed) {
    let override: OverrideConfig = {add: {}, remove: {}};

    let imports = config.override.imports;
    if (imports) {
      override.add.imports = [];
      override.remove.imports = [];

      imports.forEach(sourceAndMock => {
        let replacement: Type<Component>;
        let target: Type<Component>;

        if (Array.isArray(sourceAndMock)) {
          replacement = sourceAndMock[1];
          target = sourceAndMock[0];
        } else if (sourceAndMock instanceof Type) {
          replacement = MockComponent(sourceAndMock) as Type<Component>;
          target = sourceAndMock;
        }

        override.add.imports.push(replacement);
        override.remove.imports.push(target);
      });
    }

    let providers = config.override.providers;
    if (providers) {
      override.add.providers = [];
      override.remove.providers = [];

      providers.forEach(sourceAndMock => {
        let replacement: Provider;
        let target: Provider;

        if (Array.isArray(sourceAndMock)) {
          target = sourceAndMock[0];
          let mock = sourceAndMock[1];
          replacement = {provide: target, useValue: mock};

        } else {
          let source = sourceAndMock as Provider;
          target = source;
          let mock = MockService(source);
          replacement = {provide: target, useValue: mock};
        }

        override.add.providers.push(replacement);
        override.remove.providers.push(target);
      });
    }

    config.TestBed.overrideComponent(componentType, override);

    delete config.override;
  }

  return config;
}
