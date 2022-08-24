import { _decorator, Component, Slider, math, ProgressBar, Button, Node, director } from 'cc';
import { GameMain } from '../GameMain';
import { UIUtil } from './UIUtil';
const { ccclass, property } = _decorator;

/**
 * 设置界面脚本
 */
@ccclass('UISetting')
export class UISetting extends Component {

    /**
     * BGM 的滑动器组件
     */
    sliderBgmVolume: Slider | null = null;

    /**
     * 背景音乐音量进度条
     */
    progressBgmVolume: ProgressBar | null = null;

    /**
     * SFX 音效的滑动器组件
     */
    sliderSfxVolume: Slider | null = null;

    /**
     * 音效的音量进度条
     */
    progressSfxVolume: ProgressBar | null = null;

    /**
     * 关闭按钮
     */
    btnClose : Node | null = null;

    start() {
        this.sliderBgmVolume = this.node.getChildByName("Bgm").getComponent(Slider);
        this.sliderBgmVolume.node.on("slide",this.onBgmVolumeChanged, this);
        this.progressBgmVolume = this.sliderBgmVolume.node.getChildByName("ProgressBar").getComponent(ProgressBar);        

        this.sliderSfxVolume = this.node.getChildByName("Sfx").getComponent(Slider);
        this.sliderSfxVolume.node.on("slide", this.onSfxVolumeChanged, this);
        this.progressSfxVolume = this.sliderSfxVolume.node.getChildByName("ProgressBar").getComponent(ProgressBar);        

        this.sliderBgmVolume.progress = GameMain.Config.bgmVolume;
        this.sliderSfxVolume.progress = GameMain.Config.sfxVolume;

        this.progressBgmVolume.progress = GameMain.Config.bgmVolume;
        this.progressSfxVolume.progress = GameMain.Config.sfxVolume;

        this.btnClose = this.node.getChildByName("BtnClose");
        this.btnClose.on(Button.EventType.CLICK, this.onClose, this);
    }

    onDisable(){
        this.btnClose.off(Button.EventType.CLICK, this.onClose, this);
    }

    onBgmVolumeChanged(value: Slider) {
        GameMain.Config.bgmVolume = math.clamp01(value.progress);
        this.progressBgmVolume.progress = value.progress;
    }    

    onSfxVolumeChanged(value: Slider) {
        GameMain.Config.sfxVolume = math.clamp01(value.progress);
        this.progressSfxVolume.progress = value.progress;
    }

    onClose() {        
        UIUtil.closePanel(this.node.name, false);
    }
}

