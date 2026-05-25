import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AUTH_SERVICE_TOKEN } from '../../../services/auth/auth.token';

// валидатор для проверки совпадения паролей
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // проверка начинается только если оба поля не пустые, чтобы при обычном входе не было ошибок
    if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
    }
    return null;
};

@Component({
    selector: 'app-auth-dialog',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule
    ],
    templateUrl: './auth-dialog.html',
    styleUrl: './auth-dialog.scss'
})
export class AuthDialogComponent {
    private authService = inject(AUTH_SERVICE_TOKEN);
    private dialogRef = inject(MatDialogRef<AuthDialogComponent>);
    private fb = inject(FormBuilder);

    public isLoginMode = signal(true);
    public errorMessage = signal('');

    // просмотр пароля
    public hidePassword = signal(true);
    public hideConfirmPassword = signal(true);

    // валидатор
    public authForm = this.fb.group({
        username: ['', Validators.required],
        email: [''],
        password: ['', Validators.required],
        confirmPassword: [''],
        isAdmin: [false]
    }, { validators: passwordMatchValidator });

    toggleMode() {
        this.isLoginMode.set(!this.isLoginMode());
        this.errorMessage.set('');

        // добавление/удаление валидации в зависимости от режима
        const emailCtrl = this.authForm.get('email');
        const confirmCtrl = this.authForm.get('confirmPassword');

        if (this.isLoginMode()) {
            emailCtrl?.clearValidators();
            confirmCtrl?.clearValidators();
        } else {
            emailCtrl?.setValidators([Validators.required, Validators.email]);
            confirmCtrl?.setValidators([Validators.required]);
        }
        emailCtrl?.updateValueAndValidity();
        confirmCtrl?.updateValueAndValidity();
        this.authForm.updateValueAndValidity();
    }

    // переключение просмотра пароля
    togglePasswordVisibility(event: MouseEvent) {
        this.hidePassword.set(!this.hidePassword());
        event.preventDefault();
    }

    toggleConfirmPasswordVisibility(event: MouseEvent) {
        this.hideConfirmPassword.set(!this.hideConfirmPassword());
        event.preventDefault();
    }

    submit() {
        if (this.authForm.invalid) return;

        const { username, email, password, isAdmin } = this.authForm.value;
        const request$ = this.isLoginMode()
            ? this.authService.login(username!, password!)
            : this.authService.register(username!, email!, password!, isAdmin!);

        request$.subscribe({
            next: () => this.dialogRef.close(),
            error: (err) => this.errorMessage.set('Ошибка авторизации. Проверьте данные.')
        });
    }
}