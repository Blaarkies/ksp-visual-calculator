// todo:
// describe('UniverseMapComponent', () => {
//   let component: UniverseMapComponent;
//   let fixture: ComponentFixture<UniverseMapComponent>;
//
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [ UniverseMapComponent ]
//     })
//     .compileComponents();
//   });
//
//   beforeEach(() => {
//     fixture = TestBed.createComponent(UniverseMapComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });
//
//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

// it('editCelestialBody() should call planets dialog with correct data', () => {
//   let spyOpen = MockInstance(MatDialog, 'open', createSpy()
//     .and.returnValue({
//       afterClosed: () => of('test-details' as any),
//     }));
//   let spyEditCelestialBody = MockInstance(SpaceObjectService, 'editCelestialBody', createSpy());
//   MockInstance(SpaceObjectService, 'celestialBodies$', new BehaviorSubject<SpaceObject[]>([
//     {label: 'test-name'} as any]));
//
//   let fixture = MockRender(componentType);
//   let component = fixture.point.componentInstance;
//
//   let body = {label: 'test-body'} as any;
//   component.editCelestialBody(body);
//
//   expect(spyOpen).toHaveBeenCalledWith(CelestialBodyDetailsDialogComponent, objectContaining({
//     data: {
//       forbiddenNames: arrayContaining(['test-name']),
//       edit: body,
//     },
//   }));
//   expect(spyEditCelestialBody).toHaveBeenCalledWith(body, 'test-details');
// });


// it('focusBody() should call cameraService.focusSpaceObject', () => {
//   let spyFocusSpaceObject = MockInstance(CameraService, 'focusSpaceObject', createSpy());
//
//   let fixture = MockRender(componentType);
//   let component = fixture.point.componentInstance;
//
//   component.focusBody(ineeda<SpaceObject>({label: ''}), ineeda<PointerEvent>());
//
//   expect(spyFocusSpaceObject).toHaveBeenCalled();
// });

// it('startBodyDrag() should call startDrag on draggable', () => {
//   let fixture = MockRender(componentType);
//   let component = fixture.point.componentInstance;
//
//   let spyStartDrag = createSpy();
//   let body = ineeda<SpaceObject>({
//     label: '',
//     draggableHandle: ineeda<Draggable>({
//       startDrag: spyStartDrag,
//     }),
//   });
//   let event = {} as any;
//   let screen = {} as any;
//   let camera = {} as any;
//   component.startBodyDrag(body, event, screen, camera);
//
//   let [spyEvent, spyScreen, spyCallback, spyCamera]
//     = spyStartDrag.calls.mostRecent().args;
//
//   expect(spyEvent).toBe(event);
//   expect(spyScreen).toBe(screen);
//   expect(typeof spyCallback).toBe('function');
//   expect(spyCamera).toBe(camera);
// });
