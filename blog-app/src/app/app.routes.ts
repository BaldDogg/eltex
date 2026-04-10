import { Routes } from '@angular/router';
import { Home } from './ui/pages/home/home';
import { Blog } from './ui/pages/blog/blog';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: 'blog', component: Blog },
    { path: '', redirectTo: '/home', pathMatch: 'full' }
];
