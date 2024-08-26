import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFeatureListComponent } from './product-feature-list.component';

describe('ProductFeatureListComponent', () => {
  let component: ProductFeatureListComponent;
  let fixture: ComponentFixture<ProductFeatureListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFeatureListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductFeatureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
