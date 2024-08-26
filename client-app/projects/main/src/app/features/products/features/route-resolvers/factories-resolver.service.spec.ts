import { TestBed } from '@angular/core/testing';

import { FactoriesResolverService } from './factories-resolver.service';

describe('FactoriesResolverService', () => {
  let service: FactoriesResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactoriesResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
