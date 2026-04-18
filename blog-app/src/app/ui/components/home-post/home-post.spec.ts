import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePost } from './home-post';

describe('HomePost', () => {
    let component: HomePost;
    let fixture: ComponentFixture<HomePost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomePost],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePost);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
