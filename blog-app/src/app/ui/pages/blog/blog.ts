import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BlogPost } from '../../components/blog-post/blog-post';
import { MakePost } from '../../components/make-post/make-post';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [BlogPost, MakePost],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class Blog implements OnInit {
    // массив, где будут лежать данные всех постов (создаем пустой, если нет в памяти)
    protected posts: Post[] = [];

    // лоадер 
    protected isLoading = true;

    protected isMakePostOpen = false;

    // сайд-бар
    protected isMobileMenuOpen = false;

    protected selectedPost: Post | null = null;

    @ViewChild('statsDialog') protected statsDialogRef!: ElementRef<HTMLDialogElement>;

    constructor(private cdr: ChangeDetectorRef) { }

    // функция для загрузки постов из памяти
    ngOnInit(): void {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
                const savedPosts = localStorage.getItem('blogPosts');

                if (savedPosts) {
                    this.posts = JSON.parse(savedPosts);
                }
            } catch (error) {
                this.posts = [];
                localStorage.removeItem('blogPosts');
            }
        }

        setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
        }, 1000);
    }

    // сайд-бар
    // сайд-бар в мобильной версии со стрелкой
    protected toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    // статистика
    protected openStats() {
        // считаем посты, будущие комментарии (в HTML)
        this.statsDialogRef.nativeElement.showModal();
    }

    // закрытие диалогового окна статистики
    protected closeStats() {
        this.statsDialogRef.nativeElement.close();
    }

    // проверка кликов вне окна, если находит - закрытие окна
    protected onDialogClick(event: MouseEvent) {
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
    protected openMakePost() {
        this.selectedPost = null;
        this.isMakePostOpen = true;
        this.cdr.detectChanges();
        setTimeout(() => {
            document.getElementById('make-post')?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }

    protected editPost(post: Post) {
        this.selectedPost = post;
        this.isMakePostOpen = true;
        this.cdr.detectChanges();
        setTimeout(() => {
            document.getElementById('make-post')?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }

    // отмена
    protected closeMakePost() {
        this.isMakePostOpen = false;
        this.selectedPost = null;
        this.cdr.detectChanges();
    }

    // новый пост
    protected handleSavePost(savedPost: Post) {
        const postIndex = this.posts.findIndex(p => p.id === savedPost.id);

        if (postIndex !== -1) {
            this.posts[postIndex] = savedPost;
        } else {
            // сохраняем данные в массив
            this.posts.unshift(savedPost);
        }

        // записываем массив в localstorage
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));

        // закрываем форму
        this.closeMakePost();
    }

    // удалить статью 
    protected deletePost(id: string) {
        this.posts = this.posts.filter(p => p.id !== id);
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }
}