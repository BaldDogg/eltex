import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap, catchError, of } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PostDetailService } from '../../../services/post-detail/post-detail';
import { PostDetailStore } from '../../../services/post-detail/post-detail-store';
import { PostComment } from '../../../services/articles/types/post-comment.interface';

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
        MatIconModule
    ],
    templateUrl: './post-detail.html',
    styleUrl: './post-detail.scss'
})
export class PostDetail implements OnInit {
    // сервисы
    private route = inject(ActivatedRoute);
    private dataService = inject(PostDetailService);
    private store = inject(PostDetailStore);
    private titleService = inject(Title);
    private fb = inject(FormBuilder);

    private destroyRef = inject(DestroyRef);

    protected isLoading = this.store.isLoading;
    protected errorMessage = this.store.errorMessage;
    protected post = this.store.post;
    protected comments = this.store.comments;

    // форма комментария
    public commentForm = this.fb.group({
        author: ['', Validators.required],
        text: ['', Validators.required]
    });

    // локальные реакции пользователя
    public userPostReaction: number = 0;
    public userCommentReactions: Record<string, number> = {};

    ngOnInit(): void {
        this.route.paramMap.pipe(
            switchMap(params => {
                this.store.isLoading.set(true);
                const postId = params.get('id');

                if (!postId) return of(null);

                return this.dataService.getPostById(postId).pipe(
                    catchError(() => {
                        this.store.setError('Упс! Статья не найдена или была удалена.');
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
    submitComment() {
        if (this.commentForm.invalid || !this.store.post()) return;

        const newComment: PostComment = {
            id: Date.now().toString(),
            postId: this.store.post()!.id,
            author: this.commentForm.value.author!,
            text: this.commentForm.value.text!,
            date: new Date().toLocaleDateString(),
            rating: 0
        };

        this.dataService.addComment(newComment).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updatedComments => {
            this.store.comments.set(updatedComments);
            this.commentForm.reset();
            Object.keys(this.commentForm.controls).forEach(key => {
                this.commentForm.get(key)?.setErrors(null);
            });
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
        this.dataService.updatePostRating(currentPost.id, newRating).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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

        this.dataService.updateCommentRating(commentId, newRating, postId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updatedComments => {
            this.store.comments.set(updatedComments);
        });
    }
}