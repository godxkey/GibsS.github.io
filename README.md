# GibsS.github.io
my js experiments + whatever

## Human Ant Farm

My current project.

Human Ant Farm is a simulation game where the player can create a 2d world in which he can observe humans moving around, surviving, creating buildings and making social bonds.

The project is quite a big undertaking so I decided to split it in a few sub-projets.

### [World generation](https://gibss.github.io/test/hat/world-gen)

Before actually running the simulation, human ant farm allows the user to play around with different world generation algorithms to find the world the player wants to see. In this sub-project I implement both the different world generation algorithms of the game and the liquid logic.

## Experiments

### [Gridlike testbed](https://gibss.github.io/test/gridlike)

A simple web page that showcases my physics engine: gridlike. Its a typescript library with a focus on being very simple to bootstrap and use to make web 2D platformers and terraria-likes.

Checkout the different scripts and follow the instructions, you'll quickly get a sense of the scope of the library.

[github page](https://github.com/GibsS/gridlike)

### [Gridlike-Unity demo](https://gibss.github.io/test/gridlike-unity/Gridship3/)

A demo of the unity version of gridlike. There is a small (see tiny) amount of gameplay but this showcases a few of the things you can do with gridlike.

Just like its typescript counterpart above, the library serves as foundation to make terraria likes, 2D platformers with a focus on destructible (or buildable) tile based terrain.

[github page](https://github.com/GibsS/gridlike-Unity)

### [Space battle v2](http://space-battle-v2.herokuapp.com/#/board)

An improved prototype for a digital TCG. The players create their own fleet of space ships and fight in a simultaneous-turn-based game.

### [Cannon automaton - Lazer prototype](https://gibss.github.io/test/cannon-automaton/lazer-prototype)

A mechanic i'd like to include in a game: A system that allows player's to create automatic contraptions using lazers in a 2D plane. This demo only showcases placing lazers and moving them around. An actual game using this mechanic would have "actors" and "sensors". Actors receive lazers and react in consequence while sensors react to the environment and produce lazers. 

### [Hexagon world generation](https://gibss.github.io/test/RAE-world-generation)

A web page that showcases a procedural generation library that creates top down hex world maps.

### [Modified bush test](https://gibss.github.io/test/rbush)

A test of a modified version of the [rbush library](https://github.com/mourner/rbush). My version very simply adds movements of the rectangles.

### [Rect collider test](https://gibss.github.io/test/rectCollider/)

A test of RectCollider, a physics library focused on exact collision (no object penetration) and allowing the creation of a "hierarchy of weights", defining who can affect who's trajectory simply.

The library is still at a very experimental stage and requires the handling of a few edge cases. However, it can still be tested and used as is.

### [Space vagrant - space battle](https://space-vagrant-prototype.herokuapp.com/#/board)

The predecessor to the space battle game above.

A digital 'card game' with mechanics inspired from FTL. Each player own a set
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
