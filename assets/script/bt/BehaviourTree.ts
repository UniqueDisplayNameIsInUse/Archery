import { math } from "cc";

/**
 * 行为树
 */
export namespace bt {

    /**
     * @zh
     * 执行结果
     */
    export enum ExecuteState {
        /**
         * @zh
         * 失败
         */
        Fail = 'fail',

        /**
         * @zh
         * 执行成功
         */
        Success = 'success',

        /**
         * @zh
         * 执行中
         */
        Running = 'running',

    }

    /**
     * @zh
     * 一些方便使用的函数
     * @param result 
     */

    export function markFail(result: ExecuteResult) {
        result.executeState = ExecuteState.Fail;
    }

    export function markRunning(result: ExecuteResult) {
        result.executeState = ExecuteState.Running;
    }

    export function markSuccess(result: ExecuteResult) {
        result.executeState = ExecuteState.Success;
    }

    /**
     * @zh
     * 执行结果
     * 主要是为了方便，所以将 Blackboard 和 executeResult 绑在了一起免得取起来不方便
     */
    export class ExecuteResult {
        executeState: ExecuteState = ExecuteState.Fail;
        blackboard: Blackboard = new Blackboard();
    }

    //#region  interface defination

    /**
     * @zh
     * 基础节点
     * 基础节点只有 execute 方法
     */
    export interface BtNode {
        execute(dt: number, result: ExecuteResult);
    }

    /**
     * @zh
     * 执行节点
     * 虚类，主要用于标识改节点的功能，方便调试
     */
    export abstract class ExecutionNode implements BtNode {
        abstract execute(dt: number, result: ExecuteResult);
    }

    /**
     * @zh
     * 动作节点
     * 虚类，主要用于标识改节点的功能，方便调试
     */
    export abstract class Action implements ExecutionNode {
        abstract execute(dt: number, result: ExecuteResult);
    }

    /**
     * @zh
     * 条件节点
     * 虚类，主要用于标识改节点的功能，方便调试
     */
    export abstract class Condition implements ExecutionNode {
        abstract isSatisfy(result: ExecuteResult): boolean;
        execute(dt: number, result: ExecuteResult) {
            result.executeState = this.isSatisfy(result) ? ExecuteState.Success : ExecuteState.Fail;
        }
    }

    /**
     * @zh
     * 控制节点
     * 虚类，主要用于标识改节点的功能，方便调试
     * 控制节点必定有多个子节点
     */
    export abstract class ControllNode implements BtNode {
        children: Array<BtNode> = [];
        abstract execute(dt: number, result: ExecuteResult);
        addChild(child: BtNode) {
            this.children.push(child);
        }
    }

   /**
   * @zh
   * 装饰器
   * 虚类，主要用于标识改节点的功能，方便调试
   * 装饰器肯定有1个节点，并只对该节点的执行结果进行修饰
   */
    export abstract class Decorator implements BtNode {
        child: BtNode = null;
        execute(dt: number, result: ExecuteResult) {
            this.child?.execute(dt, result);
            this.decroateResult(result);
        }
        abstract decroateResult(result: ExecuteResult);
    }

    //#endregion interface defination

    /**
     * Sequence
     * @zh
     * 所有执行完毕并返回 success
     */
    export class Sequence extends ControllNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState == ExecuteState.Fail || result.executeState == ExecuteState.Running) {
                    break;
                }
            }
            return result;
        }
    }

    /**
     * Fallback 
     * @zh
     * 任意一个子节点执行成功或者所有子节点都执行失败
     */
    export class Fallback extends ControllNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState != ExecuteState.Fail) {
                    break;
                }
            }
            return result;
        }
    }

    /**
     * Parallel
     * @zh
     * 返回一定数量[0, children.length]成功的则成功
     */
    export class Parallel extends ControllNode {
        mustSuccessCount: number = 1;
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let successCount: number = 0;
            for (let child of this.children) {
                child.execute(dt, result);
                if (result.executeState == ExecuteState.Success) {
                    successCount++;
                }
            }

            if (successCount >= this.mustSuccessCount) {
                markSuccess(result);
            }
        }
    }

    /**
     * @zh
     * 随机选择器
     */
    export class RandomSelector extends ControllNode {
        execute(dt: number, result: ExecuteResult) {
            markFail(result);
            let selectedChild = this.children[math.randomRangeInt(0, this.children.length)];
            selectedChild.execute(dt, result);
        }
    }

    /**
     * @zh
     * 翻转节点的结果
     */
    export class InvertResultDecorator extends Decorator {
        decroateResult(result: ExecuteResult) {
            if (result.executeState == ExecuteState.Fail) {
                result.executeState = ExecuteState.Success;
            } else if (result.executeState == ExecuteState.Success) {
                result.executeState = ExecuteState.Fail;
            }
        }
    }

    /**
     * @zh
     * 等待一定时间(单位：秒)
     */
    export class Wait extends Action {

        interval: number = 0;
        waitDuration: number = 1;
        start: boolean = false;

        execute(dt: number, result: ExecuteResult) {
            markFail(result);

            if (!this.start) {
                this.start = true;
                this.interval = 0;
            }

            this.interval += dt;
            if (this.interval < this.waitDuration) {
                markRunning(result);
                return;
            }

            this.interval = 0;
            this.start = false;
            markSuccess(result);
        }
    }

    /**
     * @zh
     * 检测黑板中是否有某个值
     * @en
     * check has key
     */
    export class ContainsKey extends Condition {
        isSatisfy(result: ExecuteResult): boolean {
            return result.blackboard.has(this.key);
        }
        key: string;
    }

    /**
     * @zh
     * 检查是否黑板中存在某个键且为真
     * @en
     * check if the key is true
     */
    export class IsTrue extends Condition {
        isSatisfy(result: ExecuteResult): boolean {
            return result.blackboard.get(this.key);
        }
        key: string
    }


    /**
     * @zh
     * AI 的黑板     
     */
    export class Blackboard {
        data: Map<string, any> = new Map();

        has(name: string): boolean {
            return this.data.has(name)
        }

        set(name: string, val: any) {
            this.data.set(name, val)
        }

        get(name: string): any {
            if (!this.has(name)) {
                return null;
            }
            return this.data.get(name)
        }

        remove(name: string) {
            this.data.delete(name);
        }
    }

    /**
     * 行为树
     */
    export class BehaviourTree {

        root: BtNode
        result: ExecuteResult = new ExecuteResult();

        setBlackboard(bb: Blackboard) {
            this.result.blackboard = bb;
        }

        setData(name: string, value: any) {
            this.result.blackboard.set(name, value);
        }

        getData(name: string): any {
            return this.result.blackboard.get(name);
        }

        removeData(name: string) {
            this.result.blackboard.remove(name);
        }

        hasData(name: string): boolean {
            return this.result.blackboard.has(name);
        }

        update(dt: number) {
            this.root?.execute(dt, this.result);
        }
    }
}