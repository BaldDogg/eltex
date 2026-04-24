import { Component, Input } from '@angular/core';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-home-post',
    standalone: true,
    imports: [],
    templateUrl: './home-post.html',
    styleUrl: './home-post.scss'
})
export class HomePost {
    @Input() public post!: Post;

}