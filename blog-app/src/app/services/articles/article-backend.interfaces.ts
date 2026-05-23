// создание поста
export interface CreateArticleDto {
    title: string;
    content: string;
    categoryId?: string;
}

// обновление поста
export interface UpdateArticleDto {
    title: string;
    content: string;
    categoryId?: string;
}

// то, что возвращает сервер
export interface ArticleEntity {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    rating: number;
    imgSrc?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// категории
export interface CategoryEntity {
    id: string;
    name: string;
}

export interface CreateCategoryDto {
    name: string;
}
