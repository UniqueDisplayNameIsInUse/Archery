import { _decorator, Component, Node, Prefab, AudioSource, resources, instantiate, director } from 'cc';
import { Config } from '../config/Config';
import { Events } from '../events/Events';
import { Pools } from '../util/Pools';
const { ccclass, property } = _decorator;

export const AudioDefine = {
    SFX_HIT: "SfxHit",
    SFX_SHOOT: "SfxShoot"
}

/**
 * 音效管理器
 */
@ccclass('AudioManager')
export class AudioManager extends Component {

    static _instance: AudioManager;
    static get instance(): AudioManager {
        return this._instance;
    }

    audioPools: Pools<string, Node> = new Pools();

    audioLoaded: boolean = false;

    bgmPath: string = '';
    bgm: AudioSource | null = null;

    prefabs: Map<string, Prefab> = new Map()

    start() {
        AudioManager._instance = this;        
        this.createPools()
        Config.instance.on(Events.onBgmVolumeChanged, this.onBgmVolumeChanged, this)
    }

    onDestroy() {
        AudioManager._instance = null;
        this.audioPools.destroyAll()
        this.audioPools = null;
        Config.instance.off(Events.onBgmVolumeChanged, this.onBgmVolumeChanged, this)
    }

    playBgm(path: string) {
        if (!this.audioLoaded) return;
        if (this.bgm) {
            this.bgm.stop()
            this.audioPools.free(this.bgmPath, this.bgm.node);
        }
        let node = this.audioPools.allocc(path);
        node.active = true;
        let as = node.getComponent(AudioSource);
        as.volume = Config.instance.bgmVolume;
        this.bgm = as;
        this.bgmPath = path;
    }

    playSfx(path: string) {
        if (!this.audioLoaded) return;
        let node = this.audioPools.allocc(path);
        node.active = true;
        let as = node.getComponent(AudioSource);
        as.volume = Config.instance.sfxVolume;
        as.stop();
        as.play();
        this.schedule(() => {
            node.active = false;
            this.audioPools.free(path, node);
        }, as.duration)
    }

    createPools() {
        resources.loadDir("audio/prefab", Prefab, (err: Error, prefabs: Prefab[]): void => {
            for (let prefab of prefabs) {
                this.audioPools.newPool(prefab.data.name, (): Node => {
                    let node = instantiate(prefab);
                    director.getScene().addChild(node);
                    node.active = false;
                    return node;
                }, 1, (node: Node) => {
                    node.removeFromParent();
                })


                this.prefabs.set(prefab.data.name, prefab);
            }
            this.audioLoaded = true;

            this.playBgm("Bgm")
        });
    }

    onBgmVolumeChanged() {
        if (this.bgm) {
            this.bgm.volume = Config.instance.bgmVolume;
        }
    }
}

