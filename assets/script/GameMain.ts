import { _decorator } from 'cc';
import { PlayerController } from './actor/PlayerController';
import { Config } from './config/Config';
import { EffectManager } from './effect/EffectManager';
import { Level } from './map/Level';

export class GameMain {    

    /**
     * 
     */
    static PlayerController: PlayerController | null = null;

    /**
     * 
     */
    static Level: Level | null = null;

    /**
     * 
     */
    static EffectManager: EffectManager | null = null;    
    /**
     * 全局配置
     */
    static Config = new Config()
}