import { Component, OnInit, ViewChild, ElementRef, signal, inject, computed } from '@angular/core';
import { BlogPost } from '../../components/blog-post/blog-post';
import { MakePost } from '../../components/make-post/make-post';
import { Post } from '../../../models/post';
import { ARTICLES_SERVICE_TOKEN } from '../../../services/articles/articles-service.token';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [BlogPost, MakePost],
    templateUrl: './blog.html',
    styleUrl: './blog.scss',
})
export class Blog implements OnInit {
    // подключаем сервисы
    private dataService = inject(ARTICLES_SERVICE_TOKEN);
    public store = inject(ArticlesStoreService);

    protected isLoading = signal(true);
    protected isMakePostOpen = signal(false);
    protected isMobileMenuOpen = false;
    protected selectedPost = signal<Post | null>(null);

    // настройки пагинации
    protected limit = 7;
    protected totalPages = computed(() => Math.ceil(this.store.totalCount() / this.limit));

    @ViewChild('statsDialog') protected statsDialogRef!: ElementRef<HTMLDialogElement>;

    constructor() { }

    ngOnInit(): void {
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
        this.dataService.getPosts(page, this.limit).subscribe(res => {
            this.store.setPostsData(res.posts, res.totalCount);
            this.store.setCurrentPage(page);
            this.isLoading.set(false);
        });
    }

    protected toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    protected openStats() {
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

        request$.subscribe(res => {
            this.store.setPostsData(res.posts, res.totalCount);
            this.closeMakePost();
            this.isLoading.set(false);
        });
    }

    protected deletePost(id: string) {
        this.isLoading.set(true);
        const currentPage = this.store.currentPage();

        // удаляем через сервис
        this.dataService.deletePost(id, currentPage, this.limit).subscribe(res => {
            this.store.setPostsData(res.posts, res.totalCount);
            if (this.selectedPost()?.id === id) {
                this.closeMakePost();
            }
            this.isLoading.set(false);
        });
    }
}