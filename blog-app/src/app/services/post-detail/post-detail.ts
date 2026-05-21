import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';

@Injectable({
    providedIn: 'root'
})
export class PostDetailService {
    private readonly POSTS_KEY = 'blogPosts';
    private readonly COMMENTS_KEY = 'blogComments';

    public getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }> {
        const posts: Post[] = JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
        const post = posts.find(p => p.id === id);

        if (!post) {
            return throwError(() => new Error('Пост не найден')).pipe(delay(500));
        }

        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        const postComments = allComments.filter(c => c.postId === id);

        return of({ post, comments: postComments }).pipe(delay(500));
    }

    // добавление комментария
    public addComment(comment: PostComment): Observable<PostComment[]> {
        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        allComments.unshift(comment); // добавляем в начало
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));

        // возвращаем обновленный список комментариев именно для этого поста
        const postComments = allComments.filter(c => c.postId === comment.postId);
        return of(postComments).pipe(delay(300));
    }

    // изменение рейтинга поста
    public updatePostRating(postId: string, newRating: number): Observable<void> {
        const posts: Post[] = JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], rating: newRating };
            localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
        }
        return of(undefined).pipe(delay(200));
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