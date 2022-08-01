import { EventTarget, _decorator } from 'cc';
import { PlayerPreference } from './PlayerPreference';
const { ccclass, property } = _decorator;

@ccclass('Config')
export class Config extends EventTarget {

    private _bgmVolume: number = 1.0;

    private _sfxVolume: number = 1.0;

    constructor() {
        super()
        this._bgmVolume = PlayerPreference.getFloat("bgmVolume");
        this._sfxVolume = PlayerPreference.getFloat("sfxVolume");
    }

    set bgmVolume(value: number) {        
        this._bgmVolume = value;
        PlayerPreference.setFloat("bgmVolume", value);
        this.emit("bgmVolumeChanged")
    }

    set sfxVolume(sfx: number) {
        this._sfxVolume = sfx;
        PlayerPreference.setFloat("sfxVolume", sfx);
    }

    get bgmVolume(): number {
        return this._bgmVolume;
    }

    get sfxVolume(): number {
        return this._sfxVolume;
    }
}

export let config = new Config()

