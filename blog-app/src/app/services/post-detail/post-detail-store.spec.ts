import { TestBed } from '@angular/core/testing';

import { PostDetailStore } from './post-detail-store';

describe('PostDetailStore', () => {
  let service: PostDetailStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostDetailStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
