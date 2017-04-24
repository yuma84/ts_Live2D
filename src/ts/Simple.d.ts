declare namespace UtSystem {
    function getUserTimeMSec (): number;
}

declare namespace Live2D {
    function init (): void;
    function setGL ( gl: any, num?: number ): void;
}

declare namespace Live2DModelWebGL {
    function loadModel ( data: any ): void;
}

interface Window {
    mozCancelAnimationFrame: any;
    mozRequestAnimationFrame: any;
    msRequestAnimationFrame: any;
}
