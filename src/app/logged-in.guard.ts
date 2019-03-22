// logged-in.guard.ts
import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {SessionService} from 'app/services/session.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    private intervalId: number;

    constructor(private sessionService: SessionService, public router: Router) {
        this.intervalId = window.setInterval(
            () => {
                if (! this.sessionService.sessionAlive
                    && this.router.url !== '/login') {
                    this.router.navigate(['login']);
                }
            },
            5000
        );
    }

    canActivate(): boolean {
        if (this.sessionService.sessionAlive) {
            return true;
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
}
