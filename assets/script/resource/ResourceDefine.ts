export const DynamicResourceDefine = {

    paths: ["effect", "audio", "actor", "ui"],

    effect: {
        HitEffect: "effect/prefab/EffExplore",
        DieEffect: "effect/prefab/EffDie",
    },
    audio: {
        Bgm: "audio/prefab/Bgm",
        SfxHit: "audio/prefab/SfxHit",
        SfxShoot: "audio/prefab/SfxShoot",
    },

    monster: {
        aular: "actor/prefab/aula",
        magican: "actor/prefab/magicanAll"
    },
    ui: {
        Num: "ui/prefab/Num",
        UIStartup: "ui/prefab/UIStartup",
        UISkillUpgrade: "ui/prefab/UISkillUpgrade"
    }
}
