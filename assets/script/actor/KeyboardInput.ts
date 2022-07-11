import { _decorator, Component, input, Input, EventKeyboard, KeyCode, SkeletalAnimation, EventMouse } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KeyboardInput')
export class KeyboardInput extends Component {

    vertical: number = 0.0;
    horizontal: number = 0.0;

    fire: boolean = false;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
    }

    onKeyDown(event: EventKeyboard) {

        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.vertical = -1.0;
                break;
            case KeyCode.KEY_S:
                this.vertical = 1.0;
                break;
            case KeyCode.KEY_A:

                this.horizontal = -1.0;
                break;
            case KeyCode.KEY_D:
                this.horizontal = 1.0;
                break;
        }

    }

    onKeyUp(event: EventKeyboard) {

        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.vertical = 0;
                break;
            case KeyCode.KEY_S:
                this.vertical = 0;
                break;
            case KeyCode.KEY_A:
                this.horizontal = 0;
                break;
            case KeyCode.KEY_D:
                this.horizontal = 0;
                break;
        }
    }

    onMouseButtonDown(event: EventMouse) {

        if(event.getButton() == EventMouse.BUTTON_LEFT){
            this.fire = true;
        }

    }

    onMouseButtonUp(event:EventMouse){
        if(event.getButton() == EventMouse.BUTTON_LEFT){
            this.fire = false;
        }
    }

    lateUpdate(deltaTime:number){
        //this.fire = false;
    }
}

