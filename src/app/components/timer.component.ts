import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Timer } from './timer';
import { PlaylistService, RewardsService } from '../services';
import { ISession, IRewardsCounter, MELA_SESSION_LENGTH, MelaKeys } from '../models';
declare var d3: any;
declare var Mousetrap: any;

@Component({
  selector: 'timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.less']
})
export class TimerComponent implements OnInit, OnDestroy {

  public currentTimer: Timer;
  public newSessionName = '';
  public showAddSession = false;
  public sessionIsFinished = false;
  public sessionIsRunning = false;
  public sessionIsPaused = false;
  public sessionIsReady = false;
  public melaCounts: IRewardsCounter;
  public melaKeys = MelaKeys;
  public queuedSessions: ISession[];
  public currentSession$: Observable<ISession>;
  private readonly sessionTimerElementId = 'session-timer';
  private readonly _subscriptions: Subscription[] = [];
  private _timerSubscription: Subscription;
  private _editIdx: number;
  private _editName: string;

  constructor(public playlistSvc: PlaylistService, public rewardsSvc: RewardsService, private zone: NgZone) {
    this.currentSession$ = this.playlistSvc.currentSession$;
    this.melaCounts = this.rewardsSvc.UserRewards;
  }

  ngOnInit() {
    if (this.playlistSvc.TotalQueuedSessions > 0) {
      this.createTimer();
      this.sessionIsReady = true;
    }
    this.createChart(this.sessionTimerElementId, MELA_SESSION_LENGTH);
    this._subscriptions.push(
      this.playlistSvc.currentPlaylist$
        .map(plylst => plylst.sessions)
        .subscribe(sessions => this.queuedSessions = this.setDragEvents(sessions)),
      // If the first session is added, initialize the timer.
      this.playlistSvc.newSessionCreated$.subscribe(_ => {
        if (this.playlistSvc.TotalQueuedSessions === 1) {
          this.createTimer();
          this.sessionIsReady = true;
        }
      })
    );
    this.activateHotkeyBindings();
  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  activateHotkeyBindings(): void {
    const self = this;
    // Q - Add a new session
    Mousetrap.bind('q', function() { self.onAddSessionRequested(); });
    // S - Start current session
    Mousetrap.bind('s', function() { self.onTimerStart(); });
    // [Space] - pause/resume
    Mousetrap.bind('space', function(e: KeyboardEvent) {
      if (!self.sessionIsRunning && !self.sessionIsPaused) {
        return;
      }
      e.preventDefault(); // space by default scrolls the page
      self.sessionIsPaused ? self.onTimerResume() : self.onTimerPause();
    });
    // S - start current session
    Mousetrap.bind('s', function() {
      if (self.sessionIsReady) {
        self.onTimerStart();
      }
    });
  }

  setDragEvents(sessions: ISession[]): ISession[] {
    return sessions;
  }

  onAddSessionRequested(): void {
    this.zone.run(() => { // Mousetrap hotkey activation runs outside the Angular zone
      if (this.showAddSession) {
        this.onSubmitSessionInput(true);
      }
      this.showAddSession = true;
      setTimeout(() => {
        (<HTMLElement>document.getElementsByClassName('add-session-input')[0]).focus();
      }, 50);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  onAddFirstSessionPrompt(): void {
    if (!this.showAddSession) {
      this.onAddSessionRequested();
    }
  }

  onSubmitSessionInput(stillShowInput: boolean = false): void {
    this.playlistSvc.addSession(this.newSessionName.trim());
    this.showAddSession = stillShowInput;
    this.newSessionName = '';
  }

  onCancelSessionInput(): void {
    this.showAddSession = false;
    this.newSessionName = '';
  }

  onMoveSession(session: ISession, idx: number): void {
    this.playlistSvc.moveSession(this.playlistSvc.currentPlaylist.sessions.indexOf(session), idx);
  }

  onDeleteSession(sessionIdx: number): void {
    if (sessionIdx === 0) {
      this.createTimer();
      this.sessionIsReady = this.playlistSvc.TotalQueuedSessions > 1;
      if (!this.sessionIsReady) {
        this.deleteTimer();
      }
    }
    this.sessionIsRunning = false;
    this.sessionIsFinished = false;
    this.playlistSvc.deleteSession(sessionIdx);
  }

  onEditSessionRequested(sessionIdx: number): void {
    if (this._editIdx) {
      this.onCancelEdit();
    }
    this._editIdx = sessionIdx;
    this._editName = this.playlistSvc.currentPlaylist.sessions[sessionIdx].name;
    setTimeout(() => {
      (<HTMLElement>document.getElementsByClassName('edit-session-input')[0]).focus();
    }, 50);
  }

  sessionInEditMode(sessionIdx: number): boolean {
    return this._editIdx === sessionIdx;
  }

  onSubmitEdit(sessionIdx: number): void {
    this.playlistSvc.updateSession(this._editIdx, this._editName);
    this.onCancelEdit();
  }

  onCancelEdit(): void {
    this._editIdx = undefined;
    this._editName = undefined;
  }

  onRedoSession(): void {
    // update streak
    this.rewardsSvc.recordRewards(this.playlistSvc.currentSession.mela);
    // redo current session (clone and replace)
    this.playlistSvc.completeAndRedoCurrentSession();
    // reset timer
    this._timerSubscription.unsubscribe();
    this._timerSubscription = undefined;
    this.createTimer();
    // start
    this.onTimerStart();
  }

  onTimerEnd(): void {
    this.sessionIsFinished = true;
  }

  onTimerComplete(): void {
    // update streak
    this.rewardsSvc.recordRewards(this.playlistSvc.currentSession.mela);
    // delete current session and select the next one
    this.playlistSvc.deleteCurrentSession();
    // reset timer
    this._timerSubscription.unsubscribe();
    this._timerSubscription = undefined;
    this.createTimer();
    // remove complete button
    this.sessionIsFinished = false;
    this.sessionIsRunning = false;
    this.sessionIsReady = !!this.playlistSvc.currentSession;
  }

  onTimerStart(): void {
    this.zone.run(() => { // Mousetrap hotkey activation runs outside the Angular zone
      this.currentTimer.start();
      this._timerSubscription = this.currentTimer.timerEnded$.subscribe(() => setTimeout(() => this.onTimerEnd(), 0));
      this.sessionIsReady = false;
      this.sessionIsRunning = true;
      this.sessionIsFinished = false;
    });
  }

  onTimerPause(): void {
    this.zone.run(() => { // Mousetrap hotkey activation runs outside the Angular zone
      this.sessionIsRunning = false;
      this.sessionIsPaused = true;
      this.currentTimer.pause();
    });
  }

  onTimerResume(): void {
    this.zone.run(() => { // Mousetrap hotkey activation runs outside the Angular zone
      this.sessionIsRunning = true;
      this.sessionIsPaused = false;
      this.currentTimer.resume();
    });
  }

  createTimer(time: number = MELA_SESSION_LENGTH): void {
    this.currentTimer = new Timer(time);
  }

  deleteTimer(): void {
    this.currentTimer = undefined;
  }

  get shouldShowRedo(): boolean {
    return this.sessionIsFinished;
  }

  get shouldShowComplete(): boolean {
    return this.sessionIsFinished || this.sessionIsRunning;
  }


  /* --- CHART --- */

  createChart(element: string, time: number) {
    const width = 60, height = 60;

    const fields = [
      { value: time, size: time, label: 'm', update: _ => this.currentTimer && this.currentTimer.minutesPassed || time },
    ];

    const arc = d3.svg.arc()
    .innerRadius(width / 8)
    .outerRadius(width / 2.1)
    .startAngle(0)
    .endAngle(function(d) { return (d.value / d.size) * 2 * Math.PI; });

    const svg = d3.select('#' + element).append('svg')
    .style({'fill': '#f05545', 'stroke': '#f05545'})
    .attr('width', width)
    .attr('height', height);

    const field = svg.selectAll('.field')
      .data(fields)
      .enter().append('g')
      .attr('transform', function(d, i) { return 'translate(' + (i + 1) / 2 * width + ',' + height / 2 + ')'; })
      .attr('class', 'field');

    field.append('path')
      .attr('class', 'path path--background')
      .attr('d', arc);

    const path = field.append('path')
      .attr('class', 'path path--foreground');

    // Update
    (function update() {
      const now = new Date();

      field.each(d => {
          d.previous = d.value;
          d.value = d.update(now);
        });

      path.transition()
          .ease('elastic')
          .duration(750)
          .attrTween('d', arcTween);

      setTimeout(update, 1000 - (now.getTime() % 1000));
    })();

    function arcTween(b) {
      const i = d3.interpolate({value: b.previous}, b);
      return function(t) {
        return arc(i(t));
      };
    }
  }

  get formatTimeLeft(): string {
    if (this.currentTimer) {
      const ml = Math.floor(this.currentTimer.minutesLeft);
      if (ml) {
        return `${ml} minutes left`;
      }
      const sl = Math.floor(this.currentTimer.secondsLeft);
      if (sl) {
        return `${sl} seconds left`;
      }
      return 'finished';
    }
    return undefined;
  }
}
