import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IPlaylist, ISession, Session } from '../models';
import * as Cookies from 'js-cookie';
import * as _ from 'lodash';

@Injectable()
export class PlaylistService {

  public currentSession$: Observable<ISession>;
  public newSessionCreated$: Observable<ISession>;
  public currentPlaylist$: Observable<IPlaylist>;
  public toggleDashboard = true;

  private _newSessionCreated$: BehaviorSubject<ISession>;
  private _currentPlaylist$: BehaviorSubject<IPlaylist>;
  private readonly PlaylistCookieKey = 'mela-playlist';

  constructor() {
    this._newSessionCreated$ = new BehaviorSubject<ISession>(undefined);
    this._currentPlaylist$ = new BehaviorSubject<IPlaylist>(this.retrievePlaylist());
    this.newSessionCreated$ = this._newSessionCreated$.skip(1);
    this.currentPlaylist$ = this._currentPlaylist$.asObservable();
    this.currentSession$ = this.currentPlaylist$.map(p => p.sessions && p.sessions.length ? p.sessions[0] : undefined);
  }

  get emptyPlaylist(): IPlaylist {
    return { sessions: [] };
  }

  get currentPlaylist(): IPlaylist {
    return this._currentPlaylist$.value;
  }

  get currentSession(): ISession {
    const pl = this._currentPlaylist$.value;
    return pl && pl.sessions && pl.sessions.length && pl.sessions[0];
  }

  addSession(sessionName: string): void {
    const currentPlaylist = this._currentPlaylist$.value;
    const newSession = new Session(sessionName || 'Untitled');
    currentPlaylist.sessions.push(newSession);
    this._newSessionCreated$.next(newSession);
    this._currentPlaylist$.next(currentPlaylist);
    this.cachePlaylist();
  }

  deleteCurrentSession(): void {
    this.deleteSession(0);
  }

  deleteSession(sessionIdx: number): void {
    const currentPlaylist = this._currentPlaylist$.value;
    currentPlaylist.sessions.splice(sessionIdx, 1);
    this._currentPlaylist$.next(currentPlaylist);
    this.cachePlaylist();
  }

  updateSession(sessionIdx: number, newName: string): void {
    const currentPlaylist = this._currentPlaylist$.value;
    const editedPlaylist = _.cloneDeep(currentPlaylist);
    editedPlaylist.sessions[sessionIdx].name = newName;
    this._currentPlaylist$.next(editedPlaylist);
    this.cachePlaylist();
  }

  get TotalQueuedSessions(): number {
    return this._currentPlaylist$.value.sessions.length;
  }

  private retrievePlaylist(): IPlaylist {
      const cookie = Cookies.get(this.PlaylistCookieKey);
      return cookie ? JSON.parse(atob(cookie)) as IPlaylist : this.emptyPlaylist;
  }

  private storePlaylist(playlist: IPlaylist): void {
      Cookies.set(
          this.PlaylistCookieKey,
          btoa(JSON.stringify(playlist)),
          { expires:  365 }); // in days, basically never expire
  }

  private cachePlaylist(): void {
    this.storePlaylist(this._currentPlaylist$.value);
  }

}
