import { Injectable } from '@angular/core';
import {SecurityService} from '../kimios-client-api';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private _sessionToken: string = null;

    constructor(private securityService: SecurityService) { }

    get sessionToken(): string {
        return this._sessionToken;
    }

    set sessionToken(value: string) {
        this._sessionToken = value;
    }

    isActive(): boolean {
        return this.sessionToken != null;
    }
}
