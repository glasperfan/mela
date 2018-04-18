import * as Cookies from 'js-cookie';
import { MelaType, RewardsCounter } from '../models';

export type RewardsCounter = { [key: string]: number };

export class RewardsService {
    
    private _userRewards: RewardsCounter;
    private readonly RewardsCookieKey = "mela-counts";

    constructor() {
        this._userRewards = this.retrieveAwards(); // populate on init
    }

    get UserRewards(): RewardsCounter {
        return this._userRewards;
    }
    
    recordRewards(type: MelaType) {
        this._userRewards[type] += 1;
        this.cacheAwards();
    }

    resetAwards(): void {
        this._userRewards = this.generateEmptyAwards();
        this.cacheAwards();
    }
    
    private retrieveAwards(): RewardsCounter {
        const cookie = Cookies.get(this.RewardsCookieKey);
        return cookie ? JSON.parse(atob(cookie)) as RewardsCounter : this.generateEmptyAwards();
    }

    private storeRewards(awards: RewardsCounter): void {
        Cookies.set(
            this.RewardsCookieKey,
            btoa(JSON.stringify(awards)),
            { expires:  365 }); // in days, basically never expire
    }

    private cacheAwards(): void {
        this.storeRewards(this._userRewards);
    }

    private generateEmptyAwards(): RewardsCounter {
        const melaCounts = {};
        for (const key of Object.values(MelaType)) {
            melaCounts[key] = 0;
        }
        return melaCounts;
    }
}