const XP_SCALING = 1.4706; // for last level to 4242 xp
// const XP_MAX = 100000;
const XP_SCALE = 1000;

export function levelFromXp(xp: number) {
    return Math.floor(Math.pow((xp + 1) / XP_SCALE, 1 / XP_SCALING));
}

export function xpForLevel(level: number) {
    return Math.floor(XP_SCALE * Math.pow(level, XP_SCALING));
}