import { _decorator, Component, ProgressBar, Label, Button, director, resources } from 'cc';
import { Events } from '../events/Events';
import { GameMain } from '../GameMain';
import { UIUtil } from './UIUtil';
const { ccclass, property } = _decorator;

@ccclass('UIGame')
export class UIGame extends Component {

    @property(ProgressBar)
    expBar: ProgressBar | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    expLabel: Label | null = null;

    isPaused: boolean = false;

    labelPause: Label | null = null;

    btnSetting: Button | null = null;

    start() {
        GameMain.PlayerController?.node.on(Events.onExpGain, this.onExpGain, this);
        GameMain.PlayerController?.node.on(Events.onPlayerUpgrade, this.onUpgrade, this);

        this.onExpGain();
        this.levelLabel!.string = "Level: " + GameMain.PlayerController?.level;

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
        if(director.isPaused()){
            director.resume();
        }else{
            director.pause();
        }
    }

    onOpenSetting() {        
        UIUtil.openPanel("UISetting");
    }

    onUpgrade() {
        this.levelLabel!.string = "Level: " + GameMain.PlayerController?.level;

        UIUtil.openPanel("UISkillUpgrade");
    }

    onExpGain() {
        if (GameMain.PlayerController) {
            this.expBar!.progress = GameMain.PlayerController.exp / GameMain.PlayerController.maxExp;
            this.expLabel!.string = GameMain.PlayerController.exp.toFixed() + "/" + GameMain.PlayerController.maxExp.toFixed();
        }
    }
}

