import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-header',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    scrollToContacts() {
        document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
    }
}
