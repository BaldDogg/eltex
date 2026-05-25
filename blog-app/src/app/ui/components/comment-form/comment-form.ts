import { Component, EventEmitter, Output, inject, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthStore } from '../../../services/auth/auth.store';

@Component({
    selector: 'app-comment-form',
    standalone: true,
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    templateUrl: './comment-form.html',
    styleUrls: ['./comment-form.scss']
})
export class CommentForm {
    private fb = inject(FormBuilder);
    public authStore = inject(AuthStore);

    @Output() commentSubmitted = new EventEmitter<{ author: string, text: string }>();

    public commentForm = this.fb.group({
        author: ['', Validators.required],
        text: ['', Validators.required]
    });

    constructor() {
        // следим за изменением состояния пользователя
        effect(() => {
            const user = this.authStore.currentUser();
            const authorControl = this.commentForm.get('author');

            if (user) {
                // если залогинен, поле автора не обязательно
                authorControl?.clearValidators();
            } else {
                // если гость, поле обязательно
                authorControl?.setValidators([Validators.required]);
            }
            authorControl?.updateValueAndValidity();
        });
    }

    submitComment() {
        const user = this.authStore.currentUser();
        // если форма не валидна
        if (this.commentForm.invalid && !user) return;

        const authorName = user ? user.username : this.commentForm.value.author;

        if (this.commentForm.get('text')?.valid) {
            this.commentSubmitted.emit({
                author: authorName!,
                text: this.commentForm.value.text!
            });

            this.commentForm.reset();
            Object.keys(this.commentForm.controls).forEach(key => {
                this.commentForm.get(key)?.setErrors(null);
            });
        }
    }
}