import { Observable } from 'rxjs';
import { Post } from '../../models/post';
import { PostComment } from '../articles/types/post-comment.interface';

export interface IPostDetailService {
    getPostById(id: string): Observable<{ post: Post, comments: PostComment[] }>;
    addComment(comment: PostComment): Observable<PostComment[]>;
    updatePostRating(postId: string, ratingDelta: number, newRating: number): Observable<any>;
    updateCommentRating(commentId: string, ratingDelta: number, newRating: number, postId: string): Observable<any>;
}