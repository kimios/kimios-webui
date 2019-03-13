// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class UserService {
    private loggedIn = false;

    constructor(private http: HttpClient) {
        this.loggedIn = !!localStorage.getItem('auth_token');
    }

    login(email: string, password: string): Observable<any> {
        return this.http
            .post(
                '/login',
                { email, password }
            )
 /*           .map((res: any) => {
                if (res.success) {
                    localStorage.setItem('auth_token', res.auth_token);
                    this.loggedIn = true;
                }

                return res.success;
            })*/
            ;
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        this.loggedIn = false;
    }

    isLoggedIn(): boolean {
        return this.loggedIn;
    }
}