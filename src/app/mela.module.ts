import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MELA_ROUTES } from './mela.routes';
import { PlaylistService, NavigationService, RewardsService, CapitalizePipe } from './services';
import {
  MainComponent,
  DisplayComponent,
  DashboardComponent,
  TimerComponent,
  StatsComponent,
  SettingsComponent,
  AboutComponent } from './components';
import { Title, BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    CommonModule,
    DndModule.forRoot(),
    MELA_ROUTES
  ],
  declarations: [
    MainComponent,
    DashboardComponent,
    DisplayComponent,
    TimerComponent,
    StatsComponent,
    SettingsComponent,
    AboutComponent,
    CapitalizePipe
  ],
  providers: [
    PlaylistService,
    RewardsService,
    NavigationService,
    Title
  ],
  bootstrap: [MainComponent]
})
export class MelaModule { }
