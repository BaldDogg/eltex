import { Component, Output, EventEmitter, input, computed, effect, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { Post } from '../../../models/post';
import { ARTICLES_SERVICE_TOKEN } from '../../../services/articles/articles-service.token';
import { CategoryEntity } from '../../../services/articles/article-backend.interfaces';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-make-post',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        AsyncPipe
    ],
    templateUrl: './make-post.html',
    styleUrl: './make-post.scss'
})
export class MakePost implements OnInit {
    private dataService = inject(ARTICLES_SERVICE_TOKEN);
    private dialog = inject(MatDialog);

    public categories: CategoryEntity[] = [];
    public filteredCategories!: Observable<CategoryEntity[]>;

    // редактировать, удалить пост
    postToEdit = input<Post | null>(null);

    @Output() postCreated = new EventEmitter<Post>();
    @Output() cancelForm = new EventEmitter<void>();

    protected formTitle = computed(() => {
        return this.postToEdit() ? 'Изменить статью' : 'Добавить статью';
    });

    protected saveButtonTitle = computed(() => {
        return this.postToEdit() ? 'Сохранить' : 'Добавить';
    });

    // добавить статью константы
    protected postForm = new FormGroup({
        title: new FormControl('', [Validators.required, Validators.minLength(25)]),
        text: new FormControl('', [Validators.required]),
        theme: new FormControl(''),
        image: new FormControl<string | File>('assets/kotik-template.jpg')
    });

    protected selectedFileName = 'Загрузить картинку';
    protected isSaving = false;

    constructor() {
        effect(() => {
            const post = this.postToEdit();
            if (post) {
                this.postForm.patchValue({
                    title: post.title,
                    text: post.text,
                    theme: post.theme,
                    image: post.image
                });
            } else {
                this.postForm.reset({ theme: '', image: 'assets/kotik-template.jpg' });
            }
        });
    }

    ngOnInit(): void {
        this.dataService.getCategories().subscribe(cats => {
            this.categories = cats;
        });

        this.filteredCategories = this.postForm.get('theme')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || ''))
        );
    }

    private _filter(value: string): CategoryEntity[] {
        const filterValue = value.toLowerCase();
        return this.categories.filter(cat => cat.name.toLowerCase().includes(filterValue));
    }

    // отображение имени загруженного изображения
    protected onImageSelected(event: any) {
        // проверка изображения
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName = `Выбран файл: ${file.name}`;
            this.postForm.get('image')?.setValue(file);
        } else {
            this.selectedFileName = 'Загрузить картинку';
            this.postForm.get('image')?.setValue('assets/kotik-template.jpg');
        }
    }

    // отправка формы (создание поста)
    protected onSubmitPost() {
        if (this.postForm.invalid) {
            return;
        }

        // элементы для блокировки
        // блокировка + изменение текста кнопки
        this.isSaving = true;

        // функция для сохранения поста
        // задержка в 1 секунду
        setTimeout(() => {
            const formValues = this.postForm.getRawValue();
            const currentPost = this.postToEdit();

            const newPost: Post = {
                // создаем id, чтобы потом удалять по нему посты
                id: currentPost ? currentPost.id : crypto.randomUUID(),
                title: formValues.title || '',
                text: formValues.text || '',
                theme: formValues.theme || '',
                image: formValues.image as any,
                date: currentPost ? currentPost.date : new Date().toLocaleDateString('ru-RU')
            };

            this.postCreated.emit(newPost);

            // очищаем форму, потом убираем
            this.postForm.reset({ theme: '', image: 'assets/kotik-template.jpg' });
            this.selectedFileName = 'Загрузить картинку';

            // разблокировка
            this.isSaving = false;
        }, 1000);
    }

    // отмена
    protected closeMakePost() {
        if (this.postForm.dirty) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '400px',
                data: {
                    title: 'Отменить изменения?',
                    message: 'Вы внесли изменения в статью. Уверены, что хотите выйти без сохранения?',
                    confirmText: 'Да, выйти'
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result === true) {
                    this.cancelForm.emit();
                }
            });
        } else {
            this.cancelForm.emit();
        }
    }
}