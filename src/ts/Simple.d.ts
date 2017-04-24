// declare class UtSystem {
//     getUserTimeMSec (): number;
// }
//
// declare class Live2D {
//     init (): void;
//     setGL ( gl: any, num?: number ): void;
// }
//
// declare class Live2DModelWebGL {
//     loadModel ( data: any ): void;
// }

// export declare function UtSystem (): void;
// export declare function Live2D (): void;
// export declare function Live2DModelWebGL (): void;

interface UtSystem {}
interface Live2D {}
interface Live2DModelWebGL {}

interface Window {
    mozCancelAnimationFrame: any;
    mozRequestAnimationFrame: any;
    msRequestAnimationFrame: any;
}
