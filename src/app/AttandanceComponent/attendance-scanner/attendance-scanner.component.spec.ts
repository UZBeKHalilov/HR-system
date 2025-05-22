import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceScannerComponent } from './attendance-scanner.component';

describe('AttendanceScannerComponent', () => {
  let component: AttendanceScannerComponent;
  let fixture: ComponentFixture<AttendanceScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});



