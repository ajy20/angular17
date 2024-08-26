import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentMatrixComponent } from './assignment-matrix.component';

describe('AssignmentMatrixComponent', () => {
  let component: AssignmentMatrixComponent;
  let fixture: ComponentFixture<AssignmentMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentMatrixComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignmentMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
