declare class UtSystem {
    getUserTimeMSec (): number;
}

declare class Live2D {
    init (): void;
    setGL ( gl: any, num?: number ): void;
}

declare class Live2DModelWebGL {
    loadModel ( data: any ): void;
}

interface Window {
    mozCancelAnimationFrame: any;
    mozRequestAnimationFrame: any;
    msRequestAnimationFrame: any;
}
