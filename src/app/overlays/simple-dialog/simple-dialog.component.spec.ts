// import { SimpleDialogComponent, SimpleDialogData } from './simple-dialog.component';
// import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
// import { AppModule } from '../../app.module';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
//
// let componentType = SimpleDialogComponent;
// describe('SimpleDialogComponent', () => {
//
//   beforeEach(() => MockBuilder(componentType)
//     .mock(MAT_DIALOG_DATA, {
//       title: 'test-title',
//       descriptions: ['test-description'],
//     })
//     .mock(AppModule));
//
//   it('should create', () => {
//     let fixture = MockRender(componentType);
//     expect(fixture.point.componentInstance).toBeDefined();
//   });
//
//   let findByInnerText = (element: HTMLElement,
//                          selector: keyof HTMLElementTagNameMap,
//                          text: string) =>
//     Array.from(element.querySelectorAll(selector))
//       .find((e: HTMLElement) => e.innerText.includes(text));
//
//   it('given details, it should display all details', () => {
//     MockInstance(MAT_DIALOG_DATA, instance => ({
//       ...instance,
//       cancelButtonText: 'test-cancelButtonText',
//       okButtonText: 'test-okButtonText',
//     } as SimpleDialogData));
//
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//
//     let container = fixture.debugElement.nativeElement;
//
//     let title = findByInnerText(container, 'h1', 'test-title');
//     let description = findByInnerText(container, 'p', 'test-description');
//     let buttonOk = findByInnerText(container, 'button', 'test-cancelButtonText');
//     let buttonCancel = findByInnerText(container, 'button', 'test-okButtonText');
//
//     expect(title).toBeDefined();
//     expect(description).toBeDefined();
//     expect(buttonOk).toBeDefined();
//     expect(buttonCancel).toBeDefined();
//   });
//
// });
