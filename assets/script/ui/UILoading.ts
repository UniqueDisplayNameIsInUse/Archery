import { _decorator, Component, Label, resources, director, Prefab, SpriteFrame } from 'cc';
import { DynamicResourceDefine } from '../resource/ResourceDefine';
import { ResManager } from '../resource/ResourceManager';
const { ccclass, property } = _decorator;

/**
 * 加载进度条
 */
@ccclass('UILoading')
export class UILoading extends Component {

    @property(Label)
    loadingLabel: Label | null = null;

    start() {
        this.loadDirectory(0);
    }

    private loadDirectory(dirIndex: number) {

        this.loadingLabel.string = "Loading " + (dirIndex / DynamicResourceDefine.directory.length) * 100 + "%";

        if (dirIndex >= DynamicResourceDefine.directory.length) {
            director.loadScene("game");
            return;
        }

        resources.loadDir(DynamicResourceDefine.directory[dirIndex], Prefab, (err: Error, data: (Prefab)[]) => {
            dirIndex++;
            for (let prefab of data) {
                ResManager.cacheAsset(prefab.name, prefab);
            }
            this.loadDirectory(dirIndex);
        })
    }

}

