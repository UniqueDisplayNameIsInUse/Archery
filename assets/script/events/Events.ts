import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 全局事件定义
 */
@ccclass('Events')
export class Events {

    static onDead: string = "onDead";

    static onKilled: string = "onKilled";

    static onProjectileDead : string = "onProjectileDead";

    static onExpGain: string = "onExpGain";

    static onPlayerUpgrade: string = "onPlayerUpgrade";

    static onPlayerStateChanged : string = "onPlayerStateChanged";

    static onBgmVolumeChanged: string = "onBgmVolumeChanged";

}

