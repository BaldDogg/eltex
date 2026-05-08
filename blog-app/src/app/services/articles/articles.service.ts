import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IArticlesService, PaginatedPosts } from './articles-service.interface';
import { Post } from '../../models/post';

@Injectable({
    providedIn: 'root'
})
export class ArticlesService implements IArticlesService {
    // ключ для localstorage
    private readonly STORAGE_KEY = 'blogPosts';

    // получение всех постов из памяти
    private getAllFromStorage(): Post[] {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // сохранение массива в память
    private saveToStorage(posts: Post[]): void {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
        }
    }

    // нарезка массива для пагинации
    private paginate(posts: Post[], page: number, limit: number): PaginatedPosts {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        return {
            posts: posts.slice(startIndex, endIndex),
            totalCount: posts.length
        };
    }

    // получение постов
    public getPosts(page: number, limit: number): Observable<PaginatedPosts> {
        const allPosts = this.getAllFromStorage();
        return of(this.paginate(allPosts, page, limit)).pipe(delay(500));
    }

    // добавление поста
    public addPost(post: Post, page: number, limit: number): Observable<PaginatedPosts> {
        const allPosts = this.getAllFromStorage();
        allPosts.unshift(post);
        this.saveToStorage(allPosts);
        return of(this.paginate(allPosts, page, limit)).pipe(delay(500));
    }

    // обновление поста
    public updatePost(post: Post, page: number, limit: number): Observable<PaginatedPosts> {
        const allPosts = this.getAllFromStorage();
        const index = allPosts.findIndex(p => p.id === post.id);
        if (index !== -1) {
            allPosts[index] = post;
            this.saveToStorage(allPosts);
        }
        return of(this.paginate(allPosts, page, limit)).pipe(delay(500));
    }

    // удаление поста
    public deletePost(id: string, page: number, limit: number): Observable<PaginatedPosts> {
        let allPosts = this.getAllFromStorage();
        allPosts = allPosts.filter(p => p.id !== id);
        this.saveToStorage(allPosts);

        const totalPages = Math.ceil(allPosts.length / limit);
        if (page > totalPages && totalPages > 0) {
            page = totalPages;
        }

        return of(this.paginate(allPosts, page, limit)).pipe(delay(500));
    }
}