import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PostComment } from '../../../services/articles/types/post-comment.interface'; // проверь путь, если нужно

@Component({
    selector: 'app-comment-item',
    standalone: true,
    imports: [MatCardModule, MatIconModule, MatButtonModule, DatePipe],
    templateUrl: './comment-item.html',
    styleUrls: ['./comment-item.scss']
})
export class CommentItem {
    @Input({ required: true }) comment!: PostComment;
    @Input() userReaction: number = 0;

    @Output() rate = new EventEmitter<number>();

    changeRating(attemptedReaction: number) {
        this.rate.emit(attemptedReaction);
    }
}