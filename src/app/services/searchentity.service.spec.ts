import { TestBed } from '@angular/core/testing';

import { SearchEntityService } from './searchentity.service';

describe('SearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchEntityService = TestBed.get(SearchEntityService);
    expect(service).toBeTruthy();
  });
});
