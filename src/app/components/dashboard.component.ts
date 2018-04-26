import { Component } from '@angular/core';
import { NavPage } from '../models';
import { NavigationService } from '../services';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {

  public NavPage = NavPage;

  constructor(public navService: NavigationService) { }

  navigateTo(page: NavPage) {
    this.navService.navigateTo(page);
  }
}
