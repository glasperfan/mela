import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PlaylistService } from '../services';

@Component({
  selector: 'mela',
  templateUrl: 'main.component.html',
  styleUrls: ['main.component.less']
})
export class MainComponent {
  constructor(public playlistSvc: PlaylistService, public titleSvc: Title) {
    // Update title
    this.titleSvc.setTitle('Mela');

    // Set html background color
    const htmlElement = document.getElementsByTagName('html')[0];
    htmlElement.style['background-color'] = '#7f0000';
  }
}
