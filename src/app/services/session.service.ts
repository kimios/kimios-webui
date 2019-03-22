import {Injectable, OnDestroy} from '@angular/core';
import {SecurityService} from '../kimios-client-api';

@Injectable({
    providedIn: 'root'
})
export class SessionService implements OnDestroy {
    private _sessionToken: string = null;
    private _sessionAlive: boolean;
    private intervalId: number;

    constructor(private securityService: SecurityService) {
        this.intervalId = window.setInterval(
            () => this.setSessionAlive(),
            5000
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    get sessionToken(): string {
        return this._sessionToken;
    }

    set sessionToken(value: string) {
        this._sessionToken = value;
    }

    setSessionAlive(): void {
        this.securityService.isSessionAlive(this.sessionToken)
            .subscribe(
                res => this._sessionAlive = res,
                error => this._sessionAlive = error.error.text
            );
    }

    get sessionAlive(): boolean {
        return this._sessionAlive;
    }

    set sessionAlive(alive: boolean) {
        this._sessionAlive = alive;
    }
}
