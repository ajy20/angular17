import { TestBed } from '@angular/core/testing';

import { ProductMenuService } from './product-menu.service';

describe('ProductMenuService', () => {
  let service: ProductMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
