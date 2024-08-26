import { TestBed } from '@angular/core/testing';

import { FactoryListResolverService } from './factory-list-resolver.service';

describe('FactoryListResolverService', () => {
  let service: FactoryListResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactoryListResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
