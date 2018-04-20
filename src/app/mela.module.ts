import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MELA_ROUTES } from './mela.routes';
import { PlaylistService, RewardsService, CapitalizePipe } from './services';
import { MainComponent, DashboardComponent, TimerComponent } from './components';
import { Title, BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    CommonModule,
    DndModule.forRoot(),
    MELA_ROUTES
  ],
  declarations: [
    MainComponent,
    DashboardComponent,
    TimerComponent,
    CapitalizePipe
  ],
  providers: [
    PlaylistService,
    RewardsService,
    Title
  ],
  bootstrap: [MainComponent]
})
export class MelaModule { }
