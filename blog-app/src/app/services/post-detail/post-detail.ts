import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin, throwError, from } from 'rxjs';
import { delay, map, catchError, concatMap, toArray } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';

import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';
import { ArticleMapperService } from '../articles/article-mapper.service';
import { ArticlesStoreService } from '../articles/articles-store.service';
import { IPostDetailService } from './post-detail.interface';

const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    article(id: $id) { id title content categoryId rating createdAt imgSrc } 
    commentsByArticle(articleId: $id) { id articleId username content rating createdAt }
  }
`;

const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: CreateCommentInput!) {
    createComment(createComment: $input) { id articleId username content rating createdAt }
  }
`;

const ARTICLE_UP = gql`mutation Up($id: ID!) { articleRatingUp(id: $id) { id rating } }`;
const ARTICLE_DOWN = gql`mutation Down($id: ID!) { articleRatingDown(id: $id) { id rating } }`;

const COMMENT_UP = gql`mutation Up($id: ID!) { commentRatingUp(id: $id) { id rating } }`;
const COMMENT_DOWN = gql`mutation Down($id: ID!) { commentRatingDown(id: $id) { id rating } }`;

@Injectable()
export class PostDetailService implements IPostDetailService {
    private apollo = inject(Apollo);
    private mapper = inject(ArticleMapperService);
    private store = inject(ArticlesStoreService);

    private readonly POSTS_KEY = 'blogPosts';
    private readonly COMMENTS_KEY = 'blogComments';

    public getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }> {
        const isGithubPages = window.location.hostname.includes('github.io');

        // логика локального хранилища для GitHub Pages
        if (isGithubPages) {
            return this.getLocalPost(id);
        }

        // логика для работы с бэкендом
        return this.apollo.query<any>({
            query: GET_POST_QUERY,
            variables: { id },
            // сделала так, потому что не подгружались комментарии до перезагрузки страницы с помощью f5
            fetchPolicy: 'no-cache'
        }).pipe(
            map(response => {
                const article = response.data.article;
                const post = this.mapper.mapToPost(article);
                post.theme = 'Без категории';

                // попытка сделать так, чтобы с других компьютеров получилось подгружать изображения
                const targetHost = window.location.hostname;
                if (article.imgSrc) {
                    post.image = article.imgSrc.replace(/localhost|127\.0\.0\.1/gi, targetHost);
                } else if (post.image && typeof post.image === 'string') {
                    post.image = post.image.replace(/localhost|127\.0\.0\.1/gi, targetHost);
                }

                const comments = response.data.commentsByArticle.map((c: any) => ({
                    id: c.id,
                    postId: c.articleId,
                    author: c.username,
                    text: c.content,
                    rating: c.rating,
                    date: c.createdAt
                }));

                return { post, comments };
            }),
            catchError(() => this.getLocalPost(id))
        );
    }

    // добавление комментария
    public addComment(comment: PostComment): Observable<PostComment[]> {
        const isGithubPages = window.location.hostname.includes('github.io');

        if (isGithubPages) {
            return this.addLocalComment(comment);
        }

        const input = { articleId: comment.postId, username: comment.author, content: comment.text };
        return this.apollo.mutate<any>({
            mutation: ADD_COMMENT_MUTATION,
            variables: { input }
        }).pipe(
            map(response => {
                const c = response.data.createComment;
                return [{ id: c.id, postId: c.articleId, author: c.username, text: c.content, rating: c.rating, date: c.createdAt }];
            }),
            catchError(() => this.addLocalComment(comment))
        );
    }

    // изменение рейтинга поста 
    public updatePostRating(postId: string, ratingDelta: number, newRating: number): Observable<any> {
        const isGithubPages = window.location.hostname.includes('github.io');

        if (isGithubPages) {
            return this.updateLocalPostRating(postId, newRating);
        }

        if (ratingDelta === 0) return of(undefined);
        const mutation = ratingDelta > 0 ? ARTICLE_UP : ARTICLE_DOWN;
        const requests = Array.from({ length: Math.abs(ratingDelta) });

        return from(requests).pipe(
            concatMap(() => this.apollo.mutate({ mutation, variables: { id: postId } })),
            toArray(),
            catchError(() => this.updateLocalPostRating(postId, newRating))
        );
    }

    // изменение рейтинга комментария
    public updateCommentRating(commentId: string, ratingDelta: number, newRating: number, postId: string): Observable<any> {
        const isGithubPages = window.location.hostname.includes('github.io');

        if (isGithubPages) {
            return this.updateLocalCommentRating(commentId, newRating, postId);
        }

        if (ratingDelta === 0) return of(undefined);
        const mutation = ratingDelta > 0 ? COMMENT_UP : COMMENT_DOWN;
        const requests = Array.from({ length: Math.abs(ratingDelta) });

        return from(requests).pipe(
            concatMap(() => this.apollo.mutate({ mutation, variables: { id: commentId } })),
            toArray(),
            catchError(() => this.updateLocalCommentRating(commentId, newRating, postId))
        );
    }

    private getLocalPost(id: string): Observable<{ post: Post, comments: PostComment[] }> {
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

    private addLocalComment(comment: PostComment): Observable<PostComment[]> {
        const allComments: PostComment[] = JSON.parse(localStorage.getItem(this.COMMENTS_KEY) || '[]');
        allComments.unshift(comment);
        localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(allComments));
        const postComments = allComments.filter(c => c.postId === comment.postId);
        return of(postComments).pipe(delay(300));
    }

    private updateLocalPostRating(postId: string, newRating: number): Observable<any> {
        const posts: Post[] = JSON.parse(localStorage.getItem(this.POSTS_KEY) || '[]');
        const postIndex = posts.findIndex(p => p.id === postId);

        if (postIndex !== -1) {
            posts[postIndex] = { ...posts[postIndex], rating: newRating };
            localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
        }
        return of(undefined).pipe(delay(200));
    }

    private updateLocalCommentRating(commentId: string, newRating: number, postId: string): Observable<any> {
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