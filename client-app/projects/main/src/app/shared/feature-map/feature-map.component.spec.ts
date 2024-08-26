import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureMapComponent } from './feature-map.component';

describe('FeatureMapComponent', () => {
  let component: FeatureMapComponent;
  let fixture: ComponentFixture<FeatureMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
