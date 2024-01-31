import { Type } from '@angular/core';
import {
  getSourceOfMock,
  MockComponent,
  MockedComponent,
} from 'ng-mocks';

export function componentMock<T>(klass: Type<T>)
  : (Type<T> | MockedComponent<Type<T>>)[] {
  let mock = MockComponent(klass);
  return [getSourceOfMock(mock), mock];
}
