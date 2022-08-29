import { _decorator, Component, ProgressBar, Label, Button, director, resources } from 'cc';
import { Events } from '../events/Events';
import { ActorManager } from '../level/ActorManager';
import { DialogDef as DialogDefine, UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('UIGame')
export class UIGame extends Component {

    @property(ProgressBar)
    expBar: ProgressBar | null = null;

    @property(Label)
    expLabel: Label | null = null;

    isPaused: boolean = false;

    labelPause: Label | null = null;

    btnSetting: Button | null = null;

    start() {
        ActorManager.instance.playerActor?.node.on(Events.onExpGain, this.onExpGain, this);
        ActorManager.instance.playerActor?.node.on(Events.onPlayerUpgrade, this.onUpgrade, this);

        this.onExpGain();

        this.btnSetting = this.node.getChildByPath("Layout/BtnSetting").getComponent(Button);
        this.btnSetting.node.on(Button.EventType.CLICK, this.onOpenSetting, this);
    }

    onDisable() {
        this.btnSetting.node.off(Button.EventType.CLICK, this.onOpenSetting, this);
    }

    onExitGame() {
        resources.releaseUnusedAssets()
        director.loadScene("startup")
    }

    onPauseGame() {
        if (director.isPaused()) {
            director.resume();
        } else {
            director.pause();
        }
    }

    onOpenSetting() {
        UIManager.instance.showDialog(DialogDefine.UISetting);
    }

    onUpgrade() {
        UIManager.instance.showDialog(DialogDefine.UISkillUpgrade);
    }

    onExpGain() {
        if (ActorManager.instance.playerController) {
            this.expBar!.progress = ActorManager.instance.playerController.exp / ActorManager.instance.playerController.maxExp;
            this.expLabel!.string = ActorManager.instance.playerController.exp.toFixed() + "/" + ActorManager.instance.playerController.maxExp.toFixed();
        }
    }
}

