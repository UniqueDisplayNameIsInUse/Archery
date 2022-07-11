import { _decorator, Component, Node, SkeletalAnimation, input, Input, EventMouse, Vec2, v3, Vec3, SkeletalAnimationState, director, game, AnimationClip } from 'cc';
import { Projectile } from '../actor/Projectile';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('ShootTestCase')
export class ShootTestCase extends Component {

    @property(SkeletalAnimation)
    host: SkeletalAnimation | null = null;

    @property(Node)
    projectile: Node | null = null;

    @property(Node)
    bow: Node | null = null;

    @property(Node)
    pullOrigin: Node | null = null;

    initialDirection: Vec3 = v3()

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMsDown, this);        
    }

    update(deltaTime: number) {

    }

    onMsDown(evt: EventMouse) {
        if (evt.getButton() == EventMouse.BUTTON_LEFT) {
            this.host?.on(SkeletalAnimation.EventType.FINISHED, this.onAnimationEnter, this)
            this.host?.crossFade("attack", 0.1);                                
        }
    }   

    onAnimationEnter(eventType:string, state: SkeletalAnimationState){
        //console.log("onAnimationEnter");        
        this.host?.off(SkeletalAnimation.EventType.FINISHED, this.onAnimationEnter, this)
        this.host?.crossFade("idle", 0.1);

        this.projectile?.setParent(null, true);        
        director.getScene()?.addChild(this.projectile!);       
        
        Vec3.subtract(this.initialDirection, this.bow!.worldPosition, this.pullOrigin!.worldPosition);
        this.initialDirection.normalize();

        this.projectile?.getComponent(Projectile)?.fire(this.initialDirection);
    }
}

