import { TestBed } from '@angular/core/testing';

import { BrowseEntityService } from './browse-entity.service';

describe('BrowseEntityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BrowseEntityService = TestBed.get(BrowseEntityService);
    expect(service).toBeTruthy();
  });
});
