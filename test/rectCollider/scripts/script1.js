var goLeft = 0, goRight = 0, jump = false

var shipLeft = 0, shipRight = 0, shipTop = 0, shipBot = 0

testbed(
// INIT
function(world, display) {
    world.ground = world.createEntity(0, 0, 0, "ground")
    world.ground.addRect(0, 0, 10, 0.5, 1, 1)
    world.ground.addRect(4.5, 0.75, 1, 1, 1, 1)
    world.ground.addLeftLine(-3, 2, 2, true, 1, 1)

    world.char = world.createRect(0, 3, 2, "char", 1, 1)

    world.ship = world.createRect(-10, 2, 1, "ship", 3, 0.2)
    world.ship.addRect(1.5, 1, 1, 1, 1, 1)

    world.boxes = []

    display.xCam = world.char.x
    display.yCam = world.char.y
},
// LOOP
function(world, display, timedelta) {
    // char movement
    if(world.char.higherBotContact || world.char.hasBotContact) {
        world.char.relvx = 6 * (goRight - goLeft)
        if(jump) {
            world.char.addImpulse(0, 10)
        }
    } else {
        world.char.addForce(10 * (goRight - goLeft), 0)
    }
    if(world.char.higherBotContact) {
        world.char.setParent(world.char.higherBotContact.otherBody._entity, 0)
    } else {
        world.char.unParent()
    }
    jump = false

    world.char.relvy -= 10 * timedelta

    // ship
    world.ship.addForce(10 * (shipRight - shipLeft), 10 * (shipTop - shipBot))

    // boxes
    for(var i = 0; i < world.boxes.length; i++) {
        world.boxes[i].relvx = 0
        world.boxes[i].relvy = 0
    }

    // position camera on character
    display.xCam = world.char.x
    display.yCam = world.char.y
},
// KEYPRESS
function(world, display, key) {

},
// KEYDOWN
function(world, display, key) {
    if(key == "q") { goLeft = 1 } 
    if(key == "d") { goRight = 1 }
    if(key == "z") { console.log("jump"); jump = true }
    if(key == "s") { 
        if(!display._run) { display.start() } else { display.stop() }
    }
    if(key == "i") { shipTop = 1 } 
    if(key == "j") { shipLeft = 1 } 
    if(key == "k") { shipBot = 1 } 
    if(key == "l") { shipRight = 1 } 
},
// KEYUP
function(world, display, key) {
    if(key == "q") { goLeft = 0 } 
    if(key == "d") { goRight = 0 }

    if(key == "i") { shipTop = 0 } 
    if(key == "j") { shipLeft = 0 } 
    if(key == "k") { shipBot = 0 } 
    if(key == "l") { shipRight = 0 } 
}
)
