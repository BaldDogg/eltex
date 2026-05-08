import { Component, Output, EventEmitter, input, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-make-post',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './make-post.html',
    styleUrl: './make-post.scss'
})
export class MakePost {
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
        theme: new FormControl('Наука'),
        themeCustom: new FormControl(''),
        image: new FormControl('assets/kotik-template.jpg')
    });

    protected selectedFileName = 'Загрузить картинку';
    protected isSaving = false;

    constructor() {
        effect(() => {
            const post = this.postToEdit();
            if (post) {
                const defaultThemes = ['Наука', 'Мистика', 'Тайны современности'];
                const isCustomTheme = !defaultThemes.includes(post.theme);

                this.postForm.patchValue({
                    title: post.title,
                    text: post.text,
                    theme: isCustomTheme ? 'other' : post.theme,
                    themeCustom: isCustomTheme ? post.theme : '',
                    image: post.image
                });
            } else {
                this.postForm.reset({ theme: 'Наука', image: 'assets/kotik-template.jpg' });
            }
        });
    }

    // отображение имени загруженного изображения
    protected onImageSelected(event: any) {
        // проверка изображения
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName = `Выбран файл: ${file.name}`;

            // читаем картинку как текст
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.postForm.get('image')?.setValue(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            // если картинки нет, используем заглушку
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

            // выбор "другое" в темах 
            let finalTheme = formValues.theme;
            if (formValues.theme === 'other') {
                finalTheme = formValues.themeCustom;
            }

            const currentPost = this.postToEdit();

            const newPost: Post = {
                // создаем id, чтобы потом удалять по нему посты
                id: currentPost ? currentPost.id : crypto.randomUUID(),
                title: formValues.title || '',
                text: formValues.text || '',
                theme: finalTheme || 'Наука',
                image: formValues.image || 'assets/kotik-template.jpg',
                date: currentPost ? currentPost.date : new Date().toLocaleDateString('ru-RU')
            };

            this.postCreated.emit(newPost);

            // очищаем форму, потом убираем
            this.postForm.reset({ theme: 'Наука', image: 'assets/kotik-template.jpg' });
            this.selectedFileName = 'Загрузить картинку';

            // разблокировка
            this.isSaving = false;

            // обновляем экран в этом компоненте
        }, 1000);
    }

    // отмена
    protected closeMakePost() {
        this.cancelForm.emit();
    }
}