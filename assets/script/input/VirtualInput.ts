import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VirtualInput')
export class VirtualInput {

    private static _horizontal: number = 0;
    static get horizontal(): number {
        return this._horizontal;
    }

    static set horizontal(val: number) {
        this._horizontal = val;
    }

    private static _vertical: number = 0;
    static get vertical(): number {
        return this._vertical;
    }
    static set vertical(val: number) {
        this._vertical = val;
    }
}

