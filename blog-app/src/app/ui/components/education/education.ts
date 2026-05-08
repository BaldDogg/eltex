import { Component } from '@angular/core';

@Component({
    selector: 'app-education',
    imports: [],
    templateUrl: './education.html',
    styleUrl: './education.scss',
})
export class Education {
    protected courses = [
        'Основы графического дизайна — НГТУ (2024)',
        '"Поколение Python": курс для начинающих (2022)'
    ];
}
