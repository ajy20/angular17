import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormNotificationModalComponent } from './dynamic-form-notification-modal.component';

describe('DynamicFormNotificationModalComponent', () => {
  let component: DynamicFormNotificationModalComponent;
  let fixture: ComponentFixture<DynamicFormNotificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormNotificationModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicFormNotificationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
