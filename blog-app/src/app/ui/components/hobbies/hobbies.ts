import { Component } from '@angular/core';

@Component({
    selector: 'app-hobbies',
    imports: [],
    templateUrl: './hobbies.html',
    styleUrl: './hobbies.scss',
})
export class Hobbies {
    protected hobbiesList = [
        { img: 'assets/hobby1.webp', title: 'Собираю картинки котов', text: '(кидает подруга)', cssClass: 'vertical-hobby' },
        { img: 'assets/hobby2.png', title: 'Пишу лор для днд, рисую', text: '🤓🤓🤓🤓🤓', cssClass: 'vertical-hobby' },
        { img: 'assets/hobby3.jpg', title: 'Гуляю', text: 'Текст про пользу погулять', cssClass: 'horizontal-hobby' },
        { img: 'assets/hobby4.webp', title: 'Играю в настольные игры', text: 'Остров кошек, конечно, моя любимая', cssClass: 'horizontal-hobby' }
    ];
}
