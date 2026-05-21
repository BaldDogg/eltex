import { TestBed } from '@angular/core/testing';

import { PostDetail } from '../../ui/pages/post-detail/post-detail';

describe('PostDetail', () => {
    let service: PostDetail;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PostDetail);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
