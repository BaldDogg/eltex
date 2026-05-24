import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-comment-form',
    standalone: true,
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
    templateUrl: './comment-form.html',
    styleUrls: ['./comment-form.scss']
})
export class CommentForm {
    private fb = inject(FormBuilder);

    @Output() commentSubmitted = new EventEmitter<{ author: string, text: string }>();

    public commentForm = this.fb.group({
        author: ['', Validators.required],
        text: ['', Validators.required]
    });

    submitComment() {
        if (this.commentForm.valid) {
            this.commentSubmitted.emit(this.commentForm.value as { author: string, text: string });
            this.commentForm.reset();
            Object.keys(this.commentForm.controls).forEach(key => {
                this.commentForm.get(key)?.setErrors(null);
            });
        }
    }
}