import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureAnalyzerComponent } from './feature-analyzer.component';

describe('FeatureAnalyzerComponent', () => {
  let component: FeatureAnalyzerComponent;
  let fixture: ComponentFixture<FeatureAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAnalyzerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeatureAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
