import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerPreference')
export class PlayerPreference {

    static setBool(key: string, value: boolean) {
        sys.localStorage.setItem(key, value ? "true" : "false");
    }

    static getBool(key: string, value: boolean) {
        const b = sys.localStorage.getItem(key)
        return b == "true" ? true : false;
    }

    static setFloat(key: string, number: number) {
        sys.localStorage.setItem(key, number.toString());
    }

    static getFloat(key: string): number {
        let n = sys.localStorage.getItem(key);
        return Number.parseFloat(n);
    }

    static setInt(key: string, n: number) {
        sys.localStorage.setItem(key, n.toFixed());
    }

    static getInt(key: string): number {
        let n = sys.localStorage.getItem(key);
        return Number.parseInt(n);
    }
    
}

