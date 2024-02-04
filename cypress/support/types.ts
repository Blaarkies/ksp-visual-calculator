import {
  Provider,
  Type,
} from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';
import { MountResponse } from 'cypress/angular';

export interface MountResult<T> extends Cypress.Chainable<MountResponse<T>> {
}

type OverrideImportType = Type<unknown> | Type<unknown>[];
type OverrideProviderType = (Provider | unknown) | (Provider | unknown)[];

export interface MountConfigOverrides {
  TestBed?: TestBedStatic;
  /**
   * Accepts a list of types or pairs of type and mock.
   * @example
   * List example
   *  imports: [MyComponent, AnotherComponent]
   *
   * Pairs example
   *  imports: [
   *    [MyComponent, MockedMyComponent],
   *  ]
   */
  override?: {
    /** @see MountConfigOverrides.override */
    imports?: OverrideImportType[];
    /** @see MountConfigOverrides.override */
    providers?: OverrideProviderType[];
  };
}


// TODO: Check target type and create correct mock
// let classDescriptor: ClassDescriptorDetails = Reflect
//   .getOwnPropertyDescriptor(target, '__annotations__')
//   .value[0];

// interface ClassDescriptorDetails {
//   changeDetection: ChangeDetection;
//   selector: string;
//   standalone: boolean;
//   imports: [];
//   template: string;
//   styles: [];
//   ngMetadataName: 'Component';
// }
