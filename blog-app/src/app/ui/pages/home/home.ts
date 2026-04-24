import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomePost } from '../../components/home-post/home-post';
import { Post } from '../../../models/post';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink, HomePost],
    templateUrl: './home.html',
    styleUrl: './home.scss'
})
export class Home implements OnInit {
    protected recentPosts: Post[] = [];

    public ngOnInit() {
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const savedPosts = localStorage.getItem('blogPosts');
            if (savedPosts) {
                const allPosts: Post[] = JSON.parse(savedPosts);
                this.recentPosts = allPosts.slice(0, 3);
            }
        }

        if (this.recentPosts.length === 0) {
            this.recentPosts = [
                { id: '1', title: 'Картинки странных котов как смысл жизни', theme: 'Психология', text: 'Привет, я замещаю пост, которого еще нет. Вы можете исправить это!', date: '5 марта 2026', image: 'assets/kotik1.jpg' },
                { id: '2', title: 'Почему они все время валяются и спят?!', theme: 'Тайны современности', text: 'Привет, я тоже замещаю пост, которого еще нет. Вы можете исправить это!', date: '5 марта 2026', image: 'assets/kotik3.jpg' },
                { id: '3', title: 'Сенсация: черная котоулитка', theme: 'Наука', text: 'Привет, и я замещаю пост, которого еще нет. Вы можете исправить это!', date: '5 марта 2026', image: 'assets/kotik4.jpg' }
            ];
        }
    }
}