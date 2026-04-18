import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPost } from '../../components/blog-post/blog-post';
// ИМПОРТИРУЕМ НАШУ ФОРМУ!
import { MakePost } from '../../components/make-post/make-post';

export interface Post {
    id: string;
    image: string;
    title: string;
    theme: string;
    text: string;
    date: string;
}

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule, BlogPost, MakePost],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class Blog implements OnInit {
    // массив, где будут лежать данные всех постов (создаем пустой, если нет в памяти)
    posts: Post[] = [];

    // лоадер 
    isLoading = true;

    isMakePostOpen = false;

    // сайд-бар
    isMobileMenuOpen = false;

    @ViewChild('statsDialog') statsDialogRef!: ElementRef<HTMLDialogElement>;

    constructor(private cdr: ChangeDetectorRef) { }

    // функция для загрузки постов из памяти
    ngOnInit(): void {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
                // локальное хранилище
                const savedPosts = localStorage.getItem('blogPosts');

                if (savedPosts) {
                    // цикл перебирает массив с конца в начало, чтобы новые посты были сверху
                    this.posts = JSON.parse(savedPosts).reverse();
                }
            } catch (error) {
                this.posts = [];
                localStorage.removeItem('blogPosts');
            }
        }

        // имитация ожидания ответа от сервера
        setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
        }, 1000);
    }

    // сайд-бар
    // сайд-бар в мобильной версии со стрелкой
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    // статистика
    openStats() {
        // считаем посты, будущие комментарии (в HTML)
        this.statsDialogRef.nativeElement.showModal();
    }

    // закрытие диалогового окна статистики
    closeStats() {
        this.statsDialogRef.nativeElement.close();
    }

    // проверка кликов вне окна, если находит - закрытие окна
    onDialogClick(event: MouseEvent) {
        const dialogElement = this.statsDialogRef.nativeElement;
        const rect = dialogElement.getBoundingClientRect();

        const clickIsOutside = (
            event.clientY < rect.top ||
            event.clientY > rect.bottom ||
            event.clientX < rect.left ||
            event.clientX > rect.right
        );

        if (clickIsOutside) {
            // закрытие сайд-бара
            this.closeStats();
        }
    }

    // добавить статью 
    // прокрутка до формы создания поста
    openMakePost() {
        this.isMakePostOpen = true;
        setTimeout(() => {
            document.getElementById('make-post')?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }

    // отмена
    closeMakePost() {
        this.isMakePostOpen = false;
    }

    // новый пост
    addNewPost(newPost: Post) {
        // сохраняем данные в массив
        this.posts.unshift(newPost);

        // записываем массив в localstorage
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));

        // закрываем форму
        this.isMakePostOpen = false;
    }

    // удалить статью 
    deletePost(id: string) {
        this.posts = this.posts.filter(p => p.id !== id);
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }
}