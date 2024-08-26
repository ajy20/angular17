import { TestBed } from '@angular/core/testing';

import { LexicalRankService } from './lexical-rank.service';

describe('LexicalRankService', () => {
  let service: LexicalRankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LexicalRankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
