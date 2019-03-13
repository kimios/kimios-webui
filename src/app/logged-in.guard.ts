// logged-in.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private user: UserService) {}

    canActivate(): boolean {
        return false;
        // return this.user.isLoggedIn();
    }
}
