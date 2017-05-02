var vertexShader = 
    "attribute vec3 vertexPos;\n" +
    "uniform mat4 modelViewMatrix;\n" +
    "uniform mat4 projectionMatrix;\n" +
    
    "void main(void) {\n" +
        "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);\n" +
    "}\n"

var fragmentShader =
    "#ifdef GL_ES\n" +
    "precision highp float;\n" +
    "#endif\n" +

    "uniform vec4 uColor;\n" +

    "void main() {\n" +
        "gl_FragColor = uColor;\n" +
    "}"

function Display(world, canvas) {
    this._canvas = canvas
    this._world = world

    this._squares = []
    this._pools = []
    this._objs = []

    this.xCam = 0
    this.yCam = 0

    this._init()
}

Display.prototype._init = function() {
    // -- GET GRAPHICS CONTEXT
    this._gl = null

    try {
        this._gl = canvas.getContext("experimental-webgl");
    } catch(e) { }
    
    if (!this._gl) {
        console.log("Unable to initialize WebGL. Your browser may not support it.");
        return;
    } else {
        this._gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // -- SHADERS
    // COMPILE
    var vs = this._gl.createShader(this._gl.VERTEX_SHADER);
    this._gl.shaderSource(vs, vertexShader);
    this._gl.compileShader(vs);

    var fs = this._gl.createShader(this._gl.FRAGMENT_SHADER);
    this._gl.shaderSource(fs, fragmentShader);
    this._gl.compileShader(fs);

    // LINK
    var program = this._gl.createProgram();
    this._gl.attachShader(program, vs);
    this._gl.attachShader(program, fs);
    this._gl.linkProgram(program);

    // CHECK FOR ERRORS
    if (!this._gl.getShaderParameter(vs, this._gl.COMPILE_STATUS))
        console.log(this._gl.getShaderInfoLog(vs));

    if (!this._gl.getShaderParameter(fs, this._gl.COMPILE_STATUS))
        console.log(this._gl.getShaderInfoLog(fs));

    if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS))
        console.log(this._gl.getProgramInfoLog(program));
    
    this._shaders = { program: program }

    this._shaders.vertexPosAttribute = this._gl.getAttribLocation(program, "vertexPos");
    this._gl.enableVertexAttribArray(this._shaders.vertexPosAttribute);

    this._shaders.projMatUniform = this._gl.getUniformLocation(program, "projectionMatrix");
    this._shaders.modelMatUniform = this._gl.getUniformLocation(program, "modelViewMatrix");
    this._shaders.uColorUniform = this._gl.getUniformLocation(program, "uColor");

    // -- CACHE
    // Create a model view matrix with camera at 0, 0, −3.333
    this._modelMat = mat4.create();

    // Create an orthographic project matrix 
    this._projMat = mat4.create();
    mat4.ortho(this._projMat, 
               -this._canvas.width/(2 * this._scalecam), 
               this._canvas.width/(2 * this._scalecam), 
               -this._canvas.height/(2 * this._scalecam), 
               this._canvas.height/(2 * this._scalecam), 
               0.1, 100)
}

Display.prototype._createSquare = function(sq) {
    var hw = sq.width/2, hh = sq.height/2
    var vertexBuffer = this._gl.createBuffer()
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer)
    var verts = [
        hw,  hh,  0.0,
        -hw,  hh,  0.0,
        -hw, -hh,  0.0,
        hw, -hh,  0.0
    ];
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(verts), this._gl.STATIC_DRAW)
    
    console.log(vertexBuffer)

    return {
        type: "square",
        buffer: vertexBuffer,
        vertSize: 3, 
        nVerts: 4, 
        coll: sq
    };
}
Display.prototype._createLine = function(line) {
    var verts, otherverts
    var h = line.size/2
    if(line._dir == 0 || line._dir == 2) {
        verts = [
            0,  -h,  0,
            0,  h,  0
        ]
        if(!line._twoway) {
            if(line._dir == 0) {
                otherverts = [
                    0.08, -h, 0,
                    0.08, h, 0
                ]
            } else {
                otherverts = [
                    -0.08, -h, 0,
                    -0.08, h, 0
                ]
            }
        }
    } else {
        verts = [
            -h,  0,  0,
            h,  0,  0
        ]
        if(!line._twoway) {
            if(line._dir == 1) {
                otherverts = [
                    -h, -0.08, 0.0,
                    h, -0.08, 0.0
                ]
            } else {
                otherverts = [
                    -h, 0.08, 0.0,
                    h, 0.08, 0.0
                ]
            }
        }
    }
    var vertexBuffer = this._gl.createBuffer(), otherBuffer
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer)
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(verts), this._gl.STATIC_DRAW)
    if(!line._twoway) {
        otherBuffer = this._gl.createBuffer()
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, otherBuffer)
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(otherverts), this._gl.STATIC_DRAW)
    }

    return {
        type: "line",
        buffer: vertexBuffer,
        obuffer: otherBuffer,
        vertSize: 3, 
        nVerts: 2, 
        coll: line
    };
}

Display.prototype._draw = function() {
    // -- INIT DRAWING
    this._gl.clearColor(0, 0, 0, 1);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);

    var camMatrix = mat4.create();
    mat4.translate(camMatrix, camMatrix, [-this.xCam, -this.yCam, -100])
    
    // set the shader to use
    this._gl.useProgram(this._shaders.program);

    // -- GET SQUARES TO DRAW
    // REMOVE SQUARES OUTSIDE OF "FRUSTRUM"
    var j = 0, 
        len = this._objs.length

    for(let i = 0; i < len; i++) {
        var obj = this._objs[j]
        
        if(obj.coll.entity.x + obj.coll.x - obj.coll.width/2 > this.xCam + this._canvas.width/this._scaleCam
            || obj.coll.entity.x + obj.coll.x + obj.coll.width/2 < this.xCam - this._canvas.width/this._scaleCam
            || obj.coll.entity.y + obj.coll.y - obj.coll.height/2 > this.yCam + this._canvas.height/this._scaleCam
            || obj.coll.entity.y + obj.coll.y + obj.coll.height/2 < this.yCam - this._canvas.height/this._scaleCam) {
            obj.coll.show = false
            this._objs.splice(j, 1)
        } else {
            j++
        }
    }

    var query = this._world.queryRect(
        this.xCam - this._canvas.width/(this._scaleCam*2),
        this.xCam + this._canvas.width/(this._scaleCam*2),
        this.yCam - this._canvas.height/(this._scaleCam*2),
        this.yCam + this._canvas.height/(this._scaleCam*2)
    )

    for(let b of query) {
        if(!b.show) {
            var obj
            if(b.type == "rect") {
                obj = this._createSquare(b)
            } else {
                obj = this._createLine(b)
            }
            obj.coll.show = true
            this._objs.push(obj)
        }
    }

    // -- DRAW SQUARES OR LINES
    for(let obj of this._objs) {
        // position model
        mat4.translate(this._modelMat, camMatrix, [obj.coll.x + obj.coll.entity.x, obj.coll.y + obj.coll.entity.y, 0])

        if(obj.type == "square") {
            // set the vertex buffer to be drawn
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, obj.buffer);

            // connect up the shader parameters: vertex position and projection/model matrices
            this._gl.vertexAttribPointer(this._shaders.vertexPosAttribute, obj.vertSize, this._gl.FLOAT, false, 0, 0);
            this._gl.uniformMatrix4fv(this._shaders.projMatUniform, false, this._projMat);
            this._gl.uniformMatrix4fv(this._shaders.modelMatUniform, false, this._modelMat);

            var c = vec4.create()
            vec4.set(c, 0, 0.7, 0, 1)
            this._gl.uniform4fv(this._shaders.uColorUniform, c)

            // draw the object
            this._gl.drawArrays(this._gl.TRIANGLE_FAN, 0, obj.nVerts);

            var c = vec4.create()
            vec4.set(c, 0.5, 0.9, 0.5, 1)
            this._gl.uniform4fv(this._shaders.uColorUniform, c)

            this._gl.drawArrays(this._gl.LINE_LOOP, 0, obj.nVerts);
        } else {
            // draw main line
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, obj.buffer);

            // connect up the shader parameters: vertex position and projection/model matrices
            this._gl.vertexAttribPointer(this._shaders.vertexPosAttribute, obj.vertSize, this._gl.FLOAT, false, 0, 0);
            this._gl.uniformMatrix4fv(this._shaders.projMatUniform, false, this._projMat);
            this._gl.uniformMatrix4fv(this._shaders.modelMatUniform, false, this._modelMat);

            var c = vec4.create()
            vec4.set(c, 0, 0.7, 0, 1)
            this._gl.uniform4fv(this._shaders.uColorUniform, c)

            this._gl.drawArrays(this._gl.LINES, 0, obj.nVerts);

            // draw indication line
            if(!obj.coll._twoway) {
                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, obj.obuffer);

                // connect up the shader parameters: vertex position and projection/model matrices
                this._gl.vertexAttribPointer(this._shaders.vertexPosAttribute, obj.vertSize, this._gl.FLOAT, false, 0, 0);
                this._gl.uniformMatrix4fv(this._shaders.projMatUniform, false, this._projMat);
                this._gl.uniformMatrix4fv(this._shaders.modelMatUniform, false, this._modelMat);

                var c = vec4.create()
                vec4.set(c, 0.7, 0, 0, 1)
                this._gl.uniform4fv(this._shaders.uColorUniform, c)

                this._gl.drawArrays(this._gl.LINES, 0, obj.nVerts);
            }
        }
    }
}

Display.prototype._loop = function(time) { 
    if(this._run) {
        if(!this._current) {
            this._current = time
        } else {
            var delta = (time - this._current)/1000
            this._current = time
            this._world.simulate(delta * this.speed)
            if(this.loop != null) {
                this.loop(this._world, this, delta)
            }
        }
        this._draw()

        requestAnimationFrame(this._loop.bind(this))
    }
}

Display.prototype.start = function() {
    this._run = true
    if(this.init) {
        this.init(this._world, this)
        this.init = null
    }
    this._draw()

    requestAnimationFrame(this._loop.bind(this))
}
Display.prototype.stop = function() {
    this._run = false
    this._current = null
}
Display.prototype.next = function() {
    if(!this._run) {
        this._world.simulate(0.016 * this.speed)
        this._draw()
    }
}

Object.defineProperty(Display.prototype, "scaleCam", {
    get: function scaleCam() {
        return this._scaleCam
    },
    set: function scaleCam(val) {
        this._scaleCam = val
        mat4.ortho(this._projMat, 
                  -this._canvas.width/(2 * this._scaleCam) , this._canvas.width/(2 * this._scaleCam), 
                  -this._canvas.height/(2 * this._scaleCam), this._canvas.height/(2 * this._scaleCam), 0.1, 100)
    }
})
