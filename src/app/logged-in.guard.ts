// logged-in.guard.ts
import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {SessionService} from 'app/services/session.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private sessionService: SessionService, public router: Router) {}

    canActivate(): boolean {
        if (this.sessionService.isActive()) {
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
}
