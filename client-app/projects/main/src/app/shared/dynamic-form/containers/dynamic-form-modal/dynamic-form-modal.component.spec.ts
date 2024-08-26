import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormModalComponent } from './dynamic-form-modal.component';

describe('DynamicFormModalComponent', () => {
  let component: DynamicFormModalComponent;
  let fixture: ComponentFixture<DynamicFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
