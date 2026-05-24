import { Injectable, signal } from '@angular/core';
import { Post } from '../../models/post';

@Injectable({
    providedIn: 'root'
})
export class ArticlesStoreService {
    // свойства хранилища
    public posts = signal<Post[]>([]);
    public totalCount = signal<number>(0);
    public currentPage = signal<number>(1);

    // проверка загрузки
    public isLoaded = signal<boolean>(false);

    // сохранение списка статей
    public setPostsData(posts: Post[], total: number): void {
        this.posts.set(posts);
        this.totalCount.set(total);
        this.isLoaded.set(true);
    }

    // сохранение состояния пагинации
    public setCurrentPage(page: number): void {
        this.currentPage.set(page);
    }

    // принудительное обновление из памяти
    public refreshFromStorage(): void {
        const posts: Post[] = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        this.posts.set(posts);
        this.totalCount.set(posts.length);
        this.isLoaded.set(true);
    }
}