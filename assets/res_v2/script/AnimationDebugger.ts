import { _decorator, animation, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node, v3, Vec3 } from 'cc';
import { VirtualInput } from '../../script/input/VirtualInput';
import { MathUtil } from '../../script/util/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('AnimationDebugger')
export class AnimationDebugger extends Component {

    @property(animation.AnimationController)
    controller: animation.AnimationController | null = null;

    input: Vec3 = v3();

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseButtonDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseButtonUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyup, this);        
    }

    update(deltaTime: number) {
        // console.log(this.controller?.getCurrentStateStatus(0))
        // console.log(this.controller?.getCurrentStateStatus(1))

        this.controller.setValue("vertical", VirtualInput.vertical);
        this.controller.setValue("horizontal", VirtualInput.horizontal);

        this.input.set(VirtualInput.horizontal, 0, VirtualInput.vertical);

        let f = v3();
        MathUtil.rotateToward(f, this.node.forward, this.input, 30 * deltaTime);
        this.node.forward = f;
    }

    onMouseButtonDown(event: EventMouse) {
        console.log("[AnimationDebugger] onMouseButtonDown")
        this.controller.setValue("fire", true);
    }

    onMouseButtonUp(event: EventMouse) {
        console.log("[AnimationDebugger] onMouseButtonUp")
        this.controller.setValue("fire", false);
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode == KeyCode.KEY_W) {
            VirtualInput.vertical = 1;
        }
        if (event.keyCode == KeyCode.KEY_S) {
            VirtualInput.vertical = -1;
        }

        if (event.keyCode == KeyCode.KEY_A) {
            VirtualInput.horizontal = -1;
        }

        if (event.keyCode == KeyCode.KEY_D) {
            VirtualInput.horizontal = 1;
        }

        if (event.keyCode == KeyCode.KEY_R) {
            this.controller.setValue("reload", true);
        }
    }

    onKeyup(event: EventKeyboard) {

        if (event.keyCode == KeyCode.KEY_W) {
            VirtualInput.vertical = 0;
        }
        if (event.keyCode == KeyCode.KEY_S) {
            VirtualInput.vertical = 0;
        }

        if (event.keyCode == KeyCode.KEY_A) {
            VirtualInput.horizontal = 0;
        }

        if (event.keyCode == KeyCode.KEY_D) {
            VirtualInput.horizontal = 0;
        }

    }
}

