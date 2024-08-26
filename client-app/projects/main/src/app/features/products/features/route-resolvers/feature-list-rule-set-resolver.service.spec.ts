import { TestBed } from '@angular/core/testing';

import { FeatureListRuleSetResolverService } from './feature-list-rule-set-resolver.service';

describe('FeatureListRuleSetResolverService', () => {
  let service: FeatureListRuleSetResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureListRuleSetResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
