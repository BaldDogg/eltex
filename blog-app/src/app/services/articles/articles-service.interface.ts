import { Observable } from 'rxjs';
import { Post } from '../../models/post';
import { PaginatedPosts } from './types/paginated-posts.interface';

// интерфейс сервиса статей
export interface IArticlesService {
    getPosts(page: number, limit: number): Observable<PaginatedPosts>;
    addPost(post: Post, page: number, limit: number): Observable<PaginatedPosts>;
    updatePost(post: Post, page: number, limit: number): Observable<PaginatedPosts>;
    deletePost(id: string, page: number, limit: number): Observable<PaginatedPosts>;
}