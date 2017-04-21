///<reference path="Simple.d.ts"/>
var Simple = (function () {
    function Simple() {
        this.live2DModel = null;
        // ID to Stop Animation
        this.requestID = null;
        this.loadLive2DCompleted = false;
        this.initLive2DCompleted = false;
        this.loadedImages = [];
        this.modelDef = {
            "type": "Live2D Model Setting",
            "name": "Epsilon2.1",
            "model": "assets/Epsilon2.1/Epsilon2.1.moc",
            "textures": [
                "assets/Epsilon2.1/Epsilon2.1.2048/texture_00.png",
            ]
        };
        this.initModel();
    }
    /*
    * Setting Live2D Model
    */
    Simple.prototype.initModel = function () {
        var _this = this;
        Live2D.init();
        this.canvas = document.getElementById("glcanvas");
        // as Context Lost
        this.canvas.addEventListener("webglcontextlost", function (e) {
            _this.myerror("context lost");
            _this.loadLive2DCompleted = false;
            _this.initLive2DCompleted = false;
            var cancelAnimationFrame = window.cancelAnimationFrame ||
                window.mozCancelAnimationFrame;
            cancelAnimationFrame(_this.requestID); // Stop Animation
            e.preventDefault();
        }, false);
        // as Context Restored
        this.canvas.addEventListener("webglcontextrestored", function (e) {
            _this.myerror("webglcontext restored");
            _this.initLoop();
        }, false);
        // Init and start Loop
        this.initLoop();
    };
    /*
    * Get and Init WebGL Context
    * Init Live2D, Start Loop Drawing
    */
    Simple.prototype.initLoop = function () {
        //------------ Init WebGL ------------
        var _this = this;
        // Get WebGL Context
        this.gl = this.getWebGLContext();
        if (!this.gl) {
            this.myerror("Failed to create WebGL context.");
            return;
        }
        // Set OpenGL Context
        Live2D.setGL(this.gl);
        //------------ Init Live2D ------------
        // Create Instance of Live2D Model from MOC
        this.loadBytes(this.modelDef.model, function (buf) {
            _this.live2DModel = Live2DModelWebGL.loadModel(buf);
        });
        // Lead Texture
        var loadCount = 0;
        for (var i = 0; i < this.modelDef.textures.length; i++) {
            (function (tno) {
                _this.loadedImages[tno] = new Image();
                _this.loadedImages[tno].src = _this.modelDef.textures[tno];
                _this.loadedImages[tno].onload = function () {
                    if ((++loadCount) == _this.modelDef.textures.length) {
                        _this.loadLive2DCompleted = true; // Completed to load all
                    }
                };
                _this.loadedImages[tno].onerror = function () {
                    _this.myerror("Failed to load image : " + _this.modelDef.textures[tno]);
                };
            })(i);
        }
        //------------ Loop Drawing ------------
        this.tick();
    };
    Simple.prototype.tick = function () {
        this.draw(); // Draw Once
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        this.requestID = requestAnimationFrame(this.tick.bind(this), this.canvas); // Call Myself after fixed time
    };
    Simple.prototype.draw = function () {
        // Clear Drawing Area
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        // Init Live2D
        if (!this.live2DModel || !this.loadLive2DCompleted)
            return;
        // Init for the First Time Only after Completed to Load
        if (!this.initLive2DCompleted) {
            this.initLive2DCompleted = true;
            // Create WebGL Texture from Image and Entry into Model
            for (var i = 0; i < this.loadedImages.length; i++) {
                // Create Texture from Image Object
                var texName = this.createTexture(this.loadedImages[i]);
                this.live2DModel.setTexture(i, texName); // Set Texture on the Model
            }
            // Clear Reference of Origin Texture Image
            this.loadedImages = null;
            // Define Matrix to Assign Display Position
            var s = 2.0 / this.live2DModel.getCanvasWidth(); // Confine Canvas Width within renge of -1...1
            var matrix4x4 = [
                s, 0, 0, 0,
                0, -s, 0, 0,
                0, 0, 1, 0,
                -1, 1, 0, 1
            ];
            this.live2DModel.setMatrix(matrix4x4);
        }
        // キャラクターのパラメータを適当に更新
        var t = UtSystem.getUserTimeMSec() * 0.001 * 2 * Math.PI; //1秒ごとに2π(1周期)増える
        var cycle = 3.0; //パラメータが一周する時間(秒)
        // PARAM_ANGLE_Xのパラメータが[cycle]秒ごとに-30から30まで変化する
        this.live2DModel.setParamFloat("PARAM_ANGLE_X", 30 * Math.sin(t / cycle));
        this.live2DModel.setParamFloat("PARAM_EYE_R_OPEN", 1 * Math.sin(t / cycle));
        this.live2DModel.setParamFloat("PARAM_EYE_L_OPEN", 1 * Math.sin(t / cycle));
        this.live2DModel.update();
        this.live2DModel.draw();
    };
    ;
    /*
    * Get WebGL Context
    */
    Simple.prototype.getWebGLContext = function () {
        var NAMES = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var param = {
            alpha: true,
            premultipliedAlpha: true
        };
        for (var i = 0; i < NAMES.length; i++) {
            try {
                var ctx = this.canvas.getContext(NAMES[i], param);
                if (ctx)
                    return ctx;
            }
            catch (e) { }
        }
        return null;
    };
    ;
    /*
    * Create Texture from Image Object
    */
    Simple.prototype.createTexture = function (image) {
        var texture = this.gl.createTexture(); // Create Texture Object
        if (!texture) {
            this.mylog("Failed to generate gl texture name.");
            return -1;
        }
        if (this.live2DModel.isPremultipliedAlpha() == false) {
            // 乗算済アルファテクスチャ以外の場合
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1); //imageを上下反転
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    };
    ;
    /*
    * Load File as Bytes Array
    */
    Simple.prototype.loadBytes = function (path, callback) {
        var _this = this;
        var request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            switch (request.status) {
                case 200:
                    callback(request.response);
                    break;
                default:
                    _this.myerror("Failed to load (" + request.status + ") : " + path);
                    break;
            }
        };
        request.send(null);
    };
    ;
    Simple.prototype.mylog = function (msg) {
        var myconsole = document.getElementById("myconsole");
        myconsole.innerHTML = myconsole.innerHTML + "<br>" + msg;
        console.log(msg);
    };
    ;
    Simple.prototype.myerror = function (msg) {
        console.error(msg);
        this.mylog("<span style='color:red'>" + msg + "</span>");
    };
    ;
    return Simple;
}());
var simple = new Simple();
window.onerror = function (msg, url, line, col, error) {
    var errmsg = "file:" + url + "<br>line:" + line + " " + msg;
    simple.myerror(errmsg);
};
