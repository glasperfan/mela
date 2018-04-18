import { Observable, BehaviorSubject } from 'rxjs/Rx';

export class Timer {
  public readonly MinutesPerHour = 60;
  
  private _timerEnded$: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public timerEnded$: Observable<void>;

  private started = false;
  private ended = false;
  private pauseTime: number; // timestamp (in seconds)
  private endTime: number; // timestamp (in seconds)
  private startTime: number; // timestamp (in seconds)
  
  constructor(public totalMinutes: number) {
    this.timerEnded$ = this._timerEnded$.skip(1);
  }

  start() {
    this.startTime = this.currentTimeInSeconds; // in seconds
    this.endTime = this.startTime + (this.MinutesPerHour * this.totalMinutes);
    this.started = true;
  }

  end() {
    this.ended = true;
    this._timerEnded$.next(undefined);
  }

  pause() {
    this.pauseTime = this.currentTimeInSeconds;
  }

  resume() {
    const pauseTime = this.pauseTime;
    this.pauseTime = undefined;
    const pauseLength = this.currentTimeInSeconds - pauseTime;
    this.startTime += pauseLength;
    this.endTime += pauseLength;
  }

  get minutesLeftString() {
    this.checkForEnd(); // assumption: this is being called per second
    const ml = Math.floor(this.minutesLeft);
    if (ml === 0 || ml < 0) {
      return '00';
    }
    return ml < 10 ? '0' + ml.toPrecision(1) : ml.toPrecision(2);
  }

  get secondsLeftString() {
    const sl = Math.floor(this.secondsLeft);
    if (sl === 0) {
      return '00';
    }
    return sl < 10 ? '0' + sl.toPrecision(1) : sl.toPrecision(2);
  }

  get minutesPassed() {
    if (this.ended) {
      return this.totalMinutes;
    }
    if (!this.started) {
      return 0;
    }
    const mins = (this.currentTimeInSeconds - this.startTime) / this.MinutesPerHour;
    // console.log('mins', mins);
    return mins;
  }

  get secondsPassed() {
    if (this.ended) {
      return (this.totalMinutes * this.MinutesPerHour) % this.MinutesPerHour;
    }
    if (!this.started) {
      return 0;
    }
    const seconds = (this.currentTimeInSeconds - this.startTime) % this.MinutesPerHour;
    // console.log('seconds', seconds);
    if (seconds < 1) {
      return 0;
    }
    return seconds;
  }

  get minutesLeft() {
    if (this.ended) {
      return 0;
    }
    if (!this.started) {
      return this.totalMinutes;
    }
    const mins = (this.endTime - this.currentTimeInSeconds) / this.MinutesPerHour;
    // console.log('mins', mins);
    return mins;
  }
  get secondsLeft() {
    if (this.ended) {
      return 0;
    }
    if (!this.started) {
      return (this.totalMinutes * this.MinutesPerHour) % this.MinutesPerHour;
    }
    const seconds = (this.endTime - this.currentTimeInSeconds) % this.MinutesPerHour;
    // console.log('seconds', seconds);
    if (seconds < 1) {
      return 0;
    }
    return seconds;
  }

  get currentTimeInSeconds() { return this.pauseTime || new Date().getTime() / 1000; }

  private checkForEnd(): void {
    if (this.started && !this.ended && this.minutesLeft < 1 && this.secondsLeft < 1) {
      this.end();
    }
  }
}
