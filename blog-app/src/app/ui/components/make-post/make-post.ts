import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../pages/blog/blog';

@Component({
    selector: 'app-make-post',
    imports: [CommonModule, FormsModule],
    templateUrl: './make-post.html',
    styleUrl: './make-post.scss'
})
export class MakePost {
    @Output() postCreated = new EventEmitter<Post>();
    @Output() cancelForm = new EventEmitter<void>();

    // добавить статью константы
    newPostTitle = '';
    newPostText = '';
    newPostTheme = 'Наука';
    newPostThemeCustom = '';
    newPostImage: string = 'assets/kotik-template.jpg';
    selectedFileName = 'Загрузить картинку';
    isSaving = false;

    constructor(private cdr: ChangeDetectorRef) { }

    // отображение имени загруженного изображения
    onImageSelected(event: any) {
        // проверка изображения
        const file = event.target.files[0];
        if (file) {
            this.selectedFileName = `Выбран файл: ${file.name}`;

            // читаем картинку как текст
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.newPostImage = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // если картинки нет, используем заглушку
            this.selectedFileName = 'Загрузить картинку';
            this.newPostImage = 'assets/kotik-template.jpg';
        }
    }

    // отправка формы (создание поста)
    onSubmitPost() {
        // элементы для блокировки
        // блокировка + изменение текста кнопки
        this.isSaving = true;

        // функция для сохранения поста
        // задержка в 1 секунду
        setTimeout(() => {

            // выбор "другое" в темах 
            let finalTheme = this.newPostTheme;
            if (this.newPostTheme === 'other') {
                finalTheme = this.newPostThemeCustom;
            }

            const newPost: Post = {
                // создаем id, чтобы потом удалять по нему посты
                id: crypto.randomUUID(),
                title: this.newPostTitle,
                text: this.newPostText,
                theme: finalTheme,
                image: this.newPostImage,
                date: new Date().toLocaleDateString('ru-RU')
            };

            this.postCreated.emit(newPost);

            // очищаем форму, потом убираем
            this.newPostTitle = '';
            this.newPostText = '';
            this.newPostTheme = 'Наука';
            this.newPostThemeCustom = '';
            this.selectedFileName = 'Загрузить картинку';
            this.newPostImage = 'assets/kotik-template.jpg';

            // разблокировка
            this.isSaving = false;

            // обновляем экран в этом компоненте
            this.cdr.detectChanges();
        }, 1000);
    }

    // отмена
    closeMakePost() {
        this.cancelForm.emit();
    }
}