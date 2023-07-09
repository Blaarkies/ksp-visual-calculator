import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'not',
  standalone: true,
})
export class NegatePipe implements PipeTransform {

  transform(value: boolean): boolean {
    return !value;
  }

}
