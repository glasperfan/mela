import { Injectable } from '@angular/core';
import { NavPage } from '../models';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NavigationService {
    private _currentPage$ = new BehaviorSubject<NavPage>(NavPage.Timer);
    private currentPage$: Observable<NavPage>;

    constructor() {
        this.currentPage$ = this._currentPage$.asObservable();
    }

    get currentPage(): NavPage {
        return this._currentPage$.value;
    }

    navigateTo(page: NavPage) {
        if (page !== this.currentPage) {
            this._currentPage$.next(page);
        }
    }
}
