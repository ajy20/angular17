import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFeatureListTableComponent } from './product-feature-list-table.component';

describe('ProductFeatureListTableComponent', () => {
  let component: ProductFeatureListTableComponent;
  let fixture: ComponentFixture<ProductFeatureListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFeatureListTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductFeatureListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
