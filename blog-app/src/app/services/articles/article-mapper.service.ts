import { Injectable } from '@angular/core';
import { Post } from '../../models/post';
import { ArticleEntity, CreateArticleDto, UpdateArticleDto } from './article-backend.interfaces';

@Injectable({
    providedIn: 'root'
})
export class ArticleMapperService {

    // перевод структуры бэкенда на фронтенд
    public mapToPost(entity: ArticleEntity): Post {
        const articleDate = entity.createdAt
            ? new Date(entity.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString();

        return {
            id: entity.id,
            title: entity.title,
            text: entity.content,
            theme: entity.categoryId,
            rating: entity.rating || 0,
            date: articleDate,
            image: entity.imgSrc ? `http://localhost:3000${entity.imgSrc}` : 'assets/kotik-template.jpg'
        };
    }

    // перевод структуры фронтенда на бэкенд (создание поста)
    public mapToCreateDto(post: Post): CreateArticleDto {
        return {
            title: post.title,
            content: post.text,
            categoryId: post.theme
        };
    }

    // перевод с фронтенда на бэкенд (обновление поста)
    public mapToUpdateDto(post: Post): UpdateArticleDto {
        return {
            title: post.title,
            content: post.text,
            categoryId: post.theme
        };
    }
}