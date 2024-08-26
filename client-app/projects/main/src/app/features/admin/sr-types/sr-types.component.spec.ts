import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrTypesComponent } from './sr-types.component';

describe('SrTypesComponent', () => {
  let component: SrTypesComponent;
  let fixture: ComponentFixture<SrTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SrTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
