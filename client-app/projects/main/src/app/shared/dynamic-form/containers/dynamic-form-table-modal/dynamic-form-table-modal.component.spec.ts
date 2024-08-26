import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormTableModalComponent } from './dynamic-form-table-modal.component';

describe('DynamicFormTableModalComponent', () => {
  let component: DynamicFormTableModalComponent;
  let fixture: ComponentFixture<DynamicFormTableModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormTableModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicFormTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
