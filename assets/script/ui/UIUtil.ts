import { _decorator, resources, Prefab, instantiate, log, find, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 */
export class UIUtil {

    static uiRoot: Node | null = null;

    static openPanel(name: string, bringToTop: boolean = true) {
        log("open panel, name:", name, ", bringToTop:", bringToTop);

        if (this.uiRoot == null) {
            this.uiRoot = find("UIRoot");
        }

        let panel = this.uiRoot.getChildByName(name);
        if (panel != null) {
            panel.active = true;
            if (bringToTop) {
                panel.setSiblingIndex(this.uiRoot.children.length - 1);
            }
            return;
        }

        let path = "ui/prefabs/" + name;
        resources.load(path, Prefab, null, (err: Error | null, data: Prefab) => {
            if (err != null) {
                throw err;
            }

            let node = instantiate(data);
            this.uiRoot.addChild(node);
        });

    }

    static closePanel(name: string, destory: boolean) {
        let panel = this.uiRoot.getChildByName(name);
        if (panel != null) {
            if (destory) {
                panel.removeFromParent();
            } else {
                panel.active = false;
            }
        }
    }

}

