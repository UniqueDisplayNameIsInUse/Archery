import { _decorator, Component, Node, Prefab, AudioSource, resources, instantiate, director } from 'cc';
import { Setting } from '../config/Setting';
import { Events } from '../events/Events';
import { DynamicResourceDefine } from '../resource/ResourceDefine';
import { Pools } from '../util/Pools';
const { ccclass, property } = _decorator;

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

    onLoad() {
        AudioManager._instance = this;
        Setting.instance.on(Events.onBgmVolumeChanged, this.onBgmVolumeChanged, this)
    }

    onDestroy() {
        AudioManager._instance = null;
        this.audioPools.destroyAll()
        this.audioPools = null;
        Setting.instance.off(Events.onBgmVolumeChanged, this.onBgmVolumeChanged, this)
    }

    init() {
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

            this.playBgm(DynamicResourceDefine.Audio.Bgm);
        });
    }

    playBgm(path: string) {
        if (this.bgm) {
            this.bgm.stop()
            this.audioPools.free(this.bgmPath, this.bgm.node);
        }
        let node = this.audioPools.allocc(path);
        node.active = true;
        let as = node.getComponent(AudioSource);
        as.volume = Setting.instance.bgmVolume;
        this.bgm = as;
        this.bgmPath = path;
    }

    playSfx(path: string) {
        let node = this.audioPools.allocc(path);
        node.active = true;
        let as = node.getComponent(AudioSource);
        as.volume = Setting.instance.sfxVolume;
        as.stop();
        as.play();
        this.schedule(() => {
            node.active = false;
            this.audioPools.free(path, node);
        }, as.duration)
    }

    onBgmVolumeChanged() {
        if (this.bgm) {
            this.bgm.volume = Setting.instance.bgmVolume;
        }
    }
}

