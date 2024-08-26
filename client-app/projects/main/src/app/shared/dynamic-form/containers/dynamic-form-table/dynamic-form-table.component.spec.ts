import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormTableComponent } from './dynamic-form-table.component';

describe('DynamicFormTableComponent', () => {
  let component: DynamicFormTableComponent;
  let fixture: ComponentFixture<DynamicFormTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicFormTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
