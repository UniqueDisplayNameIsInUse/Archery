import { _decorator, Component, resources, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    static _inst: UIManager | null = null;
    static get inst(): UIManager | null {
        return this._inst;
    }

    start() {
        UIManager._inst = this;
    }

    onDestroy() {
        UIManager._inst = null;
    }

    openPanel(name: string, bringToTop: boolean = true) {

        let panel = this.node.getChildByName(name);
        if (panel != null) {
            panel.active = true;
            if (bringToTop) {
                panel.setSiblingIndex(this.node.children.length - 1);
            }
            return;
        }

        let path = "ui/prefabs/" + name;
        resources.load(path, Prefab, null, (err: Error | null, data: Prefab) => {
            if (err != null) {
                throw err;
            }

            let node = instantiate(data);
            this.node.addChild(node);
        });

    }

    closePanel(name: string, destory: boolean) {
        let panel = this.node.getChildByName(name);
        if (panel != null) {
            if (destory) {
                panel.removeFromParent();
            } else {
                panel.active = false;
            }
        }
    }

}

