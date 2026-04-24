import { Component, Output, EventEmitter, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-make-post',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './make-post.html',
    styleUrl: './make-post.scss'
})
export class MakePost implements OnChanges {
    // редактировать, удалить пост
    @Input() postToEdit: Post | null = null;
    @Output() postCreated = new EventEmitter<Post>();

    @Output() cancelForm = new EventEmitter<void>();

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

    constructor(private cdr: ChangeDetectorRef) { }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['postToEdit']) {
            if (this.postToEdit) {
                const defaultThemes = ['Наука', 'Мистика', 'Тайны современности'];
                const isCustomTheme = !defaultThemes.includes(this.postToEdit.theme);

                this.postForm.patchValue({
                    title: this.postToEdit.title,
                    text: this.postToEdit.text,
                    theme: isCustomTheme ? 'other' : this.postToEdit.theme,
                    themeCustom: isCustomTheme ? this.postToEdit.theme : '',
                    image: this.postToEdit.image
                });
            } else {
                this.postForm.reset({ theme: 'Наука', image: 'assets/kotik-template.jpg' });
            }
        }
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

            const newPost: Post = {
                // создаем id, чтобы потом удалять по нему посты
                id: this.postToEdit ? this.postToEdit.id : crypto.randomUUID(),
                title: formValues.title || '',
                text: formValues.text || '',
                theme: finalTheme || 'Наука',
                image: formValues.image || 'assets/kotik-template.jpg',
                date: this.postToEdit ? this.postToEdit.date : new Date().toLocaleDateString('ru-RU')
            };

            this.postCreated.emit(newPost);

            // очищаем форму, потом убираем
            this.postForm.reset({ theme: 'Наука', image: 'assets/kotik-template.jpg' });
            this.selectedFileName = 'Загрузить картинку';

            // разблокировка
            this.isSaving = false;

            // обновляем экран в этом компоненте
            this.cdr.detectChanges();
        }, 1000);
    }

    // отмена
    protected closeMakePost() {
        this.cancelForm.emit();
    }
}