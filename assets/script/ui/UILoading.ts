import { _decorator, Component, Node, Label, macro, resources, director } from 'cc';
import { DynamicResourceDefine } from '../resource/ResourceDefine';
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

        resources.loadDir(DynamicResourceDefine.directory[dirIndex], () => {
            dirIndex++;
            this.loadDirectory(dirIndex);
        })
    }

}

