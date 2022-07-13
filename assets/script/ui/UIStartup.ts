import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIStartup')
export class UIStartup extends Component {

    start() {

    }

    onClickEnterGame() {
        director.loadScene("game", (err, scene) => {
            if( err != null ){
                throw err;
            }
        });
    }

}

