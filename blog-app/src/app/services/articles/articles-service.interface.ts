import { Observable } from 'rxjs';
import { Post } from '../../models/post';

// интерфейс ответа с пагинацией
export interface PaginatedPosts {
    posts: Post[];
    totalCount: number;
}

// интерфейс сервиса статей
export interface IArticlesService {
    getPosts(page: number, limit: number): Observable<PaginatedPosts>;
    addPost(post: Post, page: number, limit: number): Observable<PaginatedPosts>;
    updatePost(post: Post, page: number, limit: number): Observable<PaginatedPosts>;
    deletePost(id: string, page: number, limit: number): Observable<PaginatedPosts>;
}