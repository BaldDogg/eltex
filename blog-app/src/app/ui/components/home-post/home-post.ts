import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../pages/blog/blog';

@Component({
    selector: 'app-home-post',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home-post.html',
    styleUrl: './home-post.scss'
})
export class HomePost {
    @Input() post!: Post;
    @Input() isOdd: boolean = false;
}