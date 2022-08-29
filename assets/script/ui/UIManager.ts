import { _decorator, resources, Prefab, instantiate, log, find, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum DialogDef {
    UISetting = "UISetting",
    UISkillUpgrade = "UISkillUpgrade",
}

/***
 * 
 */
@ccclass("UIManager")
export class UIManager extends Component {

    private static _instance: UIManager;
    static get instance(): UIManager {
        return this._instance;
    }

    panels: Map<string, Node> = new Map();

    start() {
        UIManager._instance = this;      
    }

    onDestroy() {
        UIManager._instance = null;
    }

    openPanel(name: string, bringToTop: boolean = true) {
        if (this.panels.has(name)) {
            let panel = this.panels.get(name);
            panel.active = true;
            if (bringToTop) {
                panel.setSiblingIndex(this.node.children.length - 1);
            }
            return;
        }

        let prefab = resources.get("ui/prefab/" + name);
        let node = instantiate(prefab as Prefab);
        this.node.addChild(node)
        this.panels.set(name, node);
        if (bringToTop) {
            node.setSiblingIndex(this.node.children.length - 1)
        }
    }

    closePanel(name: string, destory: boolean = false) {
        if (this.panels.has(name)) {
            let panel = this.panels.get(name);
            if (panel) {
                if (destory) {
                    panel.removeFromParent();
                } else {
                    panel.active = false;
                }
            }
        }
    }

    showDialog(name: string) {
        for (let dialogName in DialogDef) {
            if (dialogName != name) {
                this.openPanel(name);
            } else {
                this.closePanel(name);
            }
        }
    }

    closeDialog() {
        for (let dialogName in DialogDef) {
            this.closePanel(dialogName);
        }
    }
}

