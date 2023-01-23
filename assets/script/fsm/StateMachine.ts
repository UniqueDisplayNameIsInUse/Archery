import { _decorator } from 'cc';
import { IState, SubMachine } from './State';

/**
 * 主状态机 
 * 主状态机实际上是只有1个子状态机的状态机（绕）
 */
export class StateManager<TKey> {

    mainMachine: SubMachine<TKey> = new SubMachine();

    get currState(): IState<TKey> {
        return this.mainMachine.currState;
    }

    startWith(name: TKey) {
        this.mainMachine.defaultState = name;
        this.mainMachine.transiteTo(name);
    }

    registState(state: IState<TKey>) {
        this.mainMachine.add(state);
    }

    deregistState(name: TKey) {
        this.mainMachine.remove(name);
    }

    transit(name: TKey) {
        this.mainMachine.transiteTo(name);
    }

    update(dt: number) {
        this.mainMachine.update(dt);
    }

}

//在完成这个状态机之后 如果要对 ITransitable 进行扩展
//那就会变成 marionette 的那种状态机了
//最终我们就实现了一个 可以封层、支持转移检测的状态机
//可以用于游戏内各种系统的实现
// 比如： 角色动画、技能系统、Buff 系统 等等。