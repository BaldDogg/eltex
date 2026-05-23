import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IArticlesService } from './articles-service.interface';
import { Post } from '../../models/post';
import { PaginatedPosts } from './types/paginated-posts.interface';
import { ArticleMapperService } from './article-mapper.service';
import { ArticleEntity, CategoryEntity } from './article-backend.interfaces';

interface BackendPaginatedResponse {
    items: ArticleEntity[];
    total: number;
    page: number;
    limit: number;
}

@Injectable()
export class HttpArticlesService implements IArticlesService {
    private http = inject(HttpClient);
    private mapper = inject(ArticleMapperService);

    private apiUrl = '/api/articles';
    private categoriesUrl = '/api/categories';

    // получение всех категорий
    public getCategories(): Observable<CategoryEntity[]> {
        return this.http.get<CategoryEntity[]>(this.categoriesUrl);
    }

    // поиск или создание категории
    private getOrCreateCategory(categoryName: string): Observable<string> {
        if (!categoryName) categoryName = 'Без категории';

        return this.http.get<CategoryEntity[]>(this.categoriesUrl).pipe(
            switchMap(categories => {
                const existingCategory = categories.find(c => c.name === categoryName);

                if (existingCategory) {
                    return of(existingCategory.id);
                } else {
                    return this.http.post<CategoryEntity>(this.categoriesUrl, { name: categoryName }).pipe(
                        map(newCategory => newCategory.id)
                    );
                }
            })
        );
    }

    // получение списка постов с подменой id категории на имя
    public getPosts(page: number, limit: number): Observable<PaginatedPosts> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return forkJoin({
            categories: this.getCategories(),
            response: this.http.get<BackendPaginatedResponse>(this.apiUrl, { params })
        }).pipe(
            map(({ categories, response }) => ({
                posts: response.items.map(item => {
                    const post = this.mapper.mapToPost(item);
                    const foundCategory = categories.find(c => c.id === item.categoryId);
                    post.theme = foundCategory ? foundCategory.name : 'Без категории';
                    return post;
                }),
                totalCount: response.total
            }))
        );
    }

    // добавление поста
    public addPost(post: Post, page: number, limit: number): Observable<PaginatedPosts> {
        return this.getOrCreateCategory(post.theme).pipe(
            switchMap(categoryId => {
                const formData = new FormData();
                formData.append('title', post.title);
                formData.append('content', post.text);
                formData.append('categoryId', categoryId);

                if ((post.image as any) instanceof File) {
                    formData.append('image', post.image as any);
                }

                return this.http.post<ArticleEntity>(this.apiUrl, formData);
            }),
            switchMap(() => this.getPosts(page, limit))
        );
    }

    // обновление поста
    public updatePost(post: Post, page: number, limit: number): Observable<PaginatedPosts> {
        return this.getOrCreateCategory(post.theme).pipe(
            switchMap(categoryId => {
                const formData = new FormData();
                formData.append('title', post.title);
                formData.append('content', post.text);
                formData.append('categoryId', categoryId);

                if ((post.image as any) instanceof File) {
                    formData.append('image', post.image as any);
                }

                return this.http.patch<ArticleEntity>(`${this.apiUrl}/${post.id}`, formData);
            }),
            switchMap(() => this.getPosts(page, limit))
        );
    }

    // удаление поста
    public deletePost(id: string, page: number, limit: number): Observable<PaginatedPosts> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            switchMap(() => this.getPosts(page, limit))
        );
    }
}