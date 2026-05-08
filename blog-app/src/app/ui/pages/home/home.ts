import { Component, OnInit, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePost } from '../../components/home-post/home-post';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';
import { ARTICLES_SERVICE_TOKEN } from '../../../services/articles/articles-service.token';

import { AboutMe } from '../../components/about-me/about-me';
import { Education } from '../../components/education/education';
import { Skills } from '../../components/skills/skills';
import { Instruments } from '../../components/instruments/instruments';
import { Hobbies } from '../../components/hobbies/hobbies';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterModule,
        HomePost,
        AboutMe,
        Education,
        Skills,
        Instruments,
        Hobbies
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss'
})
export class Home implements OnInit {
    // сервисы
    private dataService = inject(ARTICLES_SERVICE_TOKEN);
    public store = inject(ArticlesStoreService);

    // вычисляем 3 последние статьи из стора
    protected recentPosts = computed(() => {
        return this.store.posts().slice(0, 3);
    });

    ngOnInit(): void {
        if (!this.store.isLoaded()) {
            this.dataService.getPosts(1, 100).subscribe(res => {
                this.store.setPostsData(res.posts, res.totalCount);
            });
        }
    }
}