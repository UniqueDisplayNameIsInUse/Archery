import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 用户数据类
 */
@ccclass('PlayerPreference')
export class PlayerPreference {
   
    static setFloat(key: string, number: number) {
        sys.localStorage.setItem(key, number.toString());
    }

    static getFloat(key: string): number {
        let n = sys.localStorage.getItem(key);
        return Number.parseFloat(n);
    }    
    
}

