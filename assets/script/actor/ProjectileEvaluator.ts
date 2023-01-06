import { Projectile } from "./Projectile"

type EvaluatorType = string | number;

export interface ProjectileEvaluator {
    
    projectile: Projectile;

    with(projectile: Projectile): ProjectileEvaluator;

    eval(deltaTime: number): ProjectileEvaluator;

    apply(): ProjectileEvaluator;
}

export class KinematicEvaluator implements ProjectileEvaluator {

    projectile: Projectile;

    with(projectile: Projectile): ProjectileEvaluator {
        this.projectile = projectile;
        return this;
    }

    eval(deltaTime: number): ProjectileEvaluator {
        return this;
    }

    apply(): ProjectileEvaluator {
        return this;
    }
}

export class KinematicChaseEvaluator implements ProjectileEvaluator {
    projectile: Projectile;
    with(projectile: Projectile): ProjectileEvaluator {
        return this;
    }
    eval(deltaTime: number): ProjectileEvaluator {
        return this;
    }
    apply(): ProjectileEvaluator {
        return this;
    }
}

let evaluatorMap: Map<EvaluatorType, ProjectileEvaluator> = new Map();

let kce = new KinematicChaseEvaluator();