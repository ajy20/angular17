import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRuleListComponent } from './product-rule-list.component';

describe('ProductRuleListComponent', () => {
  let component: ProductRuleListComponent;
  let fixture: ComponentFixture<ProductRuleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductRuleListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductRuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
