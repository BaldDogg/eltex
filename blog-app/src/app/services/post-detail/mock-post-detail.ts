import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';
import { ArticlesStoreService } from '../articles/articles-store.service';
import { IPostDetailService } from './post-detail.interface';

@Injectable()
export class MockPostDetailService implements IPostDetailService {
    private store = inject(ArticlesStoreService);
    private readonly POSTS_KEY = 'blogPosts';
    private readonly COMMENTS_KEY = 'blogComments';

    public getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }> {
        const comments$ = of(JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]').filter((c: any) => c.postId === id));

        const postFromStore = this.store.posts().find(p => p.id === id);
        if (postFromStore) {
            return forkJoin({ post: of(postFromStore), comments: comments$ });
        }

        const posts: Post[] = JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
        const post = posts.find(p => p.id === id);

        if (!post) {
            return throwError(() => new Error('Пост не найден')).pipe(delay(500));
        }
        return forkJoin({ post: of(post), comments: comments$ });
    }

    public addComment(comment: PostComment): Observable<PostComment[]> {
        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        allComments.unshift(comment);
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
        const postComments = allComments.filter(c => c.postId === comment.postId);
        return of(postComments).pipe(delay(300));
    }

    public updatePostRating(postId: string, ratingDelta: number, newRating: number): Observable<any> {
        const posts: Post[] = JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], rating: newRating };
            localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
        }
        return of(undefined).pipe(delay(200));
    }

    public updateCommentRating(commentId: string, ratingDelta: number, newRating: number, postId: string): Observable<any> {
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