import { Component, OnInit, ViewChild, ElementRef, signal, inject, computed, DestroyRef } from '@angular/core';
import { BlogPost } from '../../components/blog-post/blog-post';
import { MakePost } from '../../components/make-post/make-post';
import { Post } from '../../../models/post';
import { ARTICLES_SERVICE_TOKEN } from '../../../services/articles/articles-service.token';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [BlogPost, MakePost, MatIconModule],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class Blog implements OnInit {
    // подключаем сервисы
    private dataService = inject(ARTICLES_SERVICE_TOKEN);
    private store = inject(ArticlesStoreService);
    private titleService = inject(Title);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    // для отписок
    private destroyRef = inject(DestroyRef);

    protected posts = this.store.posts;
    protected currentPage = this.store.currentPage;
    protected totalCount = this.store.totalCount;

    protected isLoading = signal(true);
    protected isMakePostOpen = signal(false);
    protected isMobileMenuOpen = false;
    protected selectedPost = signal<Post | null>(null);

    // переменные для статистики
    protected totalComments = 0;

    // настройки пагинации
    protected limit = 7;
    protected totalPages = computed(() => Math.ceil(this.store.totalCount() / this.limit));

    @ViewChild('statsDialog') protected statsDialogRef!: ElementRef<HTMLDialogElement>;

    constructor() { }

    ngOnInit(): void {
        this.titleService.setTitle('Блог');

        // запрашиваем данные через стор
        if (!this.store.isLoaded()) {
            this.loadPage(1);
        } else {
            this.isLoading.set(false);
        }
    }

    // загрузка конкретной страницы
    protected loadPage(page: number) {
        this.isLoading.set(true);
        this.dataService.getPosts(page, this.limit).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
            this.store.setPostsData(res.posts, res.totalCount);
            this.store.setCurrentPage(page);
            this.isLoading.set(false);
        });
    }

    protected toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    protected openStats() {
        // считаем комменты при открытии
        const comments = JSON.parse(localStorage.getItem('blogComments') || '[]');
        this.totalComments = comments.length;
        this.statsDialogRef.nativeElement.showModal();
    }

    protected closeStats() {
        this.statsDialogRef.nativeElement.close();
    }

    protected onDialogClick(event: MouseEvent) {
        const dialogElement = this.statsDialogRef.nativeElement;
        const rect = dialogElement.getBoundingClientRect();
        const clickIsOutside = (
            event.clientY < rect.top || event.clientY > rect.bottom ||
            event.clientX < rect.left || event.clientX > rect.right
        );
        if (clickIsOutside) {
            this.closeStats();
        }
    }

    private scrollToForm() {
        setTimeout(() => {
            document.getElementById('make-post')?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    }

    protected openMakePost() {
        this.selectedPost.set(null);
        this.isMakePostOpen.set(true);
        this.scrollToForm();
    }

    protected editPost(post: Post) {
        this.selectedPost.set(post);
        this.isMakePostOpen.set(true);
        this.scrollToForm();
    }

    protected closeMakePost() {
        this.isMakePostOpen.set(false);
        this.selectedPost.set(null);
        this.scrollToForm();
    }

    protected handleSavePost(savedPost: Post) {
        this.isLoading.set(true);
        const currentPage = this.store.currentPage();
        const isExisting = this.store.posts().some(p => p.id === savedPost.id);

        // сохраняем через сервис
        const request$ = isExisting
            ? this.dataService.updatePost(savedPost, currentPage, this.limit)
            : this.dataService.addPost(savedPost, currentPage, this.limit);

        request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res) => {
                this.store.setPostsData(res.posts, res.totalCount);
                this.closeMakePost();
                this.isLoading.set(false);

                this.snackBar.open('Статья успешно сохранена!', 'Закрыть', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
            },
            error: (err) => {
                this.isLoading.set(false);

                this.snackBar.open('Ошибка! Возможно, статья с таким названием уже существует.', 'Закрыть', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }

    protected deletePost(id: string) {
        // диалог подтверждения
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            autoFocus: false,
            data: {
                title: 'Удаление статьи',
                message: 'Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.',
                confirmText: 'Удалить'
            }
        });

        // ждем ответ пользователя
        dialogRef.afterClosed().subscribe(result => {
            // нажатие "отмена"/закрытие окна
            if (result === true) {
                this.isLoading.set(true);
                const currentPage = this.store.currentPage();

                // удаление комментариев поста
                const existingComments = JSON.parse(localStorage.getItem('blogComments') || '[]');
                const updatedComments = existingComments.filter((comment: any) => comment.postId !== id);
                localStorage.setItem('blogComments', JSON.stringify(updatedComments));

                // удаление рейтинга поста
                const userReactions = JSON.parse(localStorage.getItem('userReactions') || '{}');
                if (userReactions[id]) {
                    delete userReactions[id];
                    localStorage.setItem('userReactions', JSON.stringify(userReactions));
                }

                // удаление через сервис
                this.dataService.deletePost(id, currentPage, this.limit).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                    next: (res) => {
                        this.store.setPostsData(res.posts, res.totalCount);
                        if (this.selectedPost()?.id === id) {
                            this.closeMakePost();
                        }
                        this.isLoading.set(false);

                        this.snackBar.open('Статья успешно удалена!', 'Закрыть', {
                            duration: 3000,
                            panelClass: ['success-snackbar']
                        });
                    },
                    error: () => {
                        this.isLoading.set(false);
                        this.snackBar.open('Ошибка при удалении статьи.', 'Закрыть', {
                            duration: 5000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            }
        });
    }
}