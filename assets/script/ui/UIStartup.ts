import { _decorator, Component, director, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIStartup')
export class UIStartup extends Component {

    start() {
        let btnStart = this.node.getChildByName("BtnStart");
        btnStart.on(Button.EventType.CLICK, this.onClickEnterGame, this);
    }

    onClickEnterGame() {
        director.loadScene("game");
    }
}

