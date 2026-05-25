import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, concatMap, toArray } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';
import { ArticleMapperService } from '../articles/article-mapper.service';
import { IPostDetailService } from './post-detail.interface';
import { GET_POST_QUERY, ADD_COMMENT_MUTATION, ARTICLE_UP, ARTICLE_DOWN, COMMENT_UP, COMMENT_DOWN } from '../articles/graphql.queries';

@Injectable()
export class HttpPostDetailService implements IPostDetailService {
    private apollo = inject(Apollo);
    private mapper = inject(ArticleMapperService);

    public getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }> {
        return this.apollo.query<any>({
            query: GET_POST_QUERY,
            variables: { id },
            fetchPolicy: 'no-cache'
        }).pipe(
            map(response => {
                const article = response.data.article;
                const post = this.mapper.mapToPost(article);
                post.theme = 'Без категории';

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
            })
        );
    }

    public addComment(comment: PostComment): Observable<PostComment[]> {
        const input = { articleId: comment.postId, username: comment.author, content: comment.text };
        return this.apollo.mutate<any>({
            mutation: ADD_COMMENT_MUTATION,
            variables: { input }
        }).pipe(
            map(response => {
                const c = response.data.createComment;
                return [{ id: c.id, postId: c.articleId, author: c.username, text: c.content, rating: c.rating, date: c.createdAt }];
            })
        );
    }

    public updatePostRating(postId: string, ratingDelta: number, newRating: number): Observable<any> {
        if (ratingDelta === 0) return of(undefined);
        const mutation = ratingDelta > 0 ? ARTICLE_UP : ARTICLE_DOWN;
        const requests = Array.from({ length: Math.abs(ratingDelta) });

        return from(requests).pipe(
            concatMap(() => this.apollo.mutate({ mutation, variables: { id: postId } })),
            toArray()
        );
    }

    public updateCommentRating(commentId: string, ratingDelta: number, newRating: number, postId: string): Observable<any> {
        if (ratingDelta === 0) return of(undefined);
        const mutation = ratingDelta > 0 ? COMMENT_UP : COMMENT_DOWN;
        const requests = Array.from({ length: Math.abs(ratingDelta) });

        return from(requests).pipe(
            concatMap(() => this.apollo.mutate({ mutation, variables: { id: commentId } })),
            toArray()
        );
    }
}