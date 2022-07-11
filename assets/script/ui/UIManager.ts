import { _decorator, Component, Node, resources, Prefab, instantiate, Asset, InstancedBuffer } from 'cc';
import { UIPanel } from './UIPanel';
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

    openPanel(name: string) {

        let panel = this.node.getChildByName(name);
        if (panel != null) {
            panel.active = true;
            panel.setSiblingIndex(this.node.children.length - 1);
            return;
        }

        let path = "ui/prefabs/" + name;
        resources.load(path, Prefab, null, (err: Error | null, data: Prefab) => {
            if (err != null) {
                throw err;
            }

            let node = instantiate(data);
            let uiPanel = node.getComponent(UIPanel);
            if (uiPanel == null) {
                uiPanel = node.addComponent(UIPanel);
            }
            uiPanel.panelName = name;
            this.node.addChild(node);
        });

    }

    closePanel(name: string, destory: boolean) {
        if (destory) {
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

}

