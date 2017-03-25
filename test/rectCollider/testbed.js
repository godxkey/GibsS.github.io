window.testbed = function(init, loop, keypress, keydown, keyup) {
    var world = RectCollider.createWorld()
        
    var canvas = document.getElementById("canvas"),
        log = document.getElementById("log"),
        nextBtn = document.getElementById("next"),
        clearBtn = document.getElementById("clear"),
        pauseBtn = document.getElementById("pause"),
        playBtn = document.getElementById("play"),
        it = document.getElementById("it"),
        speed = document.getElementById("speed"),
        write = document.getElementById("write")

    // -- SIMULATION
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    var display = new Display(world, canvas)
    display.init = init
    display.loop = loop

    display.xCam = 0
    display.yCam = 0
    display.scaleCam = 40
    display.speed = 1
    display.start()
    display.stop()

    document.addEventListener('keypress', (event) => { keypress(world, display, event.key) })
    document.addEventListener('keydown', (event) => { keydown(world, display, event.key) })
    document.addEventListener('keyup', (event) => { keyup(world, display, event.key) })

    // -- DEBUG
    nextBtn.onclick = function() { display.next() }
    pauseBtn.onclick = function() { display.stop() }
    playBtn.onclick = function() { display.start() }
    clearBtn.onclick = function() { }
    write.onclick = function() {
        var res = ""
        for(let sim of world.sims) {
            res += "time: " + sim.start + " " + sim.nb + "<br>"
            for(let simlevel of sim.levels) {
                for(let narrow of simlevel.narrowphases) {
                    if(narrow.rect1 == "rect1" || narrow.rect1 == "rect1") {
                        res += "rect1: " + narrow.rect1 + " rect2: " + narrow.rect2 + " toix: " + narrow.toix + " toiy: " + narrow.toiy + "<br>"
                    }
                }
            }
        }
        log.innerHTML = res
    }
}