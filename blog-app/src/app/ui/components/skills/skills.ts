import { Component } from '@angular/core';

@Component({
    selector: 'app-skills',
    imports: [],
    templateUrl: './skills.html',
    styleUrl: './skills.scss',
})
export class Skills {
    protected skillsList = ['Python', 'Bash', 'HTML5', 'C/C++', 'SQL'];
}
