import { Component } from '@angular/core';

@Component({
    selector: 'app-instruments',
    imports: [],
    templateUrl: './instruments.html',
    styleUrl: './instruments.scss',
})
export class Instruments {
    protected instrumentsList = [
        { name: 'Git', logo: 'assets/Git-logo.png' },
        { name: 'Visual Studio Code', logo: 'assets/vscode.png' },
        { name: 'PostgreSQL', logo: 'assets/psql.png' }
    ];
}
