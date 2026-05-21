import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomePost } from '../../components/home-post/home-post';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';
import { ARTICLES_SERVICE_TOKEN } from '../../../services/articles/articles-service.token';

import { AboutMe } from '../../components/about-me/about-me';
import { Education } from '../../components/education/education';
import { Skills } from '../../components/skills/skills';
import { Instruments } from '../../components/instruments/instruments';
import { Hobbies } from '../../components/hobbies/hobbies';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


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
    private titleService = inject(Title);

    // последние посты (отдельно от пагинации, фикс ошибки)
    protected recentPosts = signal<any[]>([]);

    private destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.titleService.setTitle('Главная');

        this.dataService.getPosts(1, 3).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.recentPosts.set(res.posts);
        });

        if (!this.store.isLoaded()) {
            this.dataService.getPosts(1, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
                this.store.setPostsData(res.posts, res.totalCount);
            });
        }
    }
}