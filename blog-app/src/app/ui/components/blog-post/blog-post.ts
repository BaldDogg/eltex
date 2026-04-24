import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-blog-post',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './blog-post.html',
    styleUrl: './blog-post.scss'
})
export class BlogPost {
    // данные поста
    @Input() post!: Post;

    // событие удаления
    @Output() deletePostEvent = new EventEmitter<string>();

    // событие редактирования поста
    @Output() public editPostEvent = new EventEmitter<Post>();

    protected onDelete() {
        this.deletePostEvent.emit(this.post.id);
    }

    protected onEdit() {
        this.editPostEvent.emit(this.post);
    }
}