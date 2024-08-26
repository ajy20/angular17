import { TestBed } from '@angular/core/testing';

import { FeatureListVersionResolverService } from './feature-list-version-resolver.service';

describe('FeatureListVersionResolverService', () => {
  let service: FeatureListVersionResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureListVersionResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
