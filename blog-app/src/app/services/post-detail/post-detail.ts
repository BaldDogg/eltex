import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { delay, map, switchMap, catchError } from 'rxjs/operators';
import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';
import { ArticleMapperService } from '../articles/article-mapper.service';
import { ArticleEntity, CategoryEntity } from '../articles/article-backend.interfaces';

@Injectable({
    providedIn: 'root'
})
export class PostDetailService {
    private http = inject(HttpClient);
    private mapper = inject(ArticleMapperService);

    private readonly apiUrl = '/api/articles';
    private readonly categoriesUrl = '/api/categories';
    private readonly COMMENTS_KEY = 'blogComments';

    public getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }> {
        const post$ = this.http.get<ArticleEntity>(`${this.apiUrl}/${id}`).pipe(
            switchMap(article => {
                return this.http.get<CategoryEntity[]>(this.categoriesUrl).pipe(
                    map(categories => {
                        const post = this.mapper.mapToPost(article);
                        const category = categories.find(c => c.id === article.categoryId);
                        post.theme = category ? category.name : 'Без категории';
                        return post;
                    })
                );
            }),
            catchError(() => throwError(() => new Error('Пост не найден')))
        );

        const comments$ = of(JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]').filter((c: any) => c.postId === id));
        return forkJoin({ post: post$, comments: comments$ });
    }

    // добавление комментария
    public addComment(comment: PostComment): Observable<PostComment[]> {
        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        allComments.unshift(comment);
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));

        const postComments = allComments.filter(c => c.postId === comment.postId);
        return of(postComments).pipe(delay(300));
    }

    // изменение рейтинга поста 
    public updatePostRating(postId: string, newRating: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${postId}`, { rating: newRating });
    }

    // изменение рейтинга комментария
    public updateCommentRating(commentId: string, newRating: number, postId: string): Observable<PostComment[]> {
        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        const commentIndex = allComments.findIndex(c => c.id === commentId);

        if (commentIndex !== -1) {
            allComments[commentIndex].rating = newRating;
            localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
        }

        const postComments = allComments.filter(c => c.postId === postId);
        return of(postComments).pipe(delay(200));
    }
}