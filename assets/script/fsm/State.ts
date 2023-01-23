/**
 * 状态机
 */

/**
 * 基础状态
 * id 或者名字没有用 string 或者 number，而是用的泛型
 * 这样我们可以灵活定义 状态机的id 的类型，适配 number 或者 string 也可以使用 联合类型
 */
export interface IState<TKey> {
    id: TKey
    onEnter(): void;
    onExit(): void;
    update(deltaTime: number): void;
    onDestory(): void;
    canTransit(to: TKey): boolean;
}

/**
 * 状态机基础
 * 只有3个方法
 */
export interface IMachine<TKey> {
    add(state: IState<TKey>);
    remove(name: TKey);
    update(dt: number);
}

/**
 * 拥有可转移的状态才需要的接口
 * 为啥不设计到上面去 因为我们可以用状态机来做别的不需要转移的 
 * 比如 Buff 系统
 */
export interface ITransitable<TKey> {
    transiteTo(name: TKey);
}

/**
 * 子状态机
 * 子状态机有几个能力
 * 1. 状态的能力
 * 2. 状态机的能力
 * 3. 转移的能力
 */
export class SubMachine<TKey> implements IMachine<TKey>, IState<TKey>, ITransitable<TKey> {
    id: TKey;
    states: Map<TKey, IState<TKey>> = new Map();
    currState: IState<TKey>;
    defaultState: TKey;

    add(state: IState<TKey>) {
        this.states.set(state.id, state);
    }

    remove(name: TKey) {
        this.states.delete(name);
    }

    transiteTo(name: TKey) {
        if (this.currState && !this.currState.canTransit(name)) {
            return;
        }
        this.currState?.onExit();
        this.currState = this.states.get(name);
        this.currState?.onEnter();
    }

    update(dt: number) {
        this.currState?.update(dt);
    }

    onEnter(): void {
        if (this.defaultState) {
            this.transiteTo(this.defaultState);
        }
    }

    onExit(): void {
        this.currState?.onExit();
    }

    onDestory(): void {

    }

    canTransit(to: TKey): boolean {
        return this.currState?.canTransit(to);
    }
}