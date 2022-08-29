import { _decorator, Component, Node, Prefab, Pool, director, instantiate, PhysicsGroup, PhysicsSystem } from 'cc';
import { Events } from '../events/Events';
import { Projectile } from './Projectile';
import { ProjectileProperty } from './ProjectileProperty';
const { ccclass, property } = _decorator;

/**
 * 投射物发射器
 */
@ccclass('ProjectileEmitter')
export class ProjectileEmitter extends Component {

    @property(Prefab)
    projectile: Prefab | null = null;

    prefabPool: Pool<Node> | null = null;

    propertyPool: Pool<ProjectileProperty> | null = null;    

    start() {
        const poolCount = 5;

        this.prefabPool = new Pool(() => {
            return instantiate(this.projectile!);
        }, poolCount, (node: Node) => {
            node.removeFromParent();
        });

        this.propertyPool = new Pool(() => {
            return new ProjectileProperty();
        }, poolCount, (projectProperty: ProjectileProperty) => {
            projectProperty = null;
        })
    }

    onDestroy() {
        this.prefabPool.destroy();
        this.propertyPool.destroy();
    }

    create(): Projectile {
        let node = this.prefabPool.alloc();
        if (node.parent == null)
            director.getScene().addChild(node);
        node.active = true;

        let projectile = node.getComponent(Projectile);
        projectile.projectProperty = this.propertyPool.alloc();

        node.on(Events.onProjectileDead, this.onProjectileDead, this);

        return projectile;
    }

    onProjectileDead(projectile: Projectile) {
        projectile.node.active = false;
        projectile.node.off(Events.onProjectileDead, this.onProjectileDead, this);
        this.propertyPool.free(projectile.projectProperty);
        this.prefabPool.free(projectile.node);
    }
}

