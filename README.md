# GibsS.github.io

My Unity and js experiments, games + whatever

# Game prototypes

Lovely little one month/one week-end long prototype of games and game mechanics I wanted to explore.

### [Goo ship](https://gibss.github.io/test/goo-ship/Prototype)

FTL meets worms: The player controls a ship in a 2D-platformer environment and uses its different systems (weapons, augmentations..) to defeat every encounters. The worms bit is that both ships and the world is destructible just like worms.

You will want to play this in fullscreen (just click the arrows in the bottom right).

### [Grapple demo](https://gibss.github.io/test/grapple-world/index.html)

A prototype for the first level of a super meat boy, celeste, vvvvv like 2d platformer. The player moves through space using a grappling hook.

### [Space battle v2](http://space-battle-v2.herokuapp.com/#/board)

A prototype for a digital TCG. The players create their own fleet of space ships and fight in a simultaneous-turn-based game (player define there moves and reveal them to other player at the same time).

### [Cannon automaton - Lazer prototype](https://gibss.github.io/test/cannon-automaton/lazer-prototype)

A mechanic i'd like to include in a game: A system that allows player's to create automatic contraptions using lazers in a 2D plane. This demo only showcases placing lazers and moving them around. An actual game using this mechanic would have "actors" and "sensors". Actors receive lazers and react in consequence while sensors react to the environment and produce lazers. 

---

# Gridlike

When looking at 2D physics engines made for the js, I felt like it was always painful to right wrapper code around the physics library in order to do very simple things like create a controllable character, have him stay still on moving platforms..

So I made Gridlike: A physics engine designed for creating 2d voxel games and designed to make character implementation extremely quick.

### [Gridlike testbed](https://gibss.github.io/test/gridlike)

This is the web version of gridlike, coded in typescript (compiled to js).

Checkout the different scripts and follow the instructions, you'll quickly get a sense of the scope of the library.

[github page](https://github.com/GibsS/gridlike)

[npm page](https://www.npmjs.com/package/grid-like)

### [Gridlike-Unity demo](https://gibss.github.io/test/gridlike-unity/Gridship3/)

A demo of the unity version of gridlike. There is a small (see tiny) amount of gameplay but this showcases a few of the things you can do with gridlike.

Just like its typescript counterpart above, the library serves as foundation to make terraria likes, 2D platformers with a focus on destructible (and buildable) tile based terrain.

[github page](https://github.com/GibsS/gridlike-Unity)

---

# Human Ant Farm

Human Ant Farm (formerly HAT) was a simulation game I wanted to make where the player can create a 2d world in which he can observe humans moving around, surviving, creating buildings and making social bonds.

The project was a bit too big of an undertaking so I only managed to develop a few parts of the project (world generation, liquid simulation, AI pathfinding for a 2D platformer..). You can find the world gen, the AI and the liquid simulation below.

### [World generation](https://gibss.github.io/test/hat/world-gen)

Experimenting with procedural generation algorithm to generate the world and cellular automata to simulate liquids.

### [AI Tests](https://gibss.github.io/test/hat/ai)

I developped a pathfinding algorithm for 2D platformer characters. The AI handles going to a given location, building/mining blocks using a 'blueprint' and shooting a weapon using information about the projectile (gravity, initial speed..).

The link shows a series of test I made to avoid regression when improving the pathfinder. In each scenario, the character is given a simple task to achieve.

### [Prototype](https://gibss.github.io/test/hat/prototype)

This is a simplified version of the prototype of the actual game I was working on. You can play around with giving orders to the humans and seeing them execute those tasks.

The end goal was to allow them to make their decisions and solve quite complicated problems like choosing the architecture for their villages, distributing property, making sure to eat etc.. I got so far as have them eat and sleep in caves but I realised it was a bit too ambitious/way too long to try and make a full game where AI can build entire villages by themselves.

--- 

# Experiments

### [Hexagon world generation](https://gibss.github.io/test/RAE-world-generation)

A web page that showcases a procedural generation library that creates top down hex world maps.

### [Modified bush test](https://gibss.github.io/test/rbush)

A test of a modified version of the [rbush library](https://github.com/mourner/rbush). My version very simply adds movements of the rectangles.

### [Rect collider test](https://gibss.github.io/test/rectCollider/)

A test of RectCollider, a physics library focused on exact collision (no object penetration) and allowing the creation of a "hierarchy of weights", defining who can affect who's trajectory simply.

The library is still at a very experimental stage and requires the handling of a few edge cases. However, it can still be tested and used as is.

### [Space vagrant - space battle](https://space-vagrant-prototype.herokuapp.com/#/board)

The predecessor to the space battle game above.

A TCG with mechanics inspired from FTL. Each player own a set
of ships with unique sets of 'systems' and must choose which of them to use to
take down the enemy ships. The game is heavily centered around a 'hiding'
mechanic which prevents players from knowing what their adversary own, adding a
mind game element.

This is a simple web based prototype to test out the core mechanics and try to
find a right balance for future iterations.

### [Pet bot client](https://gibss.github.io/test/pet-bot-client/)

[The server is down]
A client for an online chat bot of my making. The bot is build using a trained sequence to sequence machine learning model. Have a go at it!
Might require cloning the repository and running it locally as their might be CORS issues.
