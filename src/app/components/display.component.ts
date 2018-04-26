import { Component } from '@angular/core';
import { NavigationService } from '../services';
import { NavPage } from '../models';

@Component({
  selector: 'display',
  template: `
    <div class="host" [ngSwitch]="navService.currentPage$ | async">
        <timer *ngSwitchCase="NavPage.Timer" [@visibility]="navService.currentPage === NavPage.Timer"></timer>
        <about *ngSwitchCase="NavPage.About">about</about>
        <stats *ngSwitchCase="NavPage.Stats">stats</stats>
        <settings *ngSwitchCase="NavPage.Settings">settings</settings>
    </div>
  `,
  animations: []
})
export class DisplayComponent {

    public NavPage = NavPage; // for template access

    constructor(public navService: NavigationService) {}
}
