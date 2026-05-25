import { Directive, TemplateRef, ViewContainerRef, inject, effect, input } from '@angular/core';
import { AuthStore } from '../../../../services/auth/auth.store';

@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective {
    private authStore = inject(AuthStore);
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);

    appHasRole = input<string>('');

    constructor() {
        effect(() => {
            const user = this.authStore.currentUser();
            const requiredRole = this.appHasRole();

            this.viewContainer.clear();

            if (!user || !requiredRole) {
                return;
            }

            const isUserAdmin =
                user.isAdmin === true ||
                String(user.isAdmin) === 'true' ||
                user.role === 'admin';

            const hasExactRole = user.role && user.role === requiredRole;

            if ((requiredRole === 'admin' && isUserAdmin) || hasExactRole) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }
}