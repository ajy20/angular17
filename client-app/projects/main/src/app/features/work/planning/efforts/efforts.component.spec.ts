import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffortsComponent } from './efforts.component';

describe('EffortsComponent', () => {
  let component: EffortsComponent;
  let fixture: ComponentFixture<EffortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EffortsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EffortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
