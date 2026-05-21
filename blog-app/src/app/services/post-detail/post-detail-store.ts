import { Injectable, signal } from '@angular/core';
import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';

@Injectable({
    providedIn: 'root'
})
export class PostDetailStore {
    // сигналы для хранения состояния
    public post = signal<Post | null>(null);
    public comments = signal<PostComment[]>([]);
    public isLoading = signal<boolean>(true);
    public errorMessage = signal<string | null>(null);

    // загрузка данных
    public setPostData(post: Post, comments: PostComment[]) {
        this.post.set(post);
        this.comments.set(comments);
        this.isLoading.set(false);
        this.errorMessage.set(null);
    }

    // если пост не найден
    public setError(msg: string) {
        this.errorMessage.set(msg);
        this.isLoading.set(false);
    }

    // рейтинг поста
    public updatePostRating(newRating: number) {
        const currentPost = this.post();
        if (currentPost) {
            this.post.set({ ...currentPost, rating: newRating });
        }
    }
}