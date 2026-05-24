import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { switchMap, catchError, of } from 'rxjs';
import { DatePipe } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PostDetailService } from '../../../services/post-detail/post-detail';
import { PostDetailStore } from '../../../services/post-detail/post-detail-store';
import { PostComment } from '../../../services/articles/types/post-comment.interface';
import { WsService } from '../../../services/ws';
import { POST_DETAIL_SERVICE_TOKEN } from '../../../services/post-detail/post-detail.token';

import { CommentForm } from '../../components/comment-form/comment-form';
import { CommentItem } from '../../components/comment-item/comment-item';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-post-detail',
    standalone: true,
    imports: [
        RouterLink,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        DatePipe,
        CommentForm,
        CommentItem
    ],
    providers: [
        PostDetailStore,
        {
            provide: POST_DETAIL_SERVICE_TOKEN,
            useClass: PostDetailService
        }
    ],
    templateUrl: './post-detail.html',
    styleUrl: './post-detail.scss'
})
export class PostDetail implements OnInit {
    // сервисы
    private route = inject(ActivatedRoute);
    private dataService = inject(POST_DETAIL_SERVICE_TOKEN);
    private store = inject(PostDetailStore);
    private titleService = inject(Title);
    private wsService = inject(WsService);

    private destroyRef = inject(DestroyRef);

    protected isLoading = this.store.isLoading;
    protected errorMessage = this.store.errorMessage;
    protected post = this.store.post;
    protected comments = this.store.comments;

    // локальные реакции пользователя
    public userPostReaction: number = 0;
    public userCommentReactions: Record<string, number> = {};
    private currentWsArticleId: string | null = null;

    ngOnInit(): void {
        // подключение к сокетам
        this.wsService.connect();

        this.route.paramMap.pipe(
            switchMap(params => {
                this.store.isLoading.set(true);
                const postId = params.get('id');

                // отписка от прошлой статьи
                if (this.currentWsArticleId) {
                    this.wsService.unsubscribeFromArticle(this.currentWsArticleId);
                }

                if (!postId) {
                    this.store.isLoading.set(false);
                    return of(null);
                }

                // подписка на текущую
                this.currentWsArticleId = postId;
                this.wsService.subscribeToArticle(postId);

                return this.dataService.getPostById(postId).pipe(
                    catchError(() => {
                        this.store.setError('Упс! Статья не найдена или была удалена.');
                        this.store.isLoading.set(false);
                        return of(null);
                    })
                );
            })
        ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
            if (data) {
                this.store.setPostData(data.post, data.comments);
                this.titleService.setTitle(`Статья: ${data.post.title}`);

                // загрузка реакций из памяти
                const allUserReactions = JSON.parse(localStorage.getItem('userReactions') || '{}');
                this.userPostReaction = allUserReactions[data.post.id] || 0;

                data.comments.forEach(c => {
                    this.userCommentReactions[c.id] = allUserReactions[c.id] || 0;
                });

                this.store.isLoading.set(false);
            }
        });

        // слушаем события сокетов
        this.wsService.messages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(msg => {
            if (msg.event === 'comment-created' || msg.type === 'COMMENT_CREATED') {
                const currentComments = this.store.comments();
                if (!currentComments.find(c => c.id === msg.payload.commentId)) {
                    const newC: PostComment = {
                        id: msg.payload.commentId,
                        postId: msg.payload.articleId,
                        author: msg.payload.username,
                        text: msg.payload.content,
                        rating: 0,
                        date: msg.payload.createdAt
                    };
                    this.store.comments.set([newC, ...currentComments]);
                }
            }
            if (msg.event === 'comment-rating-changed' || msg.type === 'COMMENT_RATING_CHANGED') {
                const updatedComments = this.store.comments().map(c =>
                    c.id === msg.payload.commentId ? { ...c, rating: msg.payload.rating } : c
                );
                this.store.comments.set(updatedComments);
            }
            if (msg.event === 'article-rating-changed' || msg.type === 'ARTICLE_RATING_CHANGED') {
                const currentPost = this.store.post();
                if (currentPost && currentPost.id === msg.payload.articleId) {
                    this.store.updatePostRating(msg.payload.rating);
                }
            }
        });

        // чистка подписок
        this.destroyRef.onDestroy(() => {
            if (this.currentWsArticleId) {
                this.wsService.unsubscribeFromArticle(this.currentWsArticleId);
            }
        });
    }

    // сохранение реакции в память
    private saveUserReactionToStorage(id: string, reaction: number) {
        const reactions = JSON.parse(localStorage.getItem('userReactions') || '{}');
        if (reaction === 0) {
            delete reactions[id];
        } else {
            reactions[id] = reaction;
        }
        localStorage.setItem('userReactions', JSON.stringify(reactions));
    }

    // добавление комментария
    submitNewComment(commentData: { author: string, text: string }) {
        if (!this.store.post()) return;

        const newComment: PostComment = {
            id: Date.now().toString(),
            postId: this.store.post()!.id,
            author: commentData.author,
            text: commentData.text,
            date: new Date().toISOString(),
            rating: 0
        };

        this.dataService.addComment(newComment).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(createdComments => {
            if (createdComments && createdComments.length > 0) {
                const currentComments = this.store.comments();
                if (!currentComments.find(c => c.id === createdComments[0].id)) {
                    this.store.comments.set([...createdComments, ...currentComments]);
                }
            }
        });
    }

    // рейтинг статьи
    changePostRating(attemptedReaction: number) {
        const currentPost = this.store.post();
        if (!currentPost) return;

        let ratingDelta = 0;

        if (this.userPostReaction === attemptedReaction) {
            ratingDelta = -attemptedReaction;
            this.userPostReaction = 0;
        } else {
            ratingDelta = attemptedReaction - this.userPostReaction;
            this.userPostReaction = attemptedReaction;
        }

        const newRating = (currentPost.rating || 0) + ratingDelta;
        this.store.updatePostRating(newRating);
        this.saveUserReactionToStorage(currentPost.id, this.userPostReaction);
        this.dataService.updatePostRating(currentPost.id, ratingDelta, newRating).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    // рейтинг комментария
    changeCommentRating(commentId: string, currentRating: number, attemptedReaction: number) {
        const postId = this.store.post()?.id;
        if (!postId) return;

        const currentReaction = this.userCommentReactions[commentId] || 0;
        let ratingDelta = 0;

        if (currentReaction === attemptedReaction) {
            ratingDelta = -attemptedReaction;
            this.userCommentReactions[commentId] = 0;
        } else {
            ratingDelta = attemptedReaction - currentReaction;
            this.userCommentReactions[commentId] = attemptedReaction;
        }

        const newRating = currentRating + ratingDelta;
        this.saveUserReactionToStorage(commentId, this.userCommentReactions[commentId]);

        // мгновенное обновление
        const updatedComments = this.store.comments().map(c =>
            c.id === commentId ? { ...c, rating: newRating } : c
        );
        this.store.comments.set(updatedComments);
        this.dataService.updateCommentRating(commentId, ratingDelta, newRating, postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
}