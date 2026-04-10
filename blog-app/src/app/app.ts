import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './ui/components/footer/footer';
import { Header } from './ui/components/header/header';
import { Home } from "./ui/pages/home/home";
import { Blog } from './ui/pages/blog/blog';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, Header, Footer, Home, Blog],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('blog-app');
}
