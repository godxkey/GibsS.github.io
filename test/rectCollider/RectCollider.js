(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var world = require("./world");
__export(require("./world"));
function createWorld() {
    return new world.World();
}
exports.createWorld = createWorld;
if (window != null) {
    window.RectCollider = {
        createWorld: createWorld
    };
}
},{"./world":5}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var vb = require("./vbh");
exports.AABB_SKIN = 0.2;
var Entity = (function () {
    function Entity(world, x, y, level, name, childCount) {
        this._world = world;
        this._enabled = true;
        this.name = name;
        this._level = level;
        this._mass = 0;
        this.fixMass = false;
        this._x = x;
        this._y = y;
        this._parent = null;
        this.relvx = 0;
        this.relvy = 0;
        this.ax = 0;
        this.ay = 0;
        this.leftContacts = [];
        this.topContacts = [];
        this.botContacts = [];
        this.rightContacts = [];
        this._potContact = [];
        this._slideOff = [];
        this._tmpnocoll = [];
    }
    Object.defineProperty(Entity.prototype, "world", {
        get: function () { return this._world; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "enabled", {
        get: function () { return this._enabled; },
        set: function (val) {
            this._enabled = val;
            if (val) {
                this.forallTopBody(function (b) {
                    if (b._enabled == 0) {
                        b._enabled = 1;
                    }
                    else if (b._enabled == 2) {
                        b._enabled = 3;
                    }
                });
            }
            else {
                this.forallTopBody(function (b) {
                    if (b._enabled == 1) {
                        b._enabled = 0;
                    }
                    else if (b._enabled == 3) {
                        b._enabled = 2;
                    }
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "present", {
        get: function () { return this._present; },
        set: function (val) {
            if (val) {
                if (!this._present) {
                }
            }
            else {
                if (this._present) {
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "parent", {
        get: function () { return this._parent; },
        set: function (val) {
            if (this._parent && val != this._parent) {
                this.unParent();
            }
            if (val) {
                this.setParent(val, this._parentType);
            }
        },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.setParent = function (ent, type) {
        if (this._parent) {
            this.unParent();
        }
        this._parent = ent;
        this._parentType = type;
        this.relvx -= ent._vx;
        this.relvy -= ent._vy;
        if (!ent._childs) {
            ent._childs = new vb.SimpleVBH();
        }
        ent._childs.insert(this);
        if (type == 2) {
            this._x -= ent.globalX;
            this._y -= ent.globalY;
            var top_1 = this, x_1 = 0, y_1 = 0;
            while (top_1._parent && top_1._parentType == 2) {
                x_1 += top_1._x;
                y_1 += top_1._y;
                top_1 = top_1._parent;
            }
            if (!top_1._allBodyChilds) {
                top_1._allBodyChilds = new vb.SimpleVBH();
                if (!top_1._bodyChilds) {
                    if (top_1._bodyChilds instanceof Body) {
                        top_1._allBodyChilds.insert(top_1._bodyChilds);
                    }
                    else {
                        top_1._bodyChilds.forall(function (b) {
                            top_1._allBodyChilds.insert(b);
                        });
                    }
                }
            }
            this.forallTopBody(function (b) {
                b._x += x_1;
                b._y += y_1;
                top_1._allBodyChilds.insert(b);
            });
            if (this._allBodyChilds) {
                this._allBodyChilds.clear();
                this._allBodyChilds = null;
            }
            this._world.vbh.remove(this);
            this._world.ents[this._level].splice(this._world.ents[this._level].indexOf(this), 1);
        }
        else if (type == 1) {
            this._world.ents[this._level].splice(this._world.ents[this._level].indexOf(this), 1);
            this._level = ent._level;
            this._world.ents[this._level].push(this);
        }
    };
    Entity.prototype.unParent = function () {
        var _this = this;
        if (this._parent) {
            if (this._parentType == 2) {
                this._x += this._parent.globalX;
                this._y += this._parent.globalY;
                this.relvx = this._parent._vx;
                this.relvy = this._parent._vy;
            }
            else {
                this.relvx += this._parent._vx;
                this.relvy += this._parent._vy;
            }
            this._parent._childs.remove(this);
            if (this._parentType == 2) {
                var top_2 = this, x_2 = 0, y_2 = 0;
                while (top_2._parent && top_2._parentType == 2) {
                    x_2 += top_2._x;
                    y_2 += top_2._y;
                    top_2 = top_2._parent;
                }
                var staticParent_1 = false;
                this._childs.forall(function (e) {
                    staticParent_1 = staticParent_1 || e._parentType == 2;
                });
                if (staticParent_1) {
                    this._allBodyChilds = new vb.SimpleVBH();
                    var current = this, openset_1 = [];
                    while (current) {
                        if (current._bodyChilds instanceof Body) {
                            current._bodyChilds._x -= x_2;
                            current._bodyChilds._y -= y_2;
                            top_2._allBodyChilds.remove(current._bodyChilds);
                            this._allBodyChilds.insert(current._bodyChilds);
                        }
                        else {
                            current._bodyChilds.forall(function (b) {
                                b._x -= x_2;
                                b._y -= y_2;
                                top_2._allBodyChilds.remove(b);
                                _this._allBodyChilds.insert(b);
                            });
                        }
                        if (current._childs) {
                            current._childs.forall(function (e) {
                                if (e._parentType == 2) {
                                    openset_1.push(e);
                                }
                            });
                        }
                        current = openset_1.pop();
                    }
                }
            }
            this._parent = null;
        }
    };
    Entity.prototype.addRect = function (x, y, width, height, mass, density) {
        return new Rect(this, x, y, width, height, mass, density);
    };
    Entity.prototype.addLeftLine = function (x, y, size, oneway, mass, density) {
        return new VertLine(this, x, y, size, oneway, mass, density, false);
    };
    Entity.prototype.addRightLine = function (x, y, size, oneway, mass, density) {
        return new VertLine(this, x, y, size, oneway, mass, density, true);
    };
    Entity.prototype.addTopLine = function (x, y, size, oneway, mass, density) {
        return new HorLine(this, x, y, size, oneway, mass, density, false);
    };
    Entity.prototype.addBotLine = function (x, y, size, oneway, mass, density) {
        return new HorLine(this, x, y, size, oneway, mass, density, true);
    };
    Entity.prototype.addBody = function (body, x, y) {
        if (body._entity) {
            body._entity.removeBody(body);
        }
        body._entity = this;
        if (x != null) {
            body._x = x;
        }
        if (y != null) {
            body._y = y;
        }
        if (!this._bodyChilds) {
            this._bodyChilds = body;
        }
        else if (this._bodyChilds instanceof Body) {
            var b = this._bodyChilds;
            this._bodyChilds = new vb.SimpleVBH();
            this._bodyChilds.insert(b);
            this._bodyChilds.insert(body);
        }
        else {
            this._bodyChilds.insert(body);
        }
        var top = this, relx = body._x, rely = body._y;
        while (top._parent && top._parentType == 2) {
            relx += top._x;
            rely += top._y;
            top = top._parent;
        }
        if (top._allBodyChilds) {
            top._allBodyChilds.insert(body);
        }
        body._x = relx;
        body._y = rely;
        if (this._enabled) {
            if (body._enabled == 0) {
                body._enabled = 1;
            }
            else if (body._enabled == 2) {
                body._enabled = 3;
            }
        }
        else {
            if (body._enabled == 1) {
                body._enabled = 0;
            }
            else if (body._enabled == 3) {
                body._enabled = 2;
            }
        }
        if (!this.fixMass) {
            if (this._mass) {
                this._mass += body._mass;
            }
            else {
                this._mass = body._mass;
            }
        }
        top.minx = Math.min(top.minx, relx + body._x - body.width / 2);
        top.maxx = Math.min(top.maxx, relx + body._x + body.width / 2);
        top.miny = Math.min(top.miny, rely + body._y - body.height / 2);
        top.maxy = Math.min(top.maxy, rely + body._y + body.height / 2);
    };
    Entity.prototype.removeBody = function (body) {
        if (this._bodyChilds instanceof Body) {
            this._bodyChilds = null;
        }
        else {
            this._bodyChilds.remove(body);
        }
        var top = this, x = body._x, y = body._y;
        while (top._parent && top._parentType == 2) {
            top = top._parent;
            x -= top._x;
            y -= top._y;
        }
        var list;
        if (top._allBodyChilds) {
            top._allBodyChilds.remove(body);
            list = top._allBodyChilds;
        }
        else if (top._bodyChilds) {
            list = top._bodyChilds;
        }
        if (list) {
            if (top.minx == body._x - body.width / 2) {
                top.minx = 100000;
                list.forall(function (b) { top.minx = Math.min(top.minx, b._x - b.width / 2); });
            }
            if (top.maxx == body._x + body.width / 2) {
                top.maxx = -100000;
                list.forall(function (b) { top.maxx = Math.max(top.maxx, b._x + b.width / 2); });
            }
            if (top.miny == body._y - body.height / 2) {
                top.miny = 100000;
                list.forall(function (b) { top.miny = Math.min(top.miny, b._y - b.height / 2); });
            }
            if (top.maxx == body._y + body.height / 2) {
                top.maxx = -100000;
                list.forall(function (b) { top.maxx = Math.max(top.maxx, b._y + b.height / 2); });
            }
        }
        body._x = top._x + x;
        body._y = top._y + y;
        body._entity = null;
    };
    Entity.prototype.forallTopBody = function (func) {
        if (this._allBodyChilds) {
            this._allBodyChilds.forall(func);
        }
        else {
            if (this._bodyChilds instanceof Body) {
                func(this._bodyChilds);
            }
            else {
                this._bodyChilds.forall(func);
            }
        }
    };
    Object.defineProperty(Entity.prototype, "level", {
        get: function () { return this._level; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "mass", {
        get: function () { return this._mass; },
        set: function (val) {
            this._mass = val;
            this.fixMass = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "x", {
        get: function () { return this._x; },
        set: function (val) { this._x = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "y", {
        get: function () { return this._y; },
        set: function (val) { this._y = val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "globalX", {
        get: function () { return this._x + (this._parent ? this._parent.globalX : 0); },
        set: function (val) { this._x = val - (this._parent ? this._parent.globalX : 0); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "globalY", {
        get: function () { return this._y + (this._parent ? this._parent.globalY : 0); },
        set: function (val) { this._y = val - (this._parent ? this._parent.globalY : 0); },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.setPosition = function (x, y) {
        this._x = x;
        this._y = y;
    };
    Object.defineProperty(Entity.prototype, "vx", {
        get: function () { return this._vx; },
        set: function (val) { this.relvx = this._parent ? val - this._parent._vx : val; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "vy", {
        get: function () { return this._vy; },
        set: function (val) { this.relvy = this._parent ? val - this._parent._vy : val; },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.addForce = function (fx, fy) {
        if (this.mass) {
            this.ax += fx / this.mass;
            this.ay += fy / this.mass;
        }
    };
    Entity.prototype.addImpulse = function (ix, iy) {
        if (this._mass) {
            this.relvx += ix / this._mass;
            this.relvy += iy / this._mass;
        }
    };
    Object.defineProperty(Entity.prototype, "hasLeft", {
        get: function () { return this.leftContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasTop", {
        get: function () { return this.topContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasBot", {
        get: function () { return this.botContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasRight", {
        get: function () { return this.rightContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasHighLeft", {
        get: function () { return this.higherLeftContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasHighTop", {
        get: function () { return this.higherTopContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasHighBot", {
        get: function () { return this.higherBotContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasHighRight", {
        get: function () { return this.higherRightContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasAnyLeft", {
        get: function () { return this.higherLeftContact != null || this.leftContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasAnyTop", {
        get: function () { return this.higherTopContact != null || this.topContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasAnyBot", {
        get: function () { return this.higherBotContact != null || this.botContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "hasAnyRight", {
        get: function () { return this.higherRightContact != null || this.rightContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "moveMinx", {
        get: function () { return this._x + this.minx - Math.abs(this._vx / 2) - exports.AABB_SKIN; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "moveMaxx", {
        get: function () { return this._x + this.maxx + Math.abs(this._vx / 2) + exports.AABB_SKIN; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "moveMiny", {
        get: function () { return this._y + this.miny - Math.abs(this._vy / 2) - exports.AABB_SKIN; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "moveMaxy", {
        get: function () { return this._y + this.maxy - Math.abs(this._vy / 2) + exports.AABB_SKIN; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "width", {
        get: function () { return this.maxx - this.minx; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "height", {
        get: function () { return this.maxy - this.miny; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "_layer", {
        get: function () { return -1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "_layergroup", {
        get: function () { return -1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "leftCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "rightCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "topCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "botCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    return Entity;
}());
exports.Entity = Entity;
var Body = (function () {
    function Body(ent, x, y, mass, density) {
        this._x = x;
        this._y = y;
        if (density <= 0) {
            this._mass = mass;
            this._density = -1;
        }
        else {
            this._density = density;
        }
        this._layer = 0;
        this.layerGroup = 0;
        this._enabled = 3;
        this.leftContacts = [];
        this.topContacts = [];
        this.botContacts = [];
        this.rightContacts = [];
    }
    Object.defineProperty(Body.prototype, "x", {
        get: function () { return this._x; },
        set: function (val) {
            this._x = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "y", {
        get: function () { return this._y; },
        set: function (val) {
            this._y = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "entity", {
        get: function () { return this._entity; },
        set: function (val) {
            if (!this._entity && val != this._entity) {
                this._entity.removeBody(this);
            }
            if (val) {
                val.addBody(this);
                if (val.enabled) {
                    if (this._enabled == 0) {
                        this._enabled = 1;
                    }
                    else if (this._enabled == 2) {
                        this._enabled = 3;
                    }
                }
                else {
                    if (this._enabled == 1) {
                        this._enabled = 0;
                    }
                    else if (this._enabled == 3) {
                        this._enabled = 2;
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "world", {
        get: function () { return this._entity._world; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "mass", {
        get: function () { return this._mass; },
        set: function (val) {
            this._density = -1;
            if (this.entity) {
                this.entity._mass += val - this._mass;
            }
            this._mass = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "isSensor", {
        get: function () { return this._isSensor; },
        set: function (val) {
            this._isSensor = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "layer", {
        get: function () { return this.entity.world.layerNames[this._layer]; },
        set: function (val) {
            if (!this.entity.world.layerIds[val]) {
                this.entity.world.addLayer(val);
            }
            this._layer = this.entity.world.layerIds[val];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "layerGroup", {
        get: function () { return this._layergroup; },
        set: function (val) {
            this._layergroup = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "enabled", {
        get: function () { return this._enabled >= 2; },
        set: function (val) {
            if (val) {
                if (this._enabled == 0) {
                    this._enabled = 2;
                }
                else if (this._enabled == 1) {
                    this._enabled = 3;
                }
                if (!this._entity.fixMass) {
                    if (!this._entity._mass) {
                        this._entity._mass = this._mass;
                    }
                    else {
                        this._entity._mass += this._mass;
                    }
                }
            }
            else {
                if (this._enabled == 2) {
                    this._enabled = 0;
                }
                else if (this._enabled == 3) {
                    this._enabled = 1;
                }
                if (!this._entity.fixMass) {
                    if (this._entity._mass) {
                        this._entity._mass -= this._mass;
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "physical", {
        get: function () { return this._enabled == 3; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasLeft", {
        get: function () { return this.leftContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasTop", {
        get: function () { return this.topContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasBot", {
        get: function () { return this.botContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasRight", {
        get: function () { return this.rightContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasHighLeft", {
        get: function () { return this.higherLeftContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasHighTop", {
        get: function () { return this.higherTopContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasHighBot", {
        get: function () { return this.higherBotContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasHighRight", {
        get: function () { return this.higherRightContact != null; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasAnyLeft", {
        get: function () { return this.higherLeftContact != null || this.leftContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasAnyTop", {
        get: function () { return this.higherTopContact != null || this.topContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasAnyBot", {
        get: function () { return this.higherBotContact != null || this.botContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "hasAnyRight", {
        get: function () { return this.higherRightContact != null || this.rightContacts.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "minx", {
        get: function () { return this._x - this.width / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "maxx", {
        get: function () { return this._x + this.height / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "miny", {
        get: function () { return this._y - this.width / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Body.prototype, "maxy", {
        get: function () { return this._y + this.height / 2; },
        enumerable: true,
        configurable: true
    });
    return Body;
}());
exports.Body = Body;
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(ent, x, y, size, oneway, mass, density) {
        var _this = _super.call(this, ent, x, y, mass, density) || this;
        _this._size = size;
        _this._twoway = !oneway;
        if (_this._density != -1) {
            _this._mass = _this._density * size;
        }
        if (ent) {
            ent.addBody(_this);
        }
        return _this;
    }
    Object.defineProperty(Line.prototype, "type", {
        get: function () { return "line"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "size", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "density", {
        get: function () { return this._density; },
        set: function (val) {
            this._density = val;
            var newMass = this._size * val;
            if (this.entity) {
                this.entity._mass += newMass - this._mass;
            }
            this._mass = newMass;
        },
        enumerable: true,
        configurable: true
    });
    return Line;
}(Body));
var VertLine = (function (_super) {
    __extends(VertLine, _super);
    function VertLine(ent, x, y, size, oneway, mass, density, dir) {
        var _this = _super.call(this, ent, x, y, size, oneway, mass, density) || this;
        _this._dir = dir ? 2 : 0;
        return _this;
    }
    Object.defineProperty(VertLine.prototype, "width", {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "height", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "minx", {
        get: function () { return this._x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "maxx", {
        get: function () { return this._x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "miny", {
        get: function () { return this._y - this._size / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "maxy", {
        get: function () { return this._y + this._size / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "leftCollide", {
        get: function () { return this._twoway || this._dir == 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "rightCollide", {
        get: function () { return this._twoway || this._dir == 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "botCollide", {
        get: function () { return this._twoway; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertLine.prototype, "topCollide", {
        get: function () { return this._twoway; },
        enumerable: true,
        configurable: true
    });
    return VertLine;
}(Line));
var HorLine = (function (_super) {
    __extends(HorLine, _super);
    function HorLine(ent, x, y, size, oneway, mass, density, dir) {
        var _this = _super.call(this, ent, x, y, size, oneway, mass, density) || this;
        _this._dir = dir ? 3 : 1;
        return _this;
    }
    Object.defineProperty(HorLine.prototype, "width", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "height", {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "minx", {
        get: function () { return this._x - this._size / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "maxx", {
        get: function () { return this._x + this._size / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "miny", {
        get: function () { return this._y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "maxy", {
        get: function () { return this._y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "leftCollide", {
        get: function () { return this._twoway; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "rightCollide", {
        get: function () { return this._twoway; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "botCollide", {
        get: function () { return this._twoway || this._dir == 3; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HorLine.prototype, "topCollide", {
        get: function () { return this._twoway || this._dir == 1; },
        enumerable: true,
        configurable: true
    });
    return HorLine;
}(Line));
var Rect = (function (_super) {
    __extends(Rect, _super);
    function Rect(ent, x, y, width, height, mass, density) {
        var _this = _super.call(this, ent, x, y, mass, density) || this;
        _this._width = width;
        _this._height = height;
        if (_this._density != -1) {
            _this._mass = _this._density * width * height;
        }
        if (ent) {
            ent.addBody(_this);
        }
        return _this;
    }
    Object.defineProperty(Rect.prototype, "type", {
        get: function () { return "rect"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "width", {
        get: function () { return this._width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "height", {
        get: function () { return this._height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "minx", {
        get: function () { return this._x - this._width / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "maxx", {
        get: function () { return this._x + this._width / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "miny", {
        get: function () { return this._y - this._height / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "maxy", {
        get: function () { return this._y + this._height / 2; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "leftCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "rightCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "botCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topCollide", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "density", {
        get: function () { return this._density; },
        set: function (val) {
            this._density = val;
            var newMass = this._width * this._height * val;
            if (this.entity) {
                this.entity._mass += newMass - this._mass;
            }
            this._mass = newMass;
        },
        enumerable: true,
        configurable: true
    });
    return Rect;
}(Body));
},{"./vbh":4}],3:[function(require,module,exports){
"use strict";
function isBodyInCircle(e, x, y, r) {
    var tx = e._x - x, ty = e._y - y, rx = 10000, ry = 10000;
    if (e._x != x) {
        rx = e.width / Math.abs(tx);
    }
    if (e._y != y) {
        ry = e.height / Math.abs(ty);
    }
    if (rx < ry) {
        return r + (rx - 1) * Math.sqrt(tx * tx + ty * ty) >= 0;
    }
    else {
        return r + (ry - 1) * Math.sqrt(tx * tx + ty * ty) >= 0;
    }
}
exports.isBodyInCircle = isBodyInCircle;
function raycastHelper(e, d, vx, vy, x1, y1, x2, y2, res) {
    var minx = e.minx, maxx = e.maxx, miny = e.miny, maxy = e.maxy;
    if (vx > 0 && x1 <= minx && e.leftCollide) {
        var y = y1 + vy * (minx - x1) / vx, newd = (minx - x1) * (minx - x1) + (y - y1) * (y - y1);
        if (d > newd && y >= miny && y <= maxy) {
            res.body = e;
            res.side = "left";
            res.x = minx;
            res.y = y;
            res.distance = newd;
            return newd;
        }
    }
    else if (vx < 0 && x1 >= maxx && e.rightCollide) {
        var y = y1 + vy * (maxx - x1) / vx, newd = (maxx - x1) * (maxx - x1) + (y - y1) * (y - y1);
        if (d > newd && y >= miny && y <= maxy) {
            res.body = e;
            res.side = "right";
            res.x = maxx;
            res.y = y;
            res.distance = newd;
            return newd;
        }
    }
    if (vy > 0 && y1 <= miny && e.botCollide) {
        var x = x1 + vx * (miny - y1) / vy, newd = (x - x1) * (x - x1) + (miny - y1) * (miny - y1);
        if (d > newd && x >= minx && x <= maxx) {
            res.body = e;
            res.side = "bot";
            res.x = x;
            res.y = miny;
            res.distance = newd;
            return newd;
        }
    }
    else if (vy < 0 && y1 >= maxy && e.topCollide) {
        var x = x1 + vx * (maxy - y1) / vy, newd = (x - x1) * (x - x1) + (maxy - y1) * (maxy - y1);
        if (d > newd && x >= minx && x <= maxx) {
            res.body = e;
            res.side = "top";
            res.x = x;
            res.y = maxy;
            res.distance = newd;
            return newd;
        }
    }
    return d;
}
exports.raycastHelper = raycastHelper;
function raycastRectHelper(e, d, w, h, vx, vy, x1, y1, x2, y2, res) {
    var minx = e.minx, maxx = e.maxx, miny = e.miny, maxy = e.maxy;
    if (vx > 0 && x1 + w <= minx && e.leftCollide) {
        var dx = (minx - x1 - w), y = y1 + vy * dx / vx, newd = dx * dx + (y - y1) * (y - y1);
        if (d > newd && !(y - h >= maxy || y + h <= miny)) {
            res.body = e;
            res.side = "left";
            res.x = minx - w;
            res.y = y;
            res.distance = newd;
            return newd;
        }
    }
    else if (vx < 0 && x1 - w >= maxx && e.rightCollide) {
        var dx = (maxx - x1 + w), y = y1 + vy * dx / vx, newd = dx * dx + (y - y1) * (y - y1);
        if (d > newd && !(y - h >= maxy || y + h <= miny)) {
            res.body = e;
            res.side = "right";
            res.x = maxx + w;
            res.y = y;
            res.distance = newd;
            return newd;
        }
    }
    if (vy > 0 && y1 + h <= miny && e.botCollide) {
        var dy = (miny - y1 - h), x = x1 + vx * dy / vy, newd = (x - x1) * (x - x1) + dy * dy;
        if (d > newd && !(x - w >= maxx || x + w <= minx)) {
            res.body = e;
            res.side = "bot";
            res.x = x;
            res.y = miny - h;
            res.distance = newd;
            return newd;
        }
    }
    else if (vy < 0 && y1 - h >= maxy && e.topCollide) {
        var dy = (miny - y1 - h), x = x1 + vx * dy / vy, newd = (x - x1) * (x - x1) + dy * dy;
        if (d > newd && !(x - w >= maxx || x + w <= minx)) {
            res.body = e;
            res.side = "top";
            res.x = x;
            res.y = maxy + h;
            res.distance = newd;
            return newd;
        }
    }
    return d;
}
exports.raycastRectHelper = raycastRectHelper;
},{}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var math = require("./math");
function accepts(e, filter) {
    if (e.enabled) {
        if (!filter) {
            return true;
        }
        if (filter.ignored) {
            if (filter.ignored.indexOf(e) >= 0) {
                return false;
            }
        }
        if (e._layer >= 0) {
            if (filter.layer) {
                var layerid = e.world.layerIds[filter.layer];
                if ((filter.layergroup != null && e._layergroup != filter.layergroup) || e._layer != layerid) {
                    return false;
                }
            }
            if (filter.checkLayer) {
                var layerid = e.world.layerIds[filter.checkLayer], rule = e.world._getLayerRule(e._layer, layerid);
                if (filter.checkLayergroup != null) {
                    if (rule == 0x0
                        || rule == 0x2 && filter.checkLayergroup != e._layergroup
                        || rule == 0x1 && filter.checkLayergroup == e._layergroup) {
                        return false;
                    }
                }
                else {
                    if (!rule) {
                        return false;
                    }
                }
            }
        }
        if (filter.callback) {
            return filter.callback(e);
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
}
exports.accepts = accepts;
var SimpleVBH = (function () {
    function SimpleVBH() {
        this.list = [];
    }
    SimpleVBH.prototype.forall = function (func) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var body = _a[_i];
            func(body);
        }
    };
    SimpleVBH.prototype.contains = function (o) {
        return this.list.indexOf(o) >= 0;
    };
    SimpleVBH.prototype.insert = function (rect) {
        if (this.list.indexOf(rect) < 0) {
            this.list.push(rect);
        }
    };
    SimpleVBH.prototype.remove = function (rect) {
        var i = this.list.indexOf(rect);
        if (i >= 0) {
            this.list.splice(i, 1);
        }
    };
    SimpleVBH.prototype.clear = function () {
        this.list = [];
    };
    SimpleVBH.prototype.update = function () {
    };
    SimpleVBH.prototype.queryRect = function (minx, maxx, miny, maxy, filter) {
        if (this.list) {
            var len = this.list.length, res = [];
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter) && !(maxx < current.minx || current.maxx < minx || maxy < current.miny || current.maxy < miny)) {
                    res.push(current);
                }
            }
            return res;
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.queryCircle = function (x, y, radius, filter) {
        if (this.list) {
            var len = this.list.length, res = [];
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter) && math.isBodyInCircle(current, x, y, radius)) {
                    res.push(current);
                }
            }
            return res;
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.nearest = function (x, y, k, filter) {
        if (this.list) {
            var len = this.list.length, res = [], len1 = 0;
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter)) {
                    var d = (current._x - x) * (current._x - x) + (current._y - y) * (current._y - y), insert = 0;
                    while (insert < len1 && res[insert] < d) {
                        insert++;
                    }
                    if (len1 == k) {
                        if (insert != 0) {
                            res.splice(insert, 0, current);
                            res.shift();
                        }
                    }
                    else {
                        res.splice(insert, 0, current);
                        len1++;
                    }
                }
            }
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.raycast = function (x1, y1, x2, y2, filter) {
        if (this.list) {
            var len = this.list.length, res = { x: 0, y: 0, distance: 0, side: null, body: null }, d = 1000000, vx = x2 - x1, vy = y2 - y1;
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter)) {
                    d = math.raycastHelper(current, d, vx, vy, x1, y1, x2, y2, res);
                }
            }
            if (res.body) {
                return res;
            }
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.raycastAll = function (x1, y1, x2, y2, filter) {
        if (this.list) {
            var len = this.list.length, res = [], currentres = { x: 0, y: 0, distance: 0, side: null, body: null }, vx = x2 - x1, vy = y2 - y1;
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter)) {
                    math.raycastHelper(current, -1, vx, vy, x1, y1, x2, y2, currentres);
                    if (currentres.body) {
                        res.push(currentres);
                        currentres = { x: 0, y: 0, distance: 0, side: null, body: null };
                    }
                }
            }
            return res;
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.raycastRect = function (x1, y1, x2, y2, w, h, filter) {
        if (this.list) {
            var len = this.list.length, res = { x: 0, y: 0, distance: 0, side: null, body: null }, d = 1000000, vx = x2 - x1, vy = y2 - y1;
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter)) {
                    d = math.raycastRectHelper(current, d, w, h, vx, vy, x1, y1, x2, y2, res);
                }
            }
            if (res.body) {
                return res;
            }
        }
        else {
            return null;
        }
    };
    SimpleVBH.prototype.raycastRectAll = function (x1, y1, x2, y2, w, h, filter) {
        if (this.list) {
            var len = this.list.length, res = [], currentres = { x: 0, y: 0, distance: 0, side: null, body: null }, vx = x2 - x1, vy = y2 - y1;
            for (var i = 0; i < len; i++) {
                var current = this.list[i];
                if (accepts(current, filter)) {
                    math.raycastRectHelper(current, -1, w, h, vx, vy, x1, y1, x2, y2, currentres);
                    if (currentres.body) {
                        res.push(currentres);
                        currentres = { x: 0, y: 0, distance: 0, side: null, body: null };
                    }
                }
            }
            return res;
        }
        else {
            return null;
        }
    };
    return SimpleVBH;
}());
exports.SimpleVBH = SimpleVBH;
var SimpleMoveVBH = (function (_super) {
    __extends(SimpleMoveVBH, _super);
    function SimpleMoveVBH() {
        return _super.apply(this, arguments) || this;
    }
    SimpleMoveVBH.prototype.collisions = function () {
        var len = this.list.length, pairs = [];
        for (var i = 0; i < len; i++) {
            var first = this.list[i];
            if (first.enabled) {
                for (var j = i + 1; j < len; j++) {
                    var second = this.list[j];
                    if (second.enabled && !(first.moveMaxx < second.moveMinx || second.moveMaxx < first.moveMinx
                        || first.moveMaxy < second.moveMiny || second.moveMaxy < first.moveMiny)) {
                        pairs.push([first, second]);
                    }
                }
            }
        }
        return pairs;
    };
    return SimpleMoveVBH;
}(SimpleVBH));
exports.SimpleMoveVBH = SimpleMoveVBH;
},{"./math":3}],5:[function(require,module,exports){
"use strict";
var vb = require("./vbh");
var ent = require("./entity");
var math = require("./math");
var World = (function () {
    function World() {
        this.sims = [];
        this.simCount = 0;
        this.time = 0;
        this.ents = [];
        this.vbh = new vb.SimpleMoveVBH();
        this.layerIds = {};
        this.layerNames = new Array(32);
        this.layers = new Array(64);
        this.layerIds["default"] = 0;
        this.layerNames[0] = "default";
        this.layers[0] = 0xFFFFFFFF;
        this.layers[32] = 0xFFFFFFFF;
        for (var i = 1; i < 32; i++) {
            this.layers[i] = 0x3;
            this.layers[i + 32] = 0x0;
        }
    }
    World.prototype.createEntity = function (x, y, level, name, childCount) {
        var e = new ent.Entity(this, x, y, level, name, childCount != null ? childCount : 1);
        this.vbh.insert(e);
        if (!this.ents[level]) {
            this.ents[level] = [e];
        }
        else {
            this.ents[level].push(e);
        }
        return e;
    };
    World.prototype.createRect = function (x, y, level, name, width, height) {
        var e = this.createEntity(x, y, level, name, 1);
        if (name == "char") {
            e.addRect(0, 0, width, height, 1, 0);
        }
        else {
            e.addRect(0, 0, width, height, 2, 0);
        }
        return e;
    };
    World.prototype.createLeftLine = function (x, y, level, name, size, oneway) {
        var e = this.createEntity(x, y, level, name, 1);
        e.addLeftLine(0, 0, size, oneway, 1, 0);
        return e;
    };
    World.prototype.createRightLine = function (x, y, level, name, size, oneway) {
        var e = this.createEntity(x, y, level, name, 1);
        e.addRightLine(0, 0, size, oneway, 1, 0);
        return e;
    };
    World.prototype.createTopLine = function (x, y, level, name, size, oneway) {
        var e = this.createEntity(x, y, level, name, 1);
        e.addTopLine(0, 0, size, oneway, 1, 0);
        return e;
    };
    World.prototype.createBotLine = function (x, y, level, name, size, oneway) {
        var e = this.createEntity(x, y, level, name, 1);
        e.addBotLine(0, 0, size, oneway, 1, 0);
        return e;
    };
    World.prototype.addLayer = function (layer) {
        var i = 16;
        while (i < 32 && this.layerNames[i]) {
            i++;
        }
        if (i == 32) {
            console.log("[ERROR] Can't add layer: no more layers available");
        }
        else {
            this.layerNames[i] = layer;
            this.layerIds[layer] = i;
        }
    };
    World.prototype.setLayerRule = function (layer1, layer2, rule) {
        if (!this.layerIds[layer1]) {
            this.addLayer(layer1);
        }
        if (!this.layerIds[layer2]) {
            this.addLayer(layer2);
        }
        var id1 = this.layerIds[layer1], id2 = this.layerIds[layer2];
        if (id2 >= 16) {
            var add = void 0, clear = ~(3 << (2 * id2 - 16));
            switch (rule) {
                case "all":
                    add = 3 << (2 * id2 - 16);
                    break;
                case "equal":
                    add = 2 << (2 * id2 - 16);
                    break;
                case "unequal":
                    add = 1 << (2 * id2 - 16);
                    break;
                case "none":
                    add = 0;
                    break;
            }
            this.layers[id1 + 32] = ((this.layers[id1 + 32] & clear) | add);
        }
        else {
            var add = void 0, clear = ~(3 << 2 * id2);
            switch (rule) {
                case "all":
                    add = 3 << (2 * id2);
                    break;
                case "equal":
                    add = 2 << (2 * id2);
                    break;
                case "unequal":
                    add = 1 << (2 * id2);
                    break;
                case "none":
                    add = 0;
                    break;
            }
            this.layers[id1] = ((this.layers[id1] & clear) | add);
        }
        if (id1 != id2) {
            if (id1 >= 16) {
                var add = void 0, clear = ~(3 << (2 * id1 - 16));
                switch (rule) {
                    case "all":
                        add = 3 << (2 * id1 - 16);
                        break;
                    case "equal":
                        add = 2 << (2 * id1 - 16);
                        break;
                    case "unequal":
                        add = 1 << (2 * id1 - 16);
                        break;
                    case "none":
                        add = 0;
                        break;
                }
                this.layers[id2 + 32] = ((this.layers[id2 + 32] & clear) | add);
            }
            else {
                var add = void 0, clear = ~(3 << 2 * id1);
                switch (rule) {
                    case "all":
                        add = 3 << (2 * id1);
                        break;
                    case "equal":
                        add = 2 << (2 * id1);
                        break;
                    case "unequal":
                        add = 1 << (2 * id1);
                        break;
                    case "none":
                        add = 0;
                        break;
                }
                this.layers[id2] = ((this.layers[id2] & clear) | add);
            }
        }
    };
    World.prototype._getLayerRule = function (id1, id2) {
        if (id2 < 16) {
            var b = 2 * id2, a = 3 << b;
            return (this.layers[id1] & a) >> b;
        }
        else {
            var b = (2 * id2 - 16), a = 3 << b;
            return (this.layers[id1 + 32] & a) >> b;
        }
    };
    World.prototype.getLayerRule = function (layer1, layer2) {
        var id1 = this.layerIds[layer1], id2 = this.layerIds[layer2];
        switch (this._getLayerRule(id1, id2)) {
            case 0x3: return "all";
            case 0x2: return "equal";
            case 0x1: return "unequal";
            case 0: return "none";
        }
    };
    World.prototype.queryRect = function (minx, maxx, miny, maxy, filter) {
        var ents = this.vbh.queryRect(minx, maxx, miny, maxy), res = [];
        for (var _i = 0, ents_1 = ents; _i < ents_1.length; _i++) {
            var e = ents_1[_i];
            if (e._allBodyChilds) {
                res.push.apply(res, e._allBodyChilds.queryRect(minx - e._x, maxx - e._x, miny - e._y, maxy - e._y, filter));
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    res.push(e._bodyChilds);
                }
                else {
                    res.push.apply(res, e._bodyChilds.queryRect(minx - e._x, maxx - e._x, miny - e._y, maxy - e._y, filter));
                }
            }
        }
        return res;
    };
    World.prototype.queryCircle = function (x, y, radius, filter) {
        var ents = this.vbh.queryCircle(x, y, radius), res = [];
        for (var _i = 0, ents_2 = ents; _i < ents_2.length; _i++) {
            var e = ents_2[_i];
            if (e._allBodyChilds) {
                res.push.apply(res, e._allBodyChilds.queryCircle(x - e._x, y - e._y, radius, filter));
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    res.push(e._bodyChilds);
                }
                else {
                    res.push.apply(res, e._bodyChilds.queryCircle(x - e._x, y - e._y, radius, filter));
                }
            }
        }
        return res;
    };
    World.prototype.nearest = function (x, y, k, filter) {
        return this.vbh.nearest(x, y, k, filter);
    };
    World.prototype.raycast = function (x1, y1, x2, y2, filter) {
        var ents = this.vbh.queryRect(Math.min(x1, x2), Math.max(x1, x2), Math.min(y1, y2), Math.max(y1, y2)), res = null, tmp = null;
        for (var _i = 0, ents_3 = ents; _i < ents_3.length; _i++) {
            var e = ents_3[_i];
            if (e._allBodyChilds) {
                tmp = e._allBodyChilds.raycast(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, filter);
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    if (vb.accepts(e._bodyChilds, filter)) {
                        var ttmp = { body: null, x: 0, y: 0, distance: 0, side: "bot" };
                        math.raycastHelper(e._bodyChilds, 100000, x2 - x1, y2 - y1, x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, ttmp);
                        if (ttmp.body) {
                            tmp = ttmp;
                        }
                    }
                }
                else {
                    tmp = e._bodyChilds.raycast(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, filter);
                }
            }
            if (tmp && (!res || res.distance > tmp.distance)) {
                res = tmp;
            }
        }
        return res;
    };
    World.prototype.raycastAll = function (x1, y1, x2, y2, filter) {
        var ents = this.vbh.queryRect(Math.min(x1, x2), Math.max(x1, x2), Math.min(y1, y2), Math.max(y1, y2)), res = [];
        for (var _i = 0, ents_4 = ents; _i < ents_4.length; _i++) {
            var e = ents_4[_i];
            if (e._allBodyChilds) {
                res.push.apply(res, e._allBodyChilds.raycastAll(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, filter));
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    var ttmp = { body: null, x: 0, y: 0, distance: 0, side: "bot" };
                    math.raycastHelper(e._bodyChilds, 100000, x2 - x1, y2 - y1, x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, ttmp);
                    if (ttmp.body) {
                        res.push(ttmp);
                    }
                }
                else {
                    res.push.apply(e._bodyChilds.raycast(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, filter));
                }
            }
        }
        return res;
    };
    World.prototype.raycastRect = function (x1, y1, x2, y2, w, h, filter) {
        var ents = this.vbh.queryRect(Math.min(x1, x2) - w, Math.max(x1, x2) + w, Math.min(y1, y2) - h, Math.max(y1, y2) + h), res = null, tmp = null;
        for (var _i = 0, ents_5 = ents; _i < ents_5.length; _i++) {
            var e = ents_5[_i];
            if (e._allBodyChilds) {
                tmp = e._allBodyChilds.raycastRect(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, w, h, filter);
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    if (vb.accepts(e._bodyChilds, filter)) {
                        var ttmp = { body: null, x: 0, y: 0, distance: 0, side: "bot" };
                        math.raycastRectHelper(e._bodyChilds, 100000, w, h, x2 - x1, y2 - y1, x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, ttmp);
                        if (ttmp.body) {
                            tmp = ttmp;
                        }
                    }
                }
                else {
                    tmp = e._bodyChilds.raycastRect(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, w, h, filter);
                }
            }
            if (tmp && (!res || res.distance > tmp.distance)) {
                res = tmp;
            }
        }
        return res;
    };
    World.prototype.raycastRectAll = function (x1, y1, x2, y2, w, h, filter) {
        var ents = this.vbh.queryRect(Math.min(x1, x2) - w, Math.max(x1, x2) + w, Math.min(y1, y2) - h, Math.max(y1, y2) + h), res = [];
        for (var _i = 0, ents_6 = ents; _i < ents_6.length; _i++) {
            var e = ents_6[_i];
            if (e._allBodyChilds) {
                res.push.apply(res, e._allBodyChilds.raycastRectAll(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, w, h, filter));
            }
            else {
                if (e._bodyChilds instanceof ent.Body) {
                    var ttmp = { body: null, x: 0, y: 0, distance: 0, side: "bot" };
                    math.raycastRectHelper(e._bodyChilds, 100000, w, h, x2 - x1, y2 - y1, x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, ttmp);
                    if (ttmp.body) {
                        res.push(ttmp);
                    }
                }
                else {
                    res.push.apply(e._bodyChilds.raycastRectAll(x1 - e._x, y1 - e._y, x2 - e._x, y2 - e._y, w, h, filter));
                }
            }
        }
        return res;
    };
    World.prototype.simulate = function (timeDelta) {
        var _this = this;
        if (timeDelta > 0.5) {
            timeDelta = 0.5;
        }
        this.sim = { nb: this.simCount, start: this.time, duration: timeDelta, levels: [] };
        this.computeVoidSpeed(timeDelta);
        this.broadphase();
        this.simulateLevels(timeDelta);
        this.computeFinalPosition(timeDelta);
        for (var level in this.ents) {
            var _loop_1 = function (e) {
                e.forallTopBody(function (b) {
                    if (b._isSensor) {
                        var j = 0, len = b.botContacts.length;
                        for (var i = 0; i < len; i++) {
                            var other = b.botContacts[j];
                            if (other._entity._x + other.maxx <= e._x + b.minx || other._entity._x + other.minx >= e._x + e.maxx
                                || other._entity._y + other.maxy <= e._x + e.miny || other._entity._y + other.miny >= e._x + e.maxy) {
                                e.botContacts.splice(j, 1);
                                console.log(_this.simCount + ": sensor contact loss: " + e.name + " " + e.name);
                            }
                            else {
                                j++;
                            }
                        }
                    }
                });
                e._potContact = [];
                e._narrowCount = 0;
                e._slideOff = [];
                e.ax = 0;
                e.ay = 0;
                e._marked = true;
            };
            for (var _i = 0, _a = this.ents[level]; _i < _a.length; _i++) {
                var e = _a[_i];
                _loop_1(e);
            }
            for (var _b = 0, _c = this.ents[level]; _b < _c.length; _b++) {
                var e = _c[_b];
                e._marked = false;
            }
        }
        this.sims.push(this.sim);
        this.simCount++;
        this.time += timeDelta;
    };
    World.prototype.logEntList = function (ents) {
        if (ents.length) {
            var res = ents[0].name + "(" + ents[0]._level + ")";
            for (var i = 1; i < ents.length; i++) {
                res += ", " + ents[i].name + "(" + ents[i]._level + ")";
            }
            return res;
        }
        else {
            return "";
        }
    };
    World.prototype.computeVoidSpeed = function (timeDelta) {
        for (var level in this.ents) {
            for (var _i = 0, _a = this.ents[level]; _i < _a.length; _i++) {
                var ent_1 = _a[_i];
                ent_1.relvx += ent_1.ax * timeDelta;
                ent_1.relvy += ent_1.ay * timeDelta;
            }
        }
    };
    World.prototype.broadphaseInter = function (e1, e2, b1, b2, minx1, maxx1, miny1, maxy1, minx2, maxx2, miny2, maxy2) {
        if (!(minx1 > maxx2 || minx2 > maxx1 || miny1 > maxy2 || miny2 > maxy1)) {
            var rule = this._getLayerRule(b1._layer, b2._layer);
            if (rule == 0x3
                || (rule == 0x2 && b1._layergroup == b2._layergroup)
                || (rule == 0x1 && b1._layergroup != b2._layergroup)) {
                if (e1._level == e2._level) {
                    e1._potContact.push({ body: b1, otherBody: b2 });
                    e2._potContact.push({ body: b2, otherBody: b1 });
                }
                else {
                    if (e1._level < e2._level) {
                        e2._potContact.push({ body: b2, otherBody: b1 });
                    }
                    else {
                        e1._potContact.push({ body: b1, otherBody: b2 });
                    }
                }
            }
        }
    };
    World.prototype.broadphase = function () {
        var _this = this;
        this.vbh.update();
        var collisions = this.vbh.collisions();
        var _loop_2 = function (collision) {
            var e1 = collision[0], e2 = collision[1];
            if (e1._enabled && e2._enabled) {
                var v1_1 = (e1._allBodyChilds ? e1._allBodyChilds : e1._bodyChilds), v2_1 = (e2._allBodyChilds ? e2._allBodyChilds : e2._bodyChilds);
                if (v1_1 instanceof ent.Body && v2_1 instanceof ent.Body) {
                    if (v1_1.physical && v2_1.physical) {
                        var minx1 = e1._x + v1_1._x - v1_1.width / 2 - Math.abs(e1._vx) - ent.AABB_SKIN, maxx1 = e1._x + v1_1._x + v1_1.width / 2 + Math.abs(e1._vx) + ent.AABB_SKIN, miny1 = e1._y + v1_1._y - v1_1.height / 2 - Math.abs(e1._vy) - ent.AABB_SKIN, maxy1 = e1._y + v1_1._y + v1_1.height / 2 + Math.abs(e1._vy) + ent.AABB_SKIN, minx2 = e2._x + v2_1._x - v2_1.width / 2 - Math.abs(e2._vx) - ent.AABB_SKIN, maxx2 = e2._x + v2_1._x + v2_1.width / 2 + Math.abs(e2._vx) + ent.AABB_SKIN, miny2 = e2._y + v2_1._y - v2_1.height / 2 - Math.abs(e2._vy) - ent.AABB_SKIN, maxy2 = e2._y + v2_1._y + v2_1.height / 2 + Math.abs(e2._vy) + ent.AABB_SKIN;
                        this_1.broadphaseInter(e1, e2, v1_1, v2_1, minx1, maxx1, miny1, maxy1, minx2, maxx2, miny2, maxy2);
                    }
                }
                else {
                    if (v1_1 instanceof ent.Body) {
                        if (v1_1.physical) {
                            var minx1_1 = e1._x + v1_1._x - v1_1.width / 2 - Math.abs(e1._vx) - ent.AABB_SKIN, maxx1_1 = e1._x + v1_1._x + v1_1.width / 2 + Math.abs(e1._vx) + ent.AABB_SKIN, miny1_1 = e1._y + v1_1._y - v1_1.height / 2 - Math.abs(e1._vy) - ent.AABB_SKIN, maxy1_1 = e1._y + v1_1._y + v1_1.height / 2 + Math.abs(e1._vy) + ent.AABB_SKIN;
                            v2_1.forall(function (b) {
                                if (b.physical) {
                                    var minx2 = e2._x + b._x - b.width / 2 - Math.abs(e2._vx) - ent.AABB_SKIN, maxx2 = e2._x + b._x + b.width / 2 + Math.abs(e2._vx) + ent.AABB_SKIN, miny2 = e2._y + b._y - b.height / 2 - Math.abs(e2._vy) - ent.AABB_SKIN, maxy2 = e2._y + b._y + b.height / 2 + Math.abs(e2._vy) + ent.AABB_SKIN;
                                    _this.broadphaseInter(e1, e2, v1_1, b, minx1_1, maxx1_1, miny1_1, maxy1_1, minx2, maxx2, miny2, maxy2);
                                }
                            });
                        }
                    }
                    else if (v2_1 instanceof ent.Body) {
                        if (v2_1.physical) {
                            var minx1_2 = e2._x + v2_1._x - v2_1.width / 2 - Math.abs(e2._vx) - ent.AABB_SKIN, maxx1_2 = e2._x + v2_1._x + v2_1.width / 2 + Math.abs(e2._vx) + ent.AABB_SKIN, miny1_2 = e2._y + v2_1._y - v2_1.height / 2 - Math.abs(e2._vy) - ent.AABB_SKIN, maxy1_2 = e2._y + v2_1._y + v2_1.height / 2 + Math.abs(e2._vy) + ent.AABB_SKIN;
                            v1_1.forall(function (b) {
                                if (b.physical) {
                                    var minx2 = e1._x + b._x - b.width / 2 - Math.abs(e1._vx) - ent.AABB_SKIN, maxx2 = e1._x + b._x + b.width / 2 + Math.abs(e1._vx) + ent.AABB_SKIN, miny2 = e1._y + b._y - b.height / 2 - Math.abs(e1._vy) - ent.AABB_SKIN, maxy2 = e1._y + b._y + b.height / 2 + Math.abs(e1._vy) + ent.AABB_SKIN;
                                    _this.broadphaseInter(e2, e1, v2_1, b, minx1_2, maxx1_2, miny1_2, maxy1_2, minx2, maxx2, miny2, maxy2);
                                }
                            });
                        }
                    }
                    else {
                        v1_1.forall(function (b1) {
                            if (b1.physical) {
                                var minx1_3 = e1._x + b1._x - b1.width / 2 - Math.abs(e1._vx) - ent.AABB_SKIN, maxx1_3 = e1._x + b1._x + b1.width / 2 + Math.abs(e1._vx) + ent.AABB_SKIN, miny1_3 = e1._y + b1._y - b1.height / 2 - Math.abs(e1._vy) - ent.AABB_SKIN, maxy1_3 = e1._y + b1._y + b1.height / 2 + Math.abs(e1._vy) + ent.AABB_SKIN;
                                v2_1.forall(function (b2) {
                                    if (b2.physical) {
                                        var minx2 = e2._x + b2._x - b2.width / 2 - Math.abs(e2._vx) - ent.AABB_SKIN, maxx2 = e2._x + b2._x + b2.width / 2 + Math.abs(e2._vx) + ent.AABB_SKIN, miny2 = e2._y + b2._y - b2.height / 2 - Math.abs(e2._vy) - ent.AABB_SKIN, maxy2 = e2._y + b2._y + b2.height / 2 + Math.abs(e2._vy) + ent.AABB_SKIN;
                                        _this.broadphaseInter(e1, e2, b1, b2, minx1_3, maxx1_3, miny1_3, maxy1_3, minx2, maxx2, miny2, maxy2);
                                    }
                                });
                            }
                        });
                    }
                }
            }
        };
        var this_1 = this;
        for (var _i = 0, collisions_1 = collisions; _i < collisions_1.length; _i++) {
            var collision = collisions_1[_i];
            _loop_2(collision);
        }
        this.sim.collisions = collisions;
    };
    World.prototype.simulateLevels = function (timeDelta) {
        for (var l in this.ents) {
            var level = parseInt(l), ents = this.ents[l], collisionTimeline = [], nextCollision = void 0;
            this.simlevel = {
                level: level,
                collisions: [],
                narrowphases: [],
                solve: [],
                slideoff: []
            };
            for (var _i = 0, ents_7 = ents; _i < ents_7.length; _i++) {
                var e = ents_7[_i];
                if (e._parent) {
                    e._vx = e.relvx + e._parent._simvx;
                    e._vy = e.relvy + e._parent._simvy;
                }
                else {
                    e._vx = e.relvx;
                    e._vy = e.relvy;
                }
                e._lastx = e._x;
                e._lasty = e._y;
                e._lastTime = 0;
            }
            this.solveInit(ents, timeDelta);
            this.narrowPhases(ents, level, timeDelta, 0, collisionTimeline);
            nextCollision = collisionTimeline.length > 0 ? collisionTimeline.shift() : null;
            while (nextCollision) {
                this.simlevel.collisions.push(nextCollision);
                if (nextCollision.body1._isSensor) {
                    nextCollision.body1.botContacts.push(nextCollision.body2);
                    console.log(this.simCount + ": sensor collision: " + nextCollision.body1._entity.name + " " + nextCollision.body2._entity.name);
                    console.log(nextCollision);
                }
                if (nextCollision.body2._isSensor) {
                    nextCollision.body2.botContacts.push(nextCollision.body1);
                    console.log(this.simCount + ": sensor collision: " + nextCollision.body1._entity.name + " " + nextCollision.body2._entity.name);
                    console.log(nextCollision);
                }
                if (!nextCollision.body1._isSensor && !nextCollision.body2._isSensor) {
                    console.log(this.simCount + ": collision: " + nextCollision.body1._entity.name + " " + nextCollision.body2._entity.name);
                    console.log(nextCollision);
                    this.updateContacts(nextCollision.body1, nextCollision.body2, nextCollision.isX);
                    var modified = this.solveNewContact(nextCollision, timeDelta);
                    this.updateCollisionEvents(modified, collisionTimeline);
                    this.narrowPhases(modified, level, timeDelta, nextCollision.time, collisionTimeline);
                }
                nextCollision = collisionTimeline.length > 0 ? collisionTimeline.shift() : null;
            }
            this.updateSlideOffs(ents, timeDelta);
            for (var _a = 0, ents_8 = ents; _a < ents_8.length; _a++) {
                var e = ents_8[_a];
                e._simvx = (e._lastx + e._vx * (timeDelta - e._lastTime) - e._x) / timeDelta;
                e._simvy = (e._lasty + e._vy * (timeDelta - e._lastTime) - e._y) / timeDelta;
            }
            this.sim.levels.push(this.simlevel);
        }
    };
    World.prototype.computeFinalPosition = function (timeDelta) {
        for (var level in this.ents) {
            for (var _i = 0, _a = this.ents[level]; _i < _a.length; _i++) {
                var rect = _a[_i];
                rect._x = rect._lastx + rect._vx * (timeDelta - rect._lastTime);
                rect._y = rect._lasty + rect._vy * (timeDelta - rect._lastTime);
                if (rect._parent) {
                    rect.relvx = rect._vx - rect._parent._simvx;
                    rect.relvy = rect._vy - rect._parent._simvy;
                }
                else {
                    rect.relvx = rect._vx;
                    rect.relvy = rect._vy;
                }
            }
        }
    };
    World.prototype.narrowPhase = function (b1, level1, time1, x1, y1, vx1, vy1, b2, level2, time2, x2, y2, vx2, vy2, maxTime) {
        var startDelta1, startDelta2, startTime, toix = 1000, toiy = 1000, narrow;
        if (time1 < time2) {
            startDelta1 = time2 - time1;
            startDelta2 = 0;
            startTime = time2;
        }
        else {
            startDelta2 = time1 - time2;
            startDelta1 = 0;
            startTime = time1;
        }
        if ((!b1._isSensor || b1.botContacts.indexOf(b2) < 0) && (!b2._isSensor || b2.botContacts.indexOf(b1) < 0)) {
            if (vx1 != vx2) {
                if (x1 < x2) {
                    if (b1.rightCollide && b2.leftCollide &&
                        (level1 == level2 && b1.rightContacts.indexOf(b2) < 0 && b1.topContacts.indexOf(b2) < 0 && b1.botContacts.indexOf(b2) < 0
                            || level1 > level2 && b1.higherRightContact != b2 && b1.higherTopContact != b2 && b1.higherBotContact != b2
                            || level1 < level2 && b2.higherLeftContact != b1 && b2.higherTopContact != b1 && b2.higherBotContact != b1)) {
                        toix = (x1 - x2 - vx2 * startDelta2 + vx1 * startDelta1 + (b1.width + b2.width) / 2) / (vx2 - vx1);
                    }
                }
                else {
                    if (b1.leftCollide && b2.rightCollide &&
                        (level1 == level2 && b1.leftContacts.indexOf(b2) < 0 && b1.topContacts.indexOf(b2) < 0 && b1.botContacts.indexOf(b2) < 0
                            || level1 > level2 && b1.higherLeftContact != b2 && b1.higherTopContact != b2 && b1.higherBotContact != b2
                            || level1 < level2 && b2.higherRightContact != b1 && b2.higherTopContact != b1 && b2.higherBotContact != b1)) {
                        toix = (x1 - x2 - vx2 * startDelta2 + vx1 * startDelta1 - (b1.width + b2.width) / 2) / (vx2 - vx1);
                    }
                }
            }
            if (vy1 != vy2) {
                if (y1 < y2) {
                    if (b1.topCollide && b2.botCollide &&
                        (level1 == level2 && b1.topContacts.indexOf(b2) < 0 && b1.leftContacts.indexOf(b2) < 0 && b1.rightContacts.indexOf(b2) < 0
                            || level1 > level2 && b1.higherTopContact != b2 && b1.higherLeftContact != b2 && b1.higherRightContact != b2
                            || level1 < level2 && b2.higherBotContact != b1 && b2.higherLeftContact != b1 && b2.higherRightContact != b1)) {
                        toiy = (y1 - y2 - vy2 * startDelta2 + vy1 * startDelta1 + (b1.height + b2.height) / 2) / (vy2 - vy1);
                    }
                }
                else {
                    if (b1.botCollide && b2.topCollide &&
                        (level1 == level2 && b1.botContacts.indexOf(b2) < 0 && b1.leftContacts.indexOf(b2) < 0 && b1.rightContacts.indexOf(b2) < 0
                            || level1 > level2 && b1.higherBotContact != b2 && b1.higherLeftContact != b2 && b1.higherRightContact != b2
                            || level1 < level2 && b2.higherTopContact != b1 && b2.higherLeftContact != b1 && b2.higherRightContact != b1)) {
                        toiy = (y1 - y2 - vy2 * startDelta2 + vy1 * startDelta1 - (b1.height + b2.height) / 2) / (vy2 - vy1);
                    }
                }
            }
        }
        if ((toix < toiy || toiy < 0) && startTime + toix < maxTime && toix > 0) {
            var newy1 = y1 + (toix + startDelta1) * vy1, newy2 = y2 + (toix + startDelta2) * vy2;
            if (!(newy2 - b2.height / 2 > newy1 + b1.height / 2 || newy1 - b1.height / 2 > newy2 + b2.height / 2)) {
                if (x1 < x2) {
                    narrow = {
                        time: startTime + toix,
                        x1: x1 + (toix + startDelta1) * vx1,
                        y1: newy1,
                        body1: b1,
                        x2: x2 + (toix + startDelta2) * vx2,
                        y2: newy2,
                        body2: b2,
                        isX: true
                    };
                }
                else {
                    narrow = {
                        time: startTime + toix,
                        x2: x1 + (toix + startDelta1) * vx1,
                        y2: newy1,
                        body2: b1,
                        x1: x2 + (toix + startDelta2) * vx2,
                        y1: newy2,
                        body1: b2,
                        isX: true
                    };
                }
            }
        }
        if (startTime + toiy < maxTime && toiy > 0) {
            var newx1 = x1 + (toiy + startDelta1) * vx1, newx2 = x2 + (toiy + startDelta2) * vx2;
            if (!(newx2 - b2.width / 2 > newx1 + b1.width / 2 || newx1 - b1.width / 2 > newx2 + b2.width / 2)) {
                if (y1 < y2) {
                    narrow = {
                        time: startTime + toiy,
                        x1: newx1,
                        y1: y1 + (toiy + startDelta1) * vy1,
                        body1: b1,
                        x2: newx2,
                        y2: y2 + (toiy + startDelta2) * vy2,
                        body2: b2,
                        isX: false
                    };
                }
                else {
                    narrow = {
                        time: startTime + toiy,
                        x2: newx1,
                        y2: y1 + (toiy + startDelta1) * vy1,
                        body2: b1,
                        x1: newx2,
                        y1: y2 + (toiy + startDelta2) * vy2,
                        body1: b2,
                        isX: false
                    };
                }
            }
        }
        return narrow;
    };
    World.prototype.updateContacts = function (body1, body2, isX) {
        if (isX) {
            if (body1._entity._level == body2._entity._level) {
                body1._entity.rightContacts.push({ body: body1, otherBody: body2 });
                body1.rightContacts.push(body2);
                body2._entity.leftContacts.push({ body: body2, otherBody: body1 });
                body2.leftContacts.push(body1);
            }
            else {
                if (body1._entity._level < body2._entity._level) {
                    body2._entity.higherLeftContact = { body: body2, otherBody: body1 };
                    body2.higherLeftContact = body1;
                }
                else {
                    body1._entity.higherRightContact = { body: body1, otherBody: body2 };
                    body1.higherRightContact = body2;
                }
            }
        }
        else {
            if (body1._entity._level == body2._entity._level) {
                body1._entity.topContacts.push({ body: body1, otherBody: body2 });
                body1.topContacts.push(body2);
                body2._entity.botContacts.push({ body: body2, otherBody: body1 });
                body2.botContacts.push(body1);
            }
            else {
                if (body1._entity._level < body2._entity._level) {
                    body2._entity.higherBotContact = { body: body2, otherBody: body1 };
                    body2.higherBotContact = body1;
                }
                else {
                    body1._entity.higherTopContact = { body: body1, otherBody: body2 };
                    body1.higherTopContact = body2;
                }
            }
        }
        body1._entity._narrowCount--;
        body2._entity._narrowCount--;
    };
    World.prototype.narrowPhases = function (ents, level, timeDelta, currentTime, collisionTimeline) {
        for (var _i = 0, ents_9 = ents; _i < ents_9.length; _i++) {
            var e = ents_9[_i];
            for (var _a = 0, _b = e._potContact; _a < _b.length; _a++) {
                var c = _b[_a];
                if (!c.otherBody._entity._marked) {
                    var narrow = void 0, othere = c.otherBody._entity, i = 0, len = e._tmpnocoll.length;
                    while (i < len && e._tmpnocoll[i].body != c.body && e._tmpnocoll[i].otherBody != c.otherBody) {
                        i++;
                    }
                    if (i != len) {
                        continue;
                    }
                    if (othere._level < level) {
                        narrow = this.narrowPhase(c.body, e._level, e._lastTime, e._lastx + c.body._x, e._lasty + c.body._y, e._vx, e._vy, c.otherBody, othere._level, 0, othere._x + c.otherBody._x, othere._y + c.otherBody._y, othere._simvx, othere._simvy, timeDelta);
                    }
                    else {
                        narrow = this.narrowPhase(c.body, e._level, e._lastTime, e._lastx + c.body._x, e._lasty + c.body._y, e._vx, e._vy, c.otherBody, othere._level, othere._lastTime, othere._lastx + c.otherBody._x, othere._lasty + c.otherBody._y, othere._vx, othere._vy, timeDelta);
                    }
                    if (narrow) {
                        narrow.body1._entity._narrowCount++;
                        narrow.body2._entity._narrowCount++;
                        var i_1 = 0, len_1 = collisionTimeline.length;
                        while (i_1 < len_1 && narrow.time > collisionTimeline[i_1].time) {
                            i_1++;
                        }
                        collisionTimeline.splice(i_1, 0, narrow);
                    }
                }
            }
            e._tmpnocoll = [];
            e._marked = true;
        }
        for (var _c = 0, ents_10 = ents; _c < ents_10.length; _c++) {
            var e = ents_10[_c];
            e._marked = false;
        }
    };
    World.prototype.updateCollisionEvents = function (ents, collisionTimeline) {
        var len = collisionTimeline.length, i = 0, j = 0, colliders = ents.filter(function (rect) {
            return rect._narrowCount > 0;
        });
        while (i < len && colliders.length) {
            var elimIndex1 = colliders.indexOf(collisionTimeline[j].body1._entity), elimIndex2 = colliders.indexOf(collisionTimeline[j].body2._entity);
            if (elimIndex1 >= 0 || elimIndex2 >= 0) {
                collisionTimeline[j].body1._entity._narrowCount--;
                collisionTimeline[j].body1._entity._narrowCount--;
                collisionTimeline.splice(j, 1);
                if (elimIndex1 >= 0 && !colliders[elimIndex1]._narrowCount) {
                    colliders.splice(elimIndex1, 1);
                }
                if (elimIndex2 >= 0 && !colliders[elimIndex2]._narrowCount) {
                    colliders.splice(elimIndex2, 1);
                }
                i++;
                continue;
            }
            else {
                i++;
                j++;
                continue;
            }
        }
    };
    World.prototype.solveInit = function (ents, timeDelta) {
        for (var _i = 0, ents_11 = ents; _i < ents_11.length; _i++) {
            var e = ents_11[_i];
            e._simvx = e.mass * e._vx;
            e._simvy = e.mass * e._vy;
        }
        var rectsX = this.getAllConnexRects(ents, true);
        for (var _a = 0, ents_12 = ents; _a < ents_12.length; _a++) {
            var ent_2 = ents_12[_a];
            ent_2._marked = false;
        }
        var rectsY = this.getAllConnexRects(ents, false);
        for (var _b = 0, ents_13 = ents; _b < ents_13.length; _b++) {
            var ent_3 = ents_13[_b];
            ent_3._marked = false;
        }
        for (var _c = 0, rectsX_1 = rectsX; _c < rectsX_1.length; _c++) {
            var group = rectsX_1[_c];
            this.solveAux(group, false, true, 0);
        }
        for (var _d = 0, rectsY_1 = rectsY; _d < rectsY_1.length; _d++) {
            var group = rectsY_1[_d];
            this.solveAux(group, false, false, 0);
        }
        this.slideOffs(ents, 0, timeDelta);
    };
    World.prototype.solveNewContact = function (narrow, timeDelta) {
        var ent1 = narrow.body1._entity, ent2 = narrow.body2._entity, target;
        if (ent1._level >= ent2._level) {
            ent1._lastx = narrow.x1 - narrow.body1._x;
            ent1._lasty = narrow.y1 - narrow.body1._y;
            ent1._lastTime = narrow.time;
            target = ent1;
        }
        if (ent2._level >= ent1._level) {
            ent2._lastx = narrow.x2 - narrow.body2._x;
            ent2._lasty = narrow.y2 - narrow.body2._y;
            ent2._lastTime = narrow.time;
            target = ent2;
        }
        var group = this.getConnexRects(target, narrow.isX), res = [];
        for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
            var ent_4 = group_1[_i];
            ent_4._marked = false;
            ent_4._lastx += ent_4._vx * (narrow.time - ent_4._lastTime);
            ent_4._lasty += ent_4._vy * (narrow.time - ent_4._lastTime);
            ent_4._lastTime = narrow.time;
        }
        this.updateSlideOffs(group, narrow.time);
        for (var _a = 0, _b = this.getAllConnexRects(group, narrow.isX); _a < _b.length; _a++) {
            var subgroup = _b[_a];
            res.push.apply(res, this.solveAux(subgroup, true, narrow.isX, narrow.time));
            this.slideOffs(subgroup, narrow.time, timeDelta);
        }
        for (var _c = 0, group_2 = group; _c < group_2.length; _c++) {
            var rect = group_2[_c];
            rect._marked = false;
        }
        return res;
    };
    World.prototype.solveAux = function (ents, modified, isX, time) {
        if (ents.length == 1) {
            var ent_5 = ents[0];
            if (isX) {
                if (ent_5.higherLeftContact) {
                    if (ent_5._vx <= ent_5.higherLeftContact.otherBody._entity._simvx) {
                        ent_5._vx = ent_5.higherLeftContact.otherBody._entity._simvx;
                    }
                    else {
                        console.log(this.simCount + ": split(small, left): " + ent_5.name
                            + " " + ent_5.higherLeftContact.otherBody._entity.name);
                        ent_5.higherLeftContact.body.higherLeftContact = null;
                        ent_5.higherLeftContact = null;
                    }
                }
                if (ent_5.higherRightContact) {
                    if (ent_5._vx >= ent_5.higherRightContact.otherBody._entity._simvx) {
                        ent_5._vx = ent_5.higherRightContact.otherBody._entity._simvx;
                    }
                    else {
                        console.log(this.simCount + ": split(small, right): " + ent_5.name
                            + " " + ent_5.higherRightContact.otherBody._entity.name);
                        ent_5.higherRightContact.body.higherRightContact = null;
                        ent_5.higherRightContact = null;
                    }
                }
            }
            else {
                if (ent_5.higherBotContact) {
                    if (ent_5._vy <= ent_5.higherBotContact.otherBody._entity._simvy) {
                        ent_5._vy = ent_5.higherBotContact.otherBody._entity._simvy;
                    }
                    else {
                        console.log(this.simCount + ": split(small, bot): " + ent_5.name
                            + " " + ent_5.higherBotContact.otherBody._entity.name);
                        ent_5.higherBotContact.body.higherBotContact = null;
                        ent_5.higherBotContact = null;
                    }
                }
                if (ent_5.higherTopContact) {
                    if (ent_5._vy >= ent_5.higherTopContact.otherBody._entity._simvy) {
                        ent_5._vy = ent_5.higherTopContact.otherBody._entity._simvy;
                    }
                    else {
                        console.log(this.simCount + ": split(small, top): " + ent_5.name
                            + " " + ent_5.higherTopContact.otherBody._entity.name);
                        ent_5.higherTopContact.body.higherTopContact = null;
                        ent_5.higherTopContact = null;
                    }
                }
            }
        }
        else {
            if (isX) {
                for (var _i = 0, ents_14 = ents; _i < ents_14.length; _i++) {
                    var ent_6 = ents_14[_i];
                    if (ent_6.higherRightContact) {
                        ent_6._vx = Math.min(ent_6._vx, ent_6.higherRightContact.otherBody._entity._simvx);
                    }
                    if (ent_6.higherLeftContact) {
                        ent_6._vx = Math.max(ent_6._vx, ent_6.higherLeftContact.otherBody._entity._simvx);
                    }
                }
                this.LinearClumpX(ents);
                for (var _a = 0, ents_15 = ents; _a < ents_15.length; _a++) {
                    var ent_7 = ents_15[_a];
                    var rightlen = ent_7.rightContacts.length, leftlen = ent_7.leftContacts.length;
                    if (rightlen > 1) {
                        var maxClump = null, maxValue = -0.001;
                        for (var i = 0; i < rightlen; i++) {
                            var e = ent_7.rightContacts[i].otherBody._entity, tmpClump = e._clump;
                            if (tmpClump.left == e) {
                                var tmp = (ent_7._clump.v - tmpClump.v) * tmpClump.mass;
                                if (tmp > maxValue) {
                                    maxClump = tmpClump;
                                    maxValue = tmp;
                                }
                            }
                        }
                        if (maxValue >= 0) {
                            ent_7._clump.mergeRight(maxClump);
                        }
                    }
                    if (leftlen > 1) {
                        var maxClump = null, maxValue = -0.001;
                        for (var i = 1; i < leftlen; i++) {
                            var e = ent_7.leftContacts[i].otherBody._entity, tmpClump = e._clump;
                            if (tmpClump.right == e) {
                                var tmp = (tmpClump.v - ent_7._clump.v) * tmpClump.mass;
                                if (tmp > maxValue) {
                                    maxClump = tmpClump;
                                    maxValue = tmp;
                                }
                            }
                        }
                        if (maxValue >= 0) {
                            maxClump.mergeRight(ent_7._clump);
                        }
                    }
                }
                for (var _b = 0, ents_16 = ents; _b < ents_16.length; _b++) {
                    var ent_8 = ents_16[_b];
                    if (ent_8.leftContacts.length != 1
                        || (ent_8.leftContacts.length == 1 && ent_8.leftContacts[0].otherBody._entity.rightContacts.length > 1)) {
                        var right = this.clumpLeftToRight(ent_8._clump);
                        this.clumpRightToLeft(right);
                    }
                }
                var run = true;
                while (run) {
                    run = false;
                    for (var _c = 0, ents_17 = ents; _c < ents_17.length; _c++) {
                        var ent_9 = ents_17[_c];
                        for (var _d = 0, _e = ent_9.leftContacts; _d < _e.length; _d++) {
                            var left = _e[_d];
                            if (left.otherBody._entity._clump != ent_9._clump && left.otherBody._entity._clump.v >= ent_9._clump.v) {
                                left.otherBody._entity._clump.mergeRight(ent_9._clump);
                                run = true;
                            }
                        }
                        for (var _f = 0, _g = ent_9.rightContacts; _f < _g.length; _f++) {
                            var right = _g[_f];
                            if (right.otherBody._entity._clump != ent_9._clump && right.otherBody._entity._clump.v <= ent_9._clump.v) {
                                ent_9._clump.mergeRight(right.otherBody._entity._clump);
                                run = true;
                            }
                        }
                    }
                }
                for (var _h = 0, ents_18 = ents; _h < ents_18.length; _h++) {
                    var ent_10 = ents_18[_h];
                    ent_10._vx = ent_10._clump.v;
                    var j = 0, i = 0, len = ent_10.leftContacts.length;
                    while (i < len) {
                        if (ent_10.leftContacts[j].otherBody._entity._clump != ent_10._clump) {
                            console.log(this.simCount + ": split(left, right): " + ent_10.name
                                + " " + ent_10.leftContacts[j].otherBody._entity.name);
                            var k = 0, b = ent_10.leftContacts[j].body;
                            b.leftContacts.splice(b.leftContacts.indexOf(ent_10.leftContacts[j].otherBody), 1);
                            ent_10._tmpnocoll.push(ent_10.leftContacts[j]);
                            ent_10.leftContacts.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                        i++;
                    }
                    j = 0;
                    i = 0;
                    len = ent_10.rightContacts.length;
                    while (i < len) {
                        if (ent_10.rightContacts[j].otherBody._entity._clump != ent_10._clump) {
                            console.log(this.simCount + ": split(left, right): " + ent_10.name
                                + " " + ent_10.rightContacts[j].otherBody._entity.name);
                            var k = 0, b = ent_10.rightContacts[j].body;
                            b.rightContacts.splice(b.rightContacts.indexOf(ent_10.rightContacts[j].otherBody), 1);
                            ent_10._tmpnocoll.push(ent_10.rightContacts[j]);
                            ent_10.rightContacts.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                        i++;
                    }
                    if (ent_10.higherLeftContact && ent_10._vx != ent_10.higherLeftContact.otherBody._entity._simvx) {
                        console.log(this.simCount + ": split(small, left): " + ent_10.name
                            + " " + ent_10.higherLeftContact.otherBody._entity.name);
                        ent_10._tmpnocoll.push(ent_10.higherLeftContact);
                        ent_10.higherLeftContact.body.higherLeftContact = null;
                        ent_10.higherLeftContact = null;
                    }
                    if (ent_10.higherRightContact && ent_10._vx != ent_10.higherRightContact.otherBody._entity._simvx) {
                        console.log(this.simCount + ": split(small, right): " + ent_10.name
                            + " " + ent_10.higherRightContact.otherBody._entity.name);
                        ent_10._tmpnocoll.push(ent_10.higherRightContact);
                        ent_10.higherRightContact.body.higherRightContact = null;
                        ent_10.higherRightContact = null;
                    }
                }
            }
            else {
                for (var _j = 0, ents_19 = ents; _j < ents_19.length; _j++) {
                    var ent_11 = ents_19[_j];
                    if (ent_11.higherTopContact) {
                        ent_11._vy = Math.min(ent_11._vy, ent_11.higherTopContact.otherBody._entity._simvy);
                    }
                    if (ent_11.higherBotContact) {
                        ent_11._vy = Math.max(ent_11._vy, ent_11.higherBotContact.otherBody._entity._simvy);
                    }
                }
                this.LinearClumpY(ents);
                for (var _k = 0, ents_20 = ents; _k < ents_20.length; _k++) {
                    var ent_12 = ents_20[_k];
                    var toplen = ent_12.topContacts.length, botlen = ent_12.botContacts.length;
                    if (toplen > 1) {
                        var maxClump = null, maxValue = -0.001;
                        for (var i = 0; i < toplen; i++) {
                            var e = ent_12.topContacts[i].otherBody._entity, tmpClump = e._clump;
                            if (tmpClump.left == e) {
                                var tmp = (ent_12._clump.v - tmpClump.v) * tmpClump.mass;
                                if (tmp > maxValue) {
                                    maxClump = tmpClump;
                                    maxValue = tmp;
                                }
                            }
                        }
                        if (maxValue >= 0) {
                            ent_12._clump.mergeTop(maxClump);
                        }
                    }
                    if (botlen > 1) {
                        var maxClump = null, maxValue = -0.001;
                        for (var i = 1; i < botlen; i++) {
                            var e = ent_12.botContacts[i].otherBody._entity, tmpClump = e._clump;
                            if (tmpClump.right == e) {
                                var tmp = (tmpClump.v - ent_12._clump.v) * tmpClump.mass;
                                if (tmp > maxValue) {
                                    maxClump = tmpClump;
                                    maxValue = tmp;
                                }
                            }
                        }
                        if (maxValue >= 0) {
                            maxClump.mergeTop(ent_12._clump);
                        }
                    }
                }
                for (var _l = 0, ents_21 = ents; _l < ents_21.length; _l++) {
                    var rect = ents_21[_l];
                    if (rect.botContacts.length != 1
                        || (rect.botContacts.length == 1 && rect.botContacts[0].otherBody._entity.topContacts.length > 1)) {
                        var right = this.clumpBotToTop(rect._clump);
                        this.clumpTopToBot(right);
                    }
                }
                var run = true;
                while (run) {
                    run = false;
                    for (var _m = 0, ents_22 = ents; _m < ents_22.length; _m++) {
                        var ent_13 = ents_22[_m];
                        for (var _o = 0, _p = ent_13.botContacts; _o < _p.length; _o++) {
                            var left = _p[_o];
                            if (left.otherBody._entity._clump != ent_13._clump && left.otherBody._entity._clump.v >= ent_13._clump.v) {
                                left.otherBody._entity._clump.mergeTop(ent_13._clump);
                                run = true;
                            }
                        }
                        for (var _q = 0, _r = ent_13.topContacts; _q < _r.length; _q++) {
                            var right = _r[_q];
                            if (right.otherBody._entity._clump != ent_13._clump && right.otherBody._entity._clump.v <= ent_13._clump.v) {
                                ent_13._clump.mergeTop(right.otherBody._entity._clump);
                                run = true;
                            }
                        }
                    }
                }
                for (var _s = 0, ents_23 = ents; _s < ents_23.length; _s++) {
                    var ent_14 = ents_23[_s];
                    ent_14._vy = ent_14._clump.v;
                    var j = 0, i = 0, len = ent_14.botContacts.length;
                    while (i < len) {
                        if (ent_14.botContacts[j].otherBody._entity._clump != ent_14._clump) {
                            console.log(this.simCount + ": split(top, bot): " + ent_14.name
                                + " " + ent_14.botContacts[j].otherBody._entity.name);
                            var k = 0, b = ent_14.botContacts[j].body;
                            b.botContacts.splice(b.botContacts.indexOf(ent_14.botContacts[j].otherBody), 1);
                            ent_14._tmpnocoll.push(ent_14.botContacts[j]);
                            ent_14.botContacts.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                        i++;
                    }
                    j = 0;
                    i = 0;
                    len = ent_14.topContacts.length;
                    while (i < len) {
                        if (ent_14.topContacts[j].otherBody._entity._clump != ent_14._clump) {
                            console.log(this.simCount + ": split(bot, top): " + ent_14.name
                                + " " + ent_14.topContacts[j].otherBody._entity.name);
                            var k = 0, b = ent_14.topContacts[j].body;
                            b.topContacts.splice(b.topContacts.indexOf(ent_14.topContacts[j].otherBody), 1);
                            ent_14._tmpnocoll.push(ent_14.topContacts[j]);
                            ent_14.topContacts.splice(j, 1);
                        }
                        else {
                            j++;
                        }
                        i++;
                    }
                    if (ent_14.higherBotContact && ent_14._vy != ent_14.higherBotContact.otherBody._entity._simvy) {
                        console.log(this.simCount + ": split(small, bot): " + ent_14.name
                            + " " + ent_14.higherBotContact.otherBody._entity.name);
                        ent_14._tmpnocoll.push(ent_14.higherBotContact);
                        ent_14.higherBotContact.body.higherBotContact = null;
                        ent_14.higherBotContact = null;
                    }
                    if (ent_14.higherTopContact && ent_14._vy != ent_14.higherTopContact.otherBody._entity._simvy) {
                        console.log(this.simCount + ": split(small, top): " + ent_14.name
                            + " " + ent_14.higherTopContact.otherBody._entity.name);
                        ent_14._tmpnocoll.push(ent_14.higherTopContact);
                        ent_14.higherTopContact.body.higherTopContact = null;
                        ent_14.higherTopContact = null;
                    }
                }
            }
        }
        return ents;
    };
    World.prototype.LinearClumpX = function (ents) {
        for (var _i = 0, ents_24 = ents; _i < ents_24.length; _i++) {
            var rect = ents_24[_i];
            if (rect.leftContacts.length != 1
                || (rect.leftContacts.length == 1 && rect.leftContacts[0].otherBody._entity.rightContacts.length > 1)) {
                var currentClump = new Clump();
                currentClump.initX(rect);
                if (rect.rightContacts.length == 1 && rect.rightContacts[0].otherBody._entity.leftContacts.length == 1) {
                    var next = rect.rightContacts[0].otherBody._entity;
                    while (next) {
                        if (currentClump.v >= next._vx) {
                            currentClump.addRight(next);
                        }
                        else {
                            currentClump = new Clump();
                            currentClump.initX(next);
                        }
                        if (next.rightContacts.length == 1 && rect.rightContacts[0].otherBody._entity.leftContacts.length == 1) {
                            next = next.rightContacts[0].otherBody._entity;
                        }
                        else {
                            next = null;
                        }
                    }
                    this.clumpRightToLeft(currentClump);
                }
            }
        }
    };
    World.prototype.clumpRightToLeft = function (right) {
        if (right.left.leftContacts.length == 1) {
            var nextClump = right.left.leftContacts[0].otherBody._entity._clump;
            while (true) {
                if (nextClump.v >= right.v) {
                    nextClump.mergeRight(right);
                }
                right = nextClump;
                if (right.left.leftContacts.length == 1) {
                    nextClump = right.left.leftContacts[0].otherBody._entity._clump;
                }
                else {
                    return right;
                }
            }
        }
        else {
            return right;
        }
    };
    World.prototype.clumpLeftToRight = function (left) {
        if (left.right.rightContacts.length == 1 && left.right.rightContacts[0].otherBody._entity.leftContacts.length == 1) {
            var nextClump = left.right.rightContacts[0].otherBody._entity._clump;
            while (true) {
                if (nextClump.v <= left.v) {
                    left.mergeRight(nextClump);
                }
                left = nextClump;
                if (left.right.rightContacts.length == 1 && left.right.rightContacts[0].otherBody._entity.leftContacts.length == 1) {
                    nextClump = left.right.rightContacts[0].otherBody._entity._clump;
                }
                else {
                    return left;
                }
            }
        }
        else {
            return left;
        }
    };
    World.prototype.LinearClumpY = function (rects) {
        for (var _i = 0, rects_1 = rects; _i < rects_1.length; _i++) {
            var rect = rects_1[_i];
            if (rect.botContacts.length != 1
                || (rect.botContacts.length == 1 && rect.botContacts[0].otherBody._entity.topContacts.length > 1)) {
                var currentClump = new Clump();
                currentClump.initY(rect);
                if (rect.topContacts.length == 1 && rect.topContacts[0].otherBody._entity.botContacts.length == 1) {
                    var next = rect.topContacts[0].otherBody._entity;
                    while (next) {
                        if (currentClump.v >= next._vy) {
                            currentClump.addTop(next);
                        }
                        else {
                            currentClump = new Clump();
                            currentClump.initY(next);
                        }
                        if (next.topContacts.length == 1 && rect.topContacts[0].otherBody._entity.botContacts.length == 1) {
                            next = next.topContacts[0].otherBody._entity;
                        }
                        else {
                            next = null;
                        }
                    }
                    this.clumpTopToBot(currentClump);
                }
            }
        }
    };
    World.prototype.clumpTopToBot = function (top) {
        if (top.left.botContacts.length == 1 && top.left.botContacts[0].otherBody._entity.topContacts.length == 1) {
            var nextClump = top.left.botContacts[0].otherBody._entity._clump;
            while (true) {
                if (nextClump.v >= top.v) {
                    nextClump.mergeTop(top);
                }
                top = nextClump;
                if (top.left.botContacts.length == 1 && top.left.botContacts[0].otherBody._entity.topContacts.length == 1) {
                    nextClump = top.left.botContacts[0].otherBody._entity._clump;
                }
                else {
                    return top;
                }
            }
        }
        else {
            return top;
        }
    };
    World.prototype.clumpBotToTop = function (bot) {
        if (bot.right.topContacts.length == 1 && bot.right.topContacts[0].otherBody._entity.botContacts.length == 1) {
            var nextClump = bot.right.topContacts[0].otherBody._entity._clump;
            while (true) {
                if (nextClump.v <= bot.v) {
                    bot.mergeTop(nextClump);
                }
                bot = nextClump;
                if (bot.right.topContacts.length == 1 && bot.right.topContacts[0].otherBody._entity.botContacts.length == 1) {
                    nextClump = bot.right.topContacts[0].otherBody._entity._clump;
                }
                else {
                    return bot;
                }
            }
        }
        else {
            return bot;
        }
    };
    World.prototype.updateSlideOffs = function (ents, time) {
        for (var _i = 0, ents_25 = ents; _i < ents_25.length; _i++) {
            var ent_15 = ents_25[_i];
            if (ent_15._slideOff) {
                for (var _a = 0, _b = ent_15._slideOff; _a < _b.length; _a++) {
                    var slideOff = _b[_a];
                    if (slideOff.time <= time) {
                        var ent1 = slideOff.body1._entity, ent2 = slideOff.body2._entity;
                        if (ent1._level == ent2._level) {
                            var body1 = slideOff.body1, body2 = slideOff.body2, list = void 0, otherlist = void 0, k = void 0, len = void 0;
                            if (slideOff.isX) {
                                body1.rightContacts.splice(body1.rightContacts.indexOf(body2), 1);
                                body2.leftContacts.splice(body2.leftContacts.indexOf(body1), 1);
                                list = ent_15.rightContacts;
                                otherlist = ent2.leftContacts;
                            }
                            else {
                                body1.topContacts.splice(body1.topContacts.indexOf(body2), 1);
                                body2.botContacts.splice(body2.botContacts.indexOf(body1), 1);
                                list = ent_15.topContacts;
                                otherlist = ent2.botContacts;
                            }
                            k = 0;
                            len = list.length;
                            while (k < len && list[k].body != body1 && list[k].otherBody != body2) {
                                k++;
                            }
                            list.splice(k, 1);
                            k = 0;
                            len = otherlist.length;
                            while (k < len && otherlist[k].body != body2 && otherlist[k].otherBody != body1) {
                                k++;
                            }
                            otherlist.splice(k, 1);
                        }
                        else {
                            if (ent1._level > ent2._level) {
                                if (slideOff.isX) {
                                    ent1.higherRightContact.body.higherRightContact = null;
                                    ent1.higherRightContact = null;
                                }
                                else {
                                    ent1.higherTopContact.body.higherTopContact = null;
                                    ent1.higherTopContact = null;
                                }
                            }
                            else {
                                if (slideOff.isX) {
                                    ent2.higherLeftContact.body.higherLeftContact = null;
                                    ent2.higherLeftContact = null;
                                }
                                else {
                                    ent2.higherBotContact.body.higherBotContact = null;
                                    ent2.higherBotContact = null;
                                }
                            }
                        }
                        console.log(this.simCount + ": slideoff: " + ent1.name + " " + ent2.name);
                        console.log(slideOff);
                    }
                }
            }
        }
    };
    World.prototype.slideOffs = function (ents, time, timeDelta) {
        var _this = this;
        var _loop_3 = function (e) {
            e.forallTopBody(function (b) {
                if (!b._isSensor) {
                    if (b.higherBotContact) {
                        _this.XSlideOff(false, b, b.higherBotContact, e, b.higherBotContact._entity, e._vx, b.higherBotContact._entity._simvx, e._lastTime, 0, e._lastx + b._x, b.higherBotContact._entity._x + b.higherBotContact._x, e._lasty + b._y > b.higherBotContact._entity._y + b.higherBotContact._y, time, timeDelta);
                    }
                    if (b.higherTopContact) {
                        _this.XSlideOff(true, b, b.higherTopContact, e, b.higherTopContact._entity, e._vx, b.higherTopContact._entity._simvx, e._lastTime, 0, e._lastx + b._x, b.higherTopContact._entity._x + b.higherTopContact._x, e._lasty + b._y > b.higherTopContact._entity._y + b.higherTopContact._y, time, timeDelta);
                    }
                    if (b.higherLeftContact) {
                        _this.YSlideOff(false, b, b.higherLeftContact, e, b.higherLeftContact._entity, e._vy, e.higherLeftContact.otherBody._entity._simvy, e._lastTime, 0, e._lasty + b._y, b.higherLeftContact._entity._y + b.higherLeftContact._y, e._lastx + b._x > b.higherLeftContact._entity._x + b.higherLeftContact._x, time, timeDelta);
                    }
                    if (b.higherRightContact) {
                        _this.YSlideOff(true, b, b.higherRightContact, e, b.higherRightContact._entity, e._vy, b.higherRightContact._entity._simvy, e._lastTime, 0, e._lasty + b._y, b.higherRightContact._entity._y + b.higherRightContact._y, e._lastx + b._x > b.higherRightContact._entity._x + b.higherRightContact._x, time, timeDelta);
                    }
                    for (var _i = 0, _a = b.botContacts; _i < _a.length; _i++) {
                        var contact = _a[_i];
                        _this.XSlideOff(false, b, contact, e, contact._entity, e._vx, contact._entity._vx, e._lastTime, contact._entity._lastTime, e._lastx + b._x, contact._entity._lastx + contact._x, e._lasty + b._y > contact._entity._lasty + contact._y, time, timeDelta);
                    }
                    for (var _b = 0, _c = b.topContacts; _b < _c.length; _b++) {
                        var contact = _c[_b];
                        _this.XSlideOff(true, b, contact, e, contact._entity, e._vx, contact._entity._vx, e._lastTime, contact._entity._lastTime, e._lastx + b._x, contact._entity._lastx + contact._x, e._lasty + b._y > contact._entity._lasty + contact._y, time, timeDelta);
                    }
                    for (var _d = 0, _e = b.leftContacts; _d < _e.length; _d++) {
                        var contact = _e[_d];
                        _this.YSlideOff(false, b, contact, e, contact._entity, e._vy, contact._entity._vy, e._lastTime, contact._entity._lastTime, e._lasty + b._y, contact._entity._lasty + contact._y, e._lastx + b._x > contact._entity._lastx + contact._x, time, timeDelta);
                    }
                    for (var _f = 0, _g = b.rightContacts; _f < _g.length; _f++) {
                        var contact = _g[_f];
                        _this.YSlideOff(true, b, contact, e, contact._entity, e._vy, contact._entity._vy, e._lastTime, contact._entity._lastTime, e._lasty + b._y, contact._entity._lasty + contact._y, e._lastx + b._x > contact._entity._lastx + contact._x, time, timeDelta);
                    }
                }
            });
        };
        for (var _i = 0, ents_26 = ents; _i < ents_26.length; _i++) {
            var e = ents_26[_i];
            _loop_3(e);
        }
    };
    World.prototype.XSlideOff = function (left1right2, b1, b2, e1, e2, v1, v2, t1, t2, x1, x2, oneHigherTwo, time, timeDelta) {
        var relx = v1 - v2, currx1 = x1 + (time - t1) * v1, currx2 = x2 + (time - t2) * v2, slideTime = -1, slide;
        if (relx > 0) {
            slideTime = (currx2 + b2.width / 2 - currx1 + b1.width / 2) / relx;
        }
        else if (relx < 0) {
            slideTime = (currx2 - b2.width / 2 - currx1 - b1.width / 2) / relx;
        }
        if (slideTime != -1 && slideTime < timeDelta) {
            if (oneHigherTwo) {
                slide = {
                    time: slideTime,
                    body1: b2,
                    body2: b1,
                    isX: false
                };
            }
            else {
                slide = {
                    time: slideTime,
                    body1: b1,
                    body2: b2,
                    isX: false
                };
            }
        }
        var i = 0, len = e1._slideOff.length;
        while (i < len && e1._slideOff[i].body1 != b2 && e1._slideOff[i].body2 != b2) {
            i++;
        }
        if (i < len) {
            e1._slideOff.splice(i, 1);
        }
        i = 0, len = e2._slideOff.length;
        while (i < len && e2._slideOff[i].body1 != b1 && e2._slideOff[i].body2 != b1) {
            i++;
        }
        if (i < len) {
            e2._slideOff.splice(i, 1);
        }
        if (slide) {
            if (e1._level == e2._level) {
                if (left1right2) {
                    e1._slideOff.push(slide);
                }
                else {
                    e2._slideOff.push(slide);
                }
            }
            else {
                if (e1._level > e2._level) {
                    e1._slideOff.push(slide);
                }
                else {
                    e2._slideOff.push(slide);
                }
            }
        }
    };
    World.prototype.YSlideOff = function (bot1top2, b1, b2, e1, e2, v1, v2, t1, t2, y1, y2, oneHigherTwo, time, timeDelta) {
        var rely = v1 - v2, slide, curry1 = y1 + (time - t1) * v1, curry2 = y2 + (time - t2) * v2, slideTime = -1;
        if (rely > 0) {
            slideTime = (curry2 + b2.height / 2 - curry1 + b1.height / 2) / rely;
        }
        else if (rely < 0) {
            slideTime = (curry2 - b2.height / 2 - curry1 - b1.height / 2) / rely;
        }
        if (slideTime != -1 && slideTime <= timeDelta) {
            if (oneHigherTwo) {
                slide = {
                    time: slideTime,
                    body1: b2,
                    body2: b1,
                    isX: true
                };
            }
            else {
                slide = {
                    time: slideTime,
                    body1: b1,
                    body2: b2,
                    isX: true
                };
            }
        }
        var i = 0, len = e1._slideOff.length;
        while (i < len && e1._slideOff[i].body1 != b2 && e1._slideOff[i].body2 != b2) {
            i++;
        }
        if (i < len) {
            e1._slideOff.splice(i, 1);
        }
        i = 0, len = e2._slideOff.length;
        while (i < len && e2._slideOff[i].body1 != b1 && e2._slideOff[i].body2 != b1) {
            i++;
        }
        if (i < len) {
            e2._slideOff.splice(i, 1);
        }
        if (slide) {
            if (e1._level == e2._level) {
                if (bot1top2) {
                    e1._slideOff.push(slide);
                }
                else {
                    e2._slideOff.push(slide);
                }
            }
            else {
                if (e1._level > e2._level) {
                    e1._slideOff.push(slide);
                }
                else {
                    e2._slideOff.push(slide);
                }
            }
        }
    };
    World.prototype.getAllConnexRects = function (ents, isX) {
        var res = [];
        for (var _i = 0, ents_27 = ents; _i < ents_27.length; _i++) {
            var current = ents_27[_i];
            if (!current._marked) {
                res.push(this.getConnexRects(current, isX));
            }
        }
        return res;
    };
    World.prototype.getConnexRects = function (rect, isX) {
        var current = rect, openset = [], res = [];
        while (current) {
            if (!current._marked) {
                res.push(current);
                current._marked = true;
                if (isX) {
                    for (var _i = 0, _a = current.leftContacts; _i < _a.length; _i++) {
                        var c = _a[_i];
                        openset.push(c.otherBody._entity);
                    }
                    for (var _b = 0, _c = current.rightContacts; _b < _c.length; _b++) {
                        var c = _c[_b];
                        openset.push(c.otherBody._entity);
                    }
                }
                else {
                    for (var _d = 0, _e = current.botContacts; _d < _e.length; _d++) {
                        var c = _e[_d];
                        openset.push(c.otherBody._entity);
                    }
                    for (var _f = 0, _g = current.topContacts; _f < _g.length; _f++) {
                        var c = _g[_f];
                        openset.push(c.otherBody._entity);
                    }
                }
            }
            current = openset.pop();
        }
        return res;
    };
    return World;
}());
exports.World = World;
var Clump = (function () {
    function Clump() {
    }
    Clump.prototype.initX = function (e) {
        this.left = e;
        this.right = e;
        this.simv = e._simvx;
        this.mass = e.mass;
        this.v = e._vx;
        this.rects = [e];
        this.minv = e.higherLeftContact ? e.higherLeftContact.otherBody._entity._simvx : -1000000;
        this.maxv = e.higherRightContact ? e.higherRightContact.otherBody._entity._simvx : 1000000;
        e._clump = this;
    };
    Clump.prototype.addRight = function (e) {
        this.right = e;
        this.mass += e.mass;
        this.simv += e._simvx;
        this.v = this.simv / this.mass;
        if (e.higherLeftContact) {
            this.minv = Math.max(e.higherLeftContact.otherBody._entity._simvx, this.minv);
        }
        if (e.higherRightContact) {
            this.maxv = Math.min(e.higherRightContact.otherBody._entity._simvx, this.maxv);
        }
        this.v = Math.max(this.v, this.minv);
        this.v = Math.min(this.v, this.maxv);
        this.rects.push(e);
        e._clump = this;
    };
    Clump.prototype.mergeRight = function (clump) {
        this.right = clump.right;
        this.mass += clump.mass;
        this.simv += clump.simv;
        this.v = this.simv / this.mass;
        this.rects.push.apply(this.rects, clump.rects);
        for (var _i = 0, _a = clump.rects; _i < _a.length; _i++) {
            var e = _a[_i];
            e._clump = this;
            if (e.higherLeftContact) {
                this.minv = Math.max(e.higherLeftContact.otherBody._entity._simvx, this.minv);
            }
            if (e.higherRightContact) {
                this.maxv = Math.min(e.higherRightContact.otherBody._entity._simvx, this.maxv);
            }
        }
        this.v = Math.max(this.v, this.minv);
        this.v = Math.min(this.v, this.maxv);
    };
    Clump.prototype.initY = function (e) {
        this.left = e;
        this.right = e;
        this.simv = e._simvy;
        this.mass = e.mass;
        this.v = e._vy;
        this.rects = [e];
        this.minv = e.higherBotContact ? e.higherBotContact.otherBody._entity._simvy : -1000000;
        this.maxv = e.higherTopContact ? e.higherTopContact.otherBody._entity._simvy : 1000000;
        e._clump = this;
    };
    Clump.prototype.addTop = function (e) {
        this.right = e;
        this.mass += e.mass;
        this.simv += e._simvy;
        this.v = this.simv / this.mass;
        if (e.higherBotContact) {
            this.minv = Math.max(e.higherBotContact.otherBody._entity._simvy, this.minv);
        }
        if (e.higherTopContact) {
            this.maxv = Math.min(e.higherTopContact.otherBody._entity._simvy, this.maxv);
        }
        this.v = Math.max(this.v, this.minv);
        this.v = Math.min(this.v, this.maxv);
        this.rects.push(e);
        e._clump = this;
    };
    Clump.prototype.mergeTop = function (clump) {
        this.right = clump.right;
        this.mass += clump.mass;
        this.simv += clump.simv;
        this.v = this.simv / this.mass;
        this.rects.push.apply(this.rects, clump.rects);
        for (var _i = 0, _a = clump.rects; _i < _a.length; _i++) {
            var e = _a[_i];
            e._clump = this;
            if (e.higherBotContact) {
                this.minv = Math.max(e.higherBotContact.otherBody._entity._simvy, this.minv);
            }
            if (e.higherTopContact) {
                this.maxv = Math.min(e.higherTopContact.otherBody._entity._simvy, this.maxv);
            }
        }
        this.v = Math.max(this.v, this.minv);
        this.v = Math.min(this.v, this.maxv);
    };
    return Clump;
}());
exports.Clump = Clump;
},{"./entity":2,"./math":3,"./vbh":4}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvUmVjdENvbGxpZGVyLnRzIiwic3JjL2VudGl0eS50cyIsInNyYy9tYXRoLnRzIiwic3JjL3ZiaC50cyIsInNyYy93b3JsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSwrQkFBaUM7QUFFakMsNkJBQXVCO0FBRXZCO0lBQ0ksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzdCLENBQUM7QUFGRCxrQ0FFQztBQUVELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLE1BQWMsQ0FBQyxZQUFZLEdBQUc7UUFDM0IsV0FBVyxFQUFFLFdBQVc7S0FDM0IsQ0FBQztBQUNOLENBQUM7Ozs7Ozs7O0FDWEQsMEJBQTJCO0FBRWhCLFFBQUEsU0FBUyxHQUFXLEdBQUcsQ0FBQTtBQUVsQztJQUVJLGdCQUFZLEtBQWUsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWEsRUFBRSxJQUFZLEVBQUUsVUFBa0I7UUFDOUYsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7UUFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7UUFFcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtRQUVwQixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBRVgsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7UUFFbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7UUFD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QUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUE7WUFDckIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFBO1lBQ3JCLENBQUM7UUFDTCxDQUFDO1FBRUQsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNmLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNaLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQTtZQUM1QixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1lBQzNCLENBQUM7UUFDTCxDQUFDO1FBRUQsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM1RCxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVELEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0QsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJ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Q0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ1QsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7WUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNmLENBQUM7SUFDTCxDQUFDO0lBRUQsRUFBRSxDQUFBLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMxQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQ3JCLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBRXhDLEVBQUUsQ0FBQSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1lBQ1osR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUE7WUFDaEIsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDVCxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUE7WUFDaEIsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7WUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNmLENBQUM7SUFDTCxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxFQUFFLEdBQUcs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LENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUN0RSxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQ3RFLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFDdEUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUN0RSxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQ3RFLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFDdEUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUN0RSxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7d0JBRTFFLE9BQUssZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBRSxFQUFFLElBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7b0JBQ2hHLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixFQUFFLENBQUEsQ0FBQyxJQUFFLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLEVBQUUsQ0FBQSxDQUFDLElBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUNiLElBQUksT0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUNyRSxPQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQ3JFLE9BQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFDdEUsT0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDOzRCQUV4RCxJQUFHLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBVztnQ0FDdEMsRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0NBQ1osSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQ25FLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFDbkUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUNwRSxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUE7b0NBRXhFLEtBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBWSxJQUFFLEVBQUUsQ0FBQyxFQUN4QixPQUFLLEVBQUUsT0FBSyxFQUFFLE9BQUssRUFBRSxPQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUE7Z0NBQy9FLENBQUM7NEJBQ0wsQ0FBQyxDQUFDLENBQUE7d0JBQ04sQ0FBQztvQkFDTCxDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUEsQ0FBQyxJQUFFLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQy9CLEVBQUUsQ0FBQSxDQUFDLElBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzRCQUNiLElBQUksT0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUNyRSxPQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQ3JFLE9BQUssR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLE1BQU0sR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFDdEUsT0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFFLENBQUMsTUFBTSxHQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDOzRCQUV4RCxJQUFH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QyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0lBQ0wsWUFBQztBQUFELENBbEhBLEFBa0hDLElBQUE7QUFsSFksc0JBQUsiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgd29ybGQgZnJvbSBcIi4vd29ybGRcIjtcclxuXHJcbmV4cG9ydCAqIGZyb20gXCIuL3dvcmxkXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXb3JsZCgpOiB3b3JsZC5Xb3JsZCB7XHJcbiAgICByZXR1cm4gbmV3IHdvcmxkLldvcmxkKCk7XHJcbn1cclxuXHJcbmlmICh3aW5kb3cgIT0gbnVsbCkge1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLlJlY3RDb2xsaWRlciA9IHsgXHJcbiAgICAgICAgY3JlYXRlV29ybGQ6IGNyZWF0ZVdvcmxkIFxyXG4gICAgfTtcclxufSIsImltcG9ydCAqIGFzIHdvIGZyb20gXCIuL3dvcmxkXCJcclxuaW1wb3J0ICogYXMgdmIgZnJvbSBcIi4vdmJoXCJcclxuXHJcbmV4cG9ydCBsZXQgQUFCQl9TS0lOOiBudW1iZXIgPSAwLjJcclxuXHJcbmV4cG9ydCBjbGFzcyBFbnRpdHkgaW1wbGVtZW50cyB2Yi5JTW92ZUFBQkIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdvcmxkOiB3by5Xb3JsZCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIGxldmVsOiBudW1iZXIsIG5hbWU6IHN0cmluZywgY2hpbGRDb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fd29ybGQgPSB3b3JsZFxyXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlXHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgICAgICB0aGlzLl9sZXZlbCA9IGxldmVsXHJcbiAgICAgICAgdGhpcy5fbWFzcyA9IDBcclxuICAgICAgICB0aGlzLmZpeE1hc3MgPSBmYWxzZVxyXG5cclxuICAgICAgICB0aGlzLl94ID0geFxyXG4gICAgICAgIHRoaXMuX3kgPSB5XHJcblxyXG4gICAgICAgIHRoaXMuX3BhcmVudCA9IG51bGxcclxuXHJcbiAgICAgICAgdGhpcy5yZWx2eCA9IDBcclxuICAgICAgICB0aGlzLnJlbHZ5ID0gMFxyXG5cclxuICAgICAgICB0aGlzLmF4ID0gMFxyXG4gICAgICAgIHRoaXMuYXkgPSAwXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5sZWZ0Q29udGFjdHMgPSBbXVxyXG4gICAgICAgIHRoaXMudG9wQ29udGFjdHMgPSBbXVxyXG4gICAgICAgIHRoaXMuYm90Q29udGFjdHMgPSBbXVxyXG4gICAgICAgIHRoaXMucmlnaHRDb250YWN0cyA9IFtdXHJcblxyXG4gICAgICAgIHRoaXMuX3BvdENvbnRhY3QgPSBbXVxyXG4gICAgICAgIHRoaXMuX3NsaWRlT2ZmID0gW11cclxuICAgICAgICB0aGlzLl90bXBub2NvbGwgPSBbXVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tIEhJRVJBUkNIWVxyXG4gICAgX3dvcmxkOiB3by5Xb3JsZFxyXG5cclxuICAgIF9hbGxCb2R5Q2hpbGRzOiB2Yi5WQkg8Qm9keT5cclxuICAgIF9ib2R5Q2hpbGRzOiB2Yi5WQkg8Qm9keT4gfCBCb2R5XHJcbiAgICBfY2hpbGRzOiB2Yi5WQkg8RW50aXR5PlxyXG5cclxuICAgIF9lbmFibGVkOiBib29sZWFuXHJcbiAgICBfcHJlc2VudDogYm9vbGVhblxyXG5cclxuICAgIC8vIC0tIFNUQVRJQyBQUk9QRVJUSUVTXHJcbiAgICBuYW1lOiBzdHJpbmdcclxuICAgIF9sZXZlbDogbnVtYmVyXHJcbiAgICBfbWFzczogbnVtYmVyXHJcbiAgICBmaXhNYXNzOiBib29sZWFuXHJcblxyXG4gICAgLy8gLS0gUE9TSVRJT05cclxuICAgIF94OiBudW1iZXJcclxuICAgIF95OiBudW1iZXJcclxuXHJcbiAgICAvLyAtLSBGT0xMT1dJTkdcclxuICAgIF9wYXJlbnQ6IEVudGl0eSAvLyBhIHJlY3Qgb2YgaGlnaGVyIGxldmVsXHJcbiAgICBfcGFyZW50VHlwZTogbnVtYmVyIC8vIDA6IGZvbGxvdywgMTogcmVsYXRpdmUsIDI6IHN0YXRpY1xyXG5cclxuICAgIC8vIC0tIE1PVkVcclxuICAgIHJlbHZ4OiBudW1iZXJcclxuICAgIHJlbHZ5OiBudW1iZXJcclxuXHJcbiAgICBfdng6IG51bWJlclxyXG4gICAgX3Z5OiBudW1iZXJcclxuXHJcbiAgICBheDogbnVtYmVyXHJcbiAgICBheTogbnVtYmVyXHJcbiAgICBcclxuICAgIC8vIC0tIENPTlRBQ1RcclxuICAgIGxlZnRDb250YWN0czogQ29udGFjdFtdIC8vIHdpdGggc2FtZSBsZXZlbCBvciBoaWdoZXJcclxuICAgIHRvcENvbnRhY3RzOiBDb250YWN0W11cclxuICAgIGJvdENvbnRhY3RzOiBDb250YWN0W11cclxuICAgIHJpZ2h0Q29udGFjdHM6IENvbnRhY3RbXVxyXG5cclxuICAgIGhpZ2hlckxlZnRDb250YWN0OiBDb250YWN0IC8vIHdpdGggaGlnaGVyIGxldmVsXHJcbiAgICBoaWdoZXJUb3BDb250YWN0OiBDb250YWN0XHJcbiAgICBoaWdoZXJCb3RDb250YWN0OiBDb250YWN0XHJcbiAgICBoaWdoZXJSaWdodENvbnRhY3Q6IENvbnRhY3RcclxuICAgIFxyXG4gICAgLy8gLS0gQUFCQlxyXG4gICAgbWlueDogbnVtYmVyXHJcbiAgICBtYXh4OiBudW1iZXJcclxuICAgIG1pbnk6IG51bWJlclxyXG4gICAgbWF4eTogbnVtYmVyXHJcblxyXG4gICAgLy8gSElFUkFSQ0hZXHJcbiAgICBnZXQgd29ybGQoKTogd28uV29ybGQgeyByZXR1cm4gdGhpcy5fd29ybGQgfVxyXG5cclxuICAgIGdldCBlbmFibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZW5hYmxlZH1cclxuICAgIHNldCBlbmFibGVkKHZhbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSB2YWxcclxuICAgICAgICBpZih2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JhbGxUb3BCb2R5KChiOiBCb2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihiLl9lbmFibGVkID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBiLl9lbmFibGVkID0gMVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGIuX2VuYWJsZWQgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGIuX2VuYWJsZWQgPSAzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JhbGxUb3BCb2R5KChiOiBCb2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZihiLl9lbmFibGVkID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBiLl9lbmFibGVkID0gMFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKGIuX2VuYWJsZWQgPT0gMykge1xyXG4gICAgICAgICAgICAgICAgICAgIGIuX2VuYWJsZWQgPSAyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBwcmVzZW50KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcHJlc2VudCB9XHJcbiAgICBzZXQgcHJlc2VudCh2YWw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZih2YWwpIHtcclxuICAgICAgICAgICAgaWYoIXRoaXMuX3ByZXNlbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX3ByZXNlbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgcGFyZW50KCk6IEVudGl0eSB7IHJldHVybiB0aGlzLl9wYXJlbnQgfVxyXG4gICAgc2V0IHBhcmVudCh2YWw6IEVudGl0eSkge1xyXG4gICAgICAgIGlmKHRoaXMuX3BhcmVudCAmJiB2YWwgIT0gdGhpcy5fcGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMudW5QYXJlbnQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih2YWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRQYXJlbnQodmFsLCB0aGlzLl9wYXJlbnRUeXBlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgXHJcbiAgICBzZXRQYXJlbnQoZW50OiBFbnRpdHksIHR5cGU6IG51bWJlcikge1xyXG4gICAgICAgIGlmKHRoaXMuX3BhcmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLnVuUGFyZW50KClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BhcmVudCA9IGVudFxyXG4gICAgICAgIHRoaXMuX3BhcmVudFR5cGUgPSB0eXBlXHJcblxyXG4gICAgICAgIHRoaXMucmVsdnggLT0gZW50Ll92eFxyXG4gICAgICAgIHRoaXMucmVsdnkgLT0gZW50Ll92eVxyXG4gICAgICAgIGlmKCFlbnQuX2NoaWxkcykge1xyXG4gICAgICAgICAgICBlbnQuX2NoaWxkcyA9IG5ldyB2Yi5TaW1wbGVWQkg8RW50aXR5PigpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVudC5fY2hpbGRzLmluc2VydCh0aGlzKVxyXG5cclxuICAgICAgICBpZih0eXBlID09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5feCAtPSBlbnQuZ2xvYmFsWFxyXG4gICAgICAgICAgICB0aGlzLl95IC09IGVudC5nbG9iYWxZXHJcblxyXG4gICAgICAgICAgICAvLyBmaW5kIHRvcCBcclxuICAgICAgICAgICAgbGV0IHRvcDogRW50aXR5ID0gdGhpcywgeCA9IDAsIHkgPSAwXHJcbiAgICAgICAgICAgIHdoaWxlKHRvcC5fcGFyZW50ICYmIHRvcC5fcGFyZW50VHlwZSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB4ICs9IHRvcC5feFxyXG4gICAgICAgICAgICAgICAgeSArPSB0b3AuX3lcclxuICAgICAgICAgICAgICAgIHRvcCA9IHRvcC5fcGFyZW50XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHB1dCBhbGwgYm9kaWVzIGluIHRoZSB0b3BcclxuICAgICAgICAgICAgaWYoIXRvcC5fYWxsQm9keUNoaWxkcykge1xyXG4gICAgICAgICAgICAgICAgdG9wLl9hbGxCb2R5Q2hpbGRzID0gbmV3IHZiLlNpbXBsZVZCSDxCb2R5PigpXHJcbiAgICAgICAgICAgICAgICBpZighdG9wLl9ib2R5Q2hpbGRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodG9wLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgQm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuX2FsbEJvZHlDaGlsZHMuaW5zZXJ0KHRvcC5fYm9keUNoaWxkcylcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AuX2JvZHlDaGlsZHMuZm9yYWxsKChiOiBCb2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3AuX2FsbEJvZHlDaGlsZHMuaW5zZXJ0KGIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZvcmFsbFRvcEJvZHkoKGI6IEJvZHkpID0+IHtcclxuICAgICAgICAgICAgICAgIGIuX3ggKz0geFxyXG4gICAgICAgICAgICAgICAgYi5feSArPSB5XHJcbiAgICAgICAgICAgICAgICB0b3AuX2FsbEJvZHlDaGlsZHMuaW5zZXJ0KGIpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGlmKHRoaXMuX2FsbEJvZHlDaGlsZHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2FsbEJvZHlDaGlsZHMuY2xlYXIoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWxsQm9keUNoaWxkcyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fd29ybGQudmJoLnJlbW92ZSh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLl93b3JsZC5lbnRzW3RoaXMuX2xldmVsXS5zcGxpY2UodGhpcy5fd29ybGQuZW50c1t0aGlzLl9sZXZlbF0uaW5kZXhPZih0aGlzKSwgMSlcclxuICAgICAgICB9IGVsc2UgaWYodHlwZSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dvcmxkLmVudHNbdGhpcy5fbGV2ZWxdLnNwbGljZSh0aGlzLl93b3JsZC5lbnRzW3RoaXMuX2xldmVsXS5pbmRleE9mKHRoaXMpLCAxKVxyXG4gICAgICAgICAgICB0aGlzLl9sZXZlbCA9IGVudC5fbGV2ZWxcclxuICAgICAgICAgICAgdGhpcy5fd29ybGQuZW50c1t0aGlzLl9sZXZlbF0ucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVuUGFyZW50KCkge1xyXG4gICAgICAgIGlmKHRoaXMuX3BhcmVudCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYodGhpcy5fcGFyZW50VHlwZSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl94ICs9IHRoaXMuX3BhcmVudC5nbG9iYWxYXHJcbiAgICAgICAgICAgICAgICB0aGlzLl95ICs9IHRoaXMuX3BhcmVudC5nbG9iYWxZXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbHZ4ID0gdGhpcy5fcGFyZW50Ll92eFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWx2eSA9IHRoaXMuX3BhcmVudC5fdnlcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVsdnggKz0gdGhpcy5fcGFyZW50Ll92eFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWx2eSArPSB0aGlzLl9wYXJlbnQuX3Z5XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5fY2hpbGRzLnJlbW92ZSh0aGlzKVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5fcGFyZW50VHlwZSA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaW5kIHRvcCBcclxuICAgICAgICAgICAgICAgIGxldCB0b3A6IEVudGl0eSA9IHRoaXMsIHggPSAwLCB5ID0gMFxyXG4gICAgICAgICAgICAgICAgd2hpbGUodG9wLl9wYXJlbnQgJiYgdG9wLl9wYXJlbnRUeXBlID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ICs9IHRvcC5feFxyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gdG9wLl95XHJcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gdG9wLl9wYXJlbnRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBwdXQgYWxsIGJvZGllcyBpbiB0aGUgdG9wXHJcbiAgICAgICAgICAgICAgICAvLyBpcyB0aGUgdG9wIG9mIGEgbmV3IGVudGl0eSBoaWVyYXJjaHk/XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhdGljUGFyZW50ID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NoaWxkcy5mb3JhbGwoKGU6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRpY1BhcmVudCA9IHN0YXRpY1BhcmVudCB8fCBlLl9wYXJlbnRUeXBlID09IDJcclxuICAgICAgICAgICAgICAgIH0pXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gd2hpY2ggbGlzdCB0byBzZW5kIGJvZGllcyB0b1xyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGljUGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxsQm9keUNoaWxkcyA9IG5ldyB2Yi5TaW1wbGVWQkg8Qm9keT4oKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5zZXQgPSBbXVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB3aGlsZShjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnQuX2JvZHlDaGlsZHMgaW5zdGFuY2VvZiBCb2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Ll9ib2R5Q2hpbGRzLl94IC09IHhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuX2JvZHlDaGlsZHMuX3kgLT0geVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wLl9hbGxCb2R5Q2hpbGRzLnJlbW92ZShjdXJyZW50Ll9ib2R5Q2hpbGRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxsQm9keUNoaWxkcy5pbnNlcnQoY3VycmVudC5fYm9keUNoaWxkcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuX2JvZHlDaGlsZHMuZm9yYWxsKChiOiBCb2R5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYi5feCAtPSB4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYi5feSAtPSB5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wLl9hbGxCb2R5Q2hpbGRzLnJlbW92ZShiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FsbEJvZHlDaGlsZHMuaW5zZXJ0KGIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50Ll9jaGlsZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuX2NoaWxkcy5mb3JhbGwoKGU6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGUuX3BhcmVudFR5cGUgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuc2V0LnB1c2goZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gb3BlbnNldC5wb3AoKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fcGFyZW50ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhZGRSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbWFzczogbnVtYmVyLCBkZW5zaXR5OiBudW1iZXIpOiBSZWN0IHtcclxuICAgICAgICByZXR1cm4gbmV3IFJlY3QodGhpcywgeCwgeSwgd2lkdGgsIGhlaWdodCwgbWFzcywgZGVuc2l0eSlcclxuICAgIH1cclxuICAgIGFkZExlZnRMaW5lKHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIG9uZXdheTogYm9vbGVhbiwgbWFzczogbnVtYmVyLCBkZW5zaXR5OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFZlcnRMaW5lKHRoaXMsIHgsIHksIHNpemUsIG9uZXdheSwgbWFzcywgZGVuc2l0eSwgZmFsc2UpXHJcbiAgICB9XHJcbiAgICBhZGRSaWdodExpbmUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgb25ld2F5OiBib29sZWFuLCBtYXNzOiBudW1iZXIsIGRlbnNpdHk6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiBuZXcgVmVydExpbmUodGhpcywgeCwgeSwgc2l6ZSwgb25ld2F5LCBtYXNzLCBkZW5zaXR5LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgYWRkVG9wTGluZSh4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBvbmV3YXk6IGJvb2xlYW4sIG1hc3M6IG51bWJlciwgZGVuc2l0eTogbnVtYmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIb3JMaW5lKHRoaXMsIHgsIHksIHNpemUsIG9uZXdheSwgbWFzcywgZGVuc2l0eSwgZmFsc2UpXHJcbiAgICB9XHJcbiAgICBhZGRCb3RMaW5lKHg6IG51bWJlciwgeTogbnVtYmVyLCBzaXplOiBudW1iZXIsIG9uZXdheTogYm9vbGVhbiwgbWFzczogbnVtYmVyLCBkZW5zaXR5OiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEhvckxpbmUodGhpcywgeCwgeSwgc2l6ZSwgb25ld2F5LCBtYXNzLCBkZW5zaXR5LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgYWRkQm9keShib2R5OiBCb2R5LCB4PzogbnVtYmVyLCB5PzogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYoYm9keS5fZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGJvZHkuX2VudGl0eS5yZW1vdmVCb2R5KGJvZHkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJvZHkuX2VudGl0eSA9IHRoaXNcclxuICAgICAgICBpZih4ICE9IG51bGwpIHsgYm9keS5feCA9IHggfVxyXG4gICAgICAgIGlmKHkgIT0gbnVsbCkgeyBib2R5Ll95ID0geSB9XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLl9ib2R5Q2hpbGRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHlDaGlsZHMgPSBib2R5XHJcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuX2JvZHlDaGlsZHMgaW5zdGFuY2VvZiBCb2R5KSB7XHJcbiAgICAgICAgICAgIGxldCBiID0gdGhpcy5fYm9keUNoaWxkc1xyXG4gICAgICAgICAgICB0aGlzLl9ib2R5Q2hpbGRzID0gbmV3IHZiLlNpbXBsZVZCSDxCb2R5PigpXHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHlDaGlsZHMuaW5zZXJ0KGIpXHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHlDaGlsZHMuaW5zZXJ0KGJvZHkpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fYm9keUNoaWxkcy5pbnNlcnQoYm9keSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3A6IEVudGl0eSA9IHRoaXMsIHJlbHggPSBib2R5Ll94LCByZWx5ID0gYm9keS5feVxyXG4gICAgICAgIHdoaWxlKHRvcC5fcGFyZW50ICYmIHRvcC5fcGFyZW50VHlwZSA9PSAyKSB7XHJcbiAgICAgICAgICAgIHJlbHggKz0gdG9wLl94XHJcbiAgICAgICAgICAgIHJlbHkgKz0gdG9wLl95XHJcbiAgICAgICAgICAgIHRvcCA9IHRvcC5fcGFyZW50XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0b3AuX2FsbEJvZHlDaGlsZHMpIHtcclxuICAgICAgICAgICAgdG9wLl9hbGxCb2R5Q2hpbGRzLmluc2VydChib2R5KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYm9keS5feCA9IHJlbHhcclxuICAgICAgICBib2R5Ll95ID0gcmVseVxyXG5cclxuICAgICAgICBpZih0aGlzLl9lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIGlmKGJvZHkuX2VuYWJsZWQgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5fZW5hYmxlZCA9IDFcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGJvZHkuX2VuYWJsZWQgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgYm9keS5fZW5hYmxlZCA9IDNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKGJvZHkuX2VuYWJsZWQgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgYm9keS5fZW5hYmxlZCA9IDBcclxuICAgICAgICAgICAgfSBlbHNlIGlmKGJvZHkuX2VuYWJsZWQgPT0gMykge1xyXG4gICAgICAgICAgICAgICAgYm9keS5fZW5hYmxlZCA9IDJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZighdGhpcy5maXhNYXNzKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX21hc3MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX21hc3MgKz0gYm9keS5fbWFzc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWFzcyA9IGJvZHkuX21hc3NcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdG9wLm1pbnggPSBNYXRoLm1pbih0b3AubWlueCwgcmVseCArIGJvZHkuX3ggLSBib2R5LndpZHRoLzIpXHJcbiAgICAgICAgdG9wLm1heHggPSBNYXRoLm1pbih0b3AubWF4eCwgcmVseCArIGJvZHkuX3ggKyBib2R5LndpZHRoLzIpXHJcbiAgICAgICAgdG9wLm1pbnkgPSBNYXRoLm1pbih0b3AubWlueSwgcmVseSArIGJvZHkuX3kgLSBib2R5LmhlaWdodC8yKVxyXG4gICAgICAgIHRvcC5tYXh5ID0gTWF0aC5taW4odG9wLm1heHksIHJlbHkgKyBib2R5Ll95ICsgYm9keS5oZWlnaHQvMilcclxuICAgIH1cclxuICAgIHJlbW92ZUJvZHkoYm9keTogQm9keSkge1xyXG4gICAgICAgIGlmKHRoaXMuX2JvZHlDaGlsZHMgaW5zdGFuY2VvZiBCb2R5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2JvZHlDaGlsZHMgPSBudWxsXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fYm9keUNoaWxkcy5yZW1vdmUoYm9keSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0b3A6IEVudGl0eSA9IHRoaXMsIHggPSBib2R5Ll94LCB5ID0gYm9keS5feVxyXG4gICAgICAgIHdoaWxlKHRvcC5fcGFyZW50ICYmIHRvcC5fcGFyZW50VHlwZSA9PSAyKSB7IFxyXG4gICAgICAgICAgICB0b3AgPSB0b3AuX3BhcmVudCBcclxuICAgICAgICAgICAgeCAtPSB0b3AuX3hcclxuICAgICAgICAgICAgeSAtPSB0b3AuX3lcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxpc3Q6IHZiLlZCSDxCb2R5PlxyXG4gICAgICAgIGlmKHRvcC5fYWxsQm9keUNoaWxkcykge1xyXG4gICAgICAgICAgICB0b3AuX2FsbEJvZHlDaGlsZHMucmVtb3ZlKGJvZHkpXHJcbiAgICAgICAgICAgIGxpc3QgPSB0b3AuX2FsbEJvZHlDaGlsZHNcclxuICAgICAgICB9IGVsc2UgaWYodG9wLl9ib2R5Q2hpbGRzKSB7XHJcbiAgICAgICAgICAgIGxpc3QgPSA8dmIuVkJIPEJvZHk+PnRvcC5fYm9keUNoaWxkc1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZihsaXN0KSB7XHJcbiAgICAgICAgICAgIGlmKHRvcC5taW54ID09IGJvZHkuX3ggLSBib2R5LndpZHRoLzIpIHsgXHJcbiAgICAgICAgICAgICAgICB0b3AubWlueCA9IDEwMDAwMFxyXG4gICAgICAgICAgICAgICAgbGlzdC5mb3JhbGwoKGI6IEJvZHkpID0+IHsgdG9wLm1pbnggPSBNYXRoLm1pbih0b3AubWlueCwgYi5feCAtIGIud2lkdGgvMikgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0b3AubWF4eCA9PSBib2R5Ll94ICsgYm9keS53aWR0aC8yKSB7XHJcbiAgICAgICAgICAgICAgICB0b3AubWF4eCA9IC0xMDAwMDBcclxuICAgICAgICAgICAgICAgIGxpc3QuZm9yYWxsKChiOiBCb2R5KSA9PiB7IHRvcC5tYXh4ID0gTWF0aC5tYXgodG9wLm1heHgsIGIuX3ggKyBiLndpZHRoLzIpIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodG9wLm1pbnkgPT0gYm9keS5feSAtIGJvZHkuaGVpZ2h0LzIpIHsgXHJcbiAgICAgICAgICAgICAgICB0b3AubWlueSA9IDEwMDAwMFxyXG4gICAgICAgICAgICAgICAgbGlzdC5mb3JhbGwoKGI6IEJvZHkpID0+IHsgdG9wLm1pbnkgPSBNYXRoLm1pbih0b3AubWlueSwgYi5feSAtIGIuaGVpZ2h0LzIpIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodG9wLm1heHggPT0gYm9keS5feSArIGJvZHkuaGVpZ2h0LzIpIHtcclxuICAgICAgICAgICAgICAgIHRvcC5tYXh4ID0gLTEwMDAwMFxyXG4gICAgICAgICAgICAgICAgbGlzdC5mb3JhbGwoKGI6IEJvZHkpID0+IHsgdG9wLm1heHggPSBNYXRoLm1heCh0b3AubWF4eCwgYi5feSArIGIuaGVpZ2h0LzIpIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJvZHkuX3ggPSB0b3AuX3ggKyB4XHJcbiAgICAgICAgYm9keS5feSA9IHRvcC5feSArIHlcclxuICAgICAgICBib2R5Ll9lbnRpdHkgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgZm9yYWxsVG9wQm9keShmdW5jOiAoYjogQm9keSkgPT4gdm9pZCkge1xyXG4gICAgICAgIGlmKHRoaXMuX2FsbEJvZHlDaGlsZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fYWxsQm9keUNoaWxkcy5mb3JhbGwoZnVuYylcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZih0aGlzLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgQm9keSkge1xyXG4gICAgICAgICAgICAgICAgZnVuYyh0aGlzLl9ib2R5Q2hpbGRzKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYm9keUNoaWxkcy5mb3JhbGwoZnVuYylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLSBTVEFUSUMgUFJPUEVSVElFU1xyXG4gICAgZ2V0IGxldmVsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9sZXZlbCB9XHJcblxyXG4gICAgZ2V0IG1hc3MoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX21hc3MgfVxyXG4gICAgc2V0IG1hc3ModmFsOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9tYXNzID0gdmFsXHJcbiAgICAgICAgdGhpcy5maXhNYXNzID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tIFBPU0lUSU9OXHJcbiAgICBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCB9XHJcbiAgICBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feSB9XHJcblxyXG4gICAgc2V0IHgodmFsOiBudW1iZXIpIHsgdGhpcy5feCA9IHZhbCB9XHJcbiAgICBzZXQgeSh2YWw6IG51bWJlcikgeyB0aGlzLl95ID0gdmFsIH1cclxuXHJcbiAgICBnZXQgZ2xvYmFsWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCArICh0aGlzLl9wYXJlbnQgPyB0aGlzLl9wYXJlbnQuZ2xvYmFsWCA6IDApIH1cclxuICAgIGdldCBnbG9iYWxZKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95ICsgKHRoaXMuX3BhcmVudCA/IHRoaXMuX3BhcmVudC5nbG9iYWxZIDogMCkgfVxyXG5cclxuICAgIHNldCBnbG9iYWxYKHZhbDogbnVtYmVyKSB7IHRoaXMuX3ggPSB2YWwgLSAodGhpcy5fcGFyZW50ID8gdGhpcy5fcGFyZW50Lmdsb2JhbFggOiAwKSB9XHJcbiAgICBzZXQgZ2xvYmFsWSh2YWw6IG51bWJlcikgeyB0aGlzLl95ID0gdmFsIC0gKHRoaXMuX3BhcmVudCA/IHRoaXMuX3BhcmVudC5nbG9iYWxZIDogMCkgfVxyXG5cclxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5feCA9IHhcclxuICAgICAgICB0aGlzLl95ID0geVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tIE1PVkVcclxuICAgIGdldCB2eCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdnggfVxyXG4gICAgZ2V0IHZ5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl92eSB9XHJcblxyXG4gICAgc2V0IHZ4KHZhbDogbnVtYmVyKSB7IHRoaXMucmVsdnggPSB0aGlzLl9wYXJlbnQ/IHZhbCAtIHRoaXMuX3BhcmVudC5fdnggOiB2YWwgfVxyXG4gICAgc2V0IHZ5KHZhbDogbnVtYmVyKSB7IHRoaXMucmVsdnkgPSB0aGlzLl9wYXJlbnQ/IHZhbCAtIHRoaXMuX3BhcmVudC5fdnkgOiB2YWwgfVxyXG5cclxuICAgIGFkZEZvcmNlKGZ4OiBudW1iZXIsIGZ5OiBudW1iZXIpIHtcclxuICAgICAgICBpZih0aGlzLm1hc3MpIHtcclxuICAgICAgICAgICAgdGhpcy5heCArPSBmeCAvIHRoaXMubWFzc1xyXG4gICAgICAgICAgICB0aGlzLmF5ICs9IGZ5IC8gdGhpcy5tYXNzXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkSW1wdWxzZShpeDogbnVtYmVyLCBpeTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYodGhpcy5fbWFzcykge1xyXG4gICAgICAgICAgICB0aGlzLnJlbHZ4ICs9IGl4IC8gdGhpcy5fbWFzc1xyXG4gICAgICAgICAgICB0aGlzLnJlbHZ5ICs9IGl5IC8gdGhpcy5fbWFzc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gLS0gQ09OVEFDVFxyXG4gICAgZ2V0IGhhc0xlZnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmxlZnRDb250YWN0cy5sZW5ndGggPiAwIH1cclxuICAgIGdldCBoYXNUb3AoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnRvcENvbnRhY3RzLmxlbmd0aCA+IDAgfVxyXG4gICAgZ2V0IGhhc0JvdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuYm90Q29udGFjdHMubGVuZ3RoID4gMCB9XHJcbiAgICBnZXQgaGFzUmlnaHQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnJpZ2h0Q29udGFjdHMubGVuZ3RoID4gMCB9XHJcblxyXG4gICAgZ2V0IGhhc0hpZ2hMZWZ0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oaWdoZXJMZWZ0Q29udGFjdCAhPSBudWxsIH1cclxuICAgIGdldCBoYXNIaWdoVG9wKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oaWdoZXJUb3BDb250YWN0ICE9IG51bGwgfVxyXG4gICAgZ2V0IGhhc0hpZ2hCb3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlckJvdENvbnRhY3QgIT0gbnVsbCB9XHJcbiAgICBnZXQgaGFzSGlnaFJpZ2h0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oaWdoZXJSaWdodENvbnRhY3QgIT0gbnVsbCB9XHJcblxyXG4gICAgZ2V0IGhhc0FueUxlZnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlckxlZnRDb250YWN0ICE9IG51bGwgfHwgdGhpcy5sZWZ0Q29udGFjdHMubGVuZ3RoID4gMCB9XHJcbiAgICBnZXQgaGFzQW55VG9wKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oaWdoZXJUb3BDb250YWN0ICE9IG51bGwgfHwgdGhpcy50b3BDb250YWN0cy5sZW5ndGggPiAwIH1cclxuICAgIGdldCBoYXNBbnlCb3QoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlckJvdENvbnRhY3QgIT0gbnVsbCB8fCB0aGlzLmJvdENvbnRhY3RzLmxlbmd0aCA+IDAgfVxyXG4gICAgZ2V0IGhhc0FueVJpZ2h0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5oaWdoZXJSaWdodENvbnRhY3QgIT0gbnVsbCB8fCB0aGlzLnJpZ2h0Q29udGFjdHMubGVuZ3RoID4gMCB9ICBcclxuXHJcbiAgICAvLyAtLSBNT1ZFIEFBQkJcclxuICAgIGdldCBtb3ZlTWlueCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCArIHRoaXMubWlueCAtIE1hdGguYWJzKHRoaXMuX3Z4LzIpIC0gQUFCQl9TS0lOIH1cclxuICAgIGdldCBtb3ZlTWF4eCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCArIHRoaXMubWF4eCArIE1hdGguYWJzKHRoaXMuX3Z4LzIpICsgQUFCQl9TS0lOIH1cclxuICAgIGdldCBtb3ZlTWlueSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feSArIHRoaXMubWlueSAtIE1hdGguYWJzKHRoaXMuX3Z5LzIpIC0gQUFCQl9TS0lOIH1cclxuICAgIGdldCBtb3ZlTWF4eSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feSArIHRoaXMubWF4eSAtIE1hdGguYWJzKHRoaXMuX3Z5LzIpICsgQUFCQl9TS0lOIH1cclxuXHJcbiAgICBnZXQgd2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMubWF4eCAtIHRoaXMubWlueCB9XHJcbiAgICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLm1heHkgLSB0aGlzLm1pbnkgfVxyXG5cclxuICAgIC8vIEZPUiBWQkhcclxuICAgIGdldCBfbGF5ZXIoKTogbnVtYmVyIHsgcmV0dXJuIC0xIH1cclxuICAgIGdldCBfbGF5ZXJncm91cCgpOiBudW1iZXIgeyByZXR1cm4gLTEgfVxyXG5cclxuICAgIGdldCBsZWZ0Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWUgfVxyXG4gICAgZ2V0IHJpZ2h0Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWUgfVxyXG4gICAgZ2V0IHRvcENvbGxpZGUoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlIH1cclxuICAgIGdldCBib3RDb2xsaWRlKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZSB9XHJcblxyXG4gICAgLy8gLS0gU0lNVUxBVElPTiBDQUNIRUQgSU5GT1JNQVRJT05cclxuICAgIC8vIG11bHRpcGxlIHVzZTpcclxuICAgIC8vIC0gZHVyaW5nIHNpbXVsYXRpb24gb2YgdGhlIHJlY3RzIGxldmVsOiB1c2VkIHRvIHJlcHJlc2VudCB0aGUgZW5lcmd5IGNvbnRyaWJ1dGlvblxyXG4gICAgLy8gLSBkdXJpbmcgbG93ZXIgbGV2ZWwgc2ltdWxhdGlvbnM6IHVzZWQgdG8gcmVwcmVzZW50IHRoZSB2aXJ0dWFsIHNwZWVkIHJlcXVpcmVkIHRvIG1vdmUgXHJcbiAgICAvLyBpbiBhIGxpbmVhciBmYXNoaW9uIGZyb20gc3RhcnQgdG8gZmluaXNoXHJcbiAgICBfc2ltdng6IG51bWJlciBcclxuICAgIF9zaW12eTogbnVtYmVyXHJcblxyXG4gICAgX3BvdENvbnRhY3Q6IENvbnRhY3RbXSAvLyBjb250YWN0IHdpdGggaGlnaGVyIG9yIHNhbWUgbGV2ZWwgUmVjdHNcclxuICAgIF9zbGlkZU9mZjogU2xpZGVPZmZbXVxyXG4gICAgX3RtcG5vY29sbDogQ29udGFjdFtdXHJcblxyXG4gICAgX25hcnJvd0NvdW50OiBudW1iZXJcclxuXHJcbiAgICBfbWFya2VkOiBib29sZWFuXHJcblxyXG4gICAgX2xhc3RUaW1lOiBudW1iZXJcclxuICAgIF9sYXN0eDogbnVtYmVyXHJcbiAgICBfbGFzdHk6IG51bWJlclxyXG5cclxuICAgIF9jbHVtcDogd28uQ2x1bXBcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJvZHkgaW1wbGVtZW50cyB2Yi5JQUFCQiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZW50OiBFbnRpdHksIHg6IG51bWJlciwgeTogbnVtYmVyLCBtYXNzOiBudW1iZXIsIGRlbnNpdHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3ggPSB4XHJcbiAgICAgICAgdGhpcy5feSA9IHlcclxuXHJcbiAgICAgICAgaWYoZGVuc2l0eSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX21hc3MgPSBtYXNzXHJcbiAgICAgICAgICAgIHRoaXMuX2RlbnNpdHkgPSAtMVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlbnNpdHkgPSBkZW5zaXR5XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9sYXllciA9IDBcclxuICAgICAgICB0aGlzLmxheWVyR3JvdXAgPSAwXHJcblxyXG4gICAgICAgIHRoaXMuX2VuYWJsZWQgPSAzXHJcblxyXG4gICAgICAgIHRoaXMubGVmdENvbnRhY3RzID0gW11cclxuICAgICAgICB0aGlzLnRvcENvbnRhY3RzID0gW11cclxuICAgICAgICB0aGlzLmJvdENvbnRhY3RzID0gW11cclxuICAgICAgICB0aGlzLnJpZ2h0Q29udGFjdHMgPSBbXVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tIFBPU0lUSU9OXHJcbiAgICBfeDogbnVtYmVyXHJcbiAgICBfeTogbnVtYmVyXHJcblxyXG4gICAgLy8gLS0gSElFUkFSQ0hZXHJcbiAgICBfZW50aXR5OiBFbnRpdHlcclxuXHJcbiAgICAvLyAtLSBTVEFUSUMgSU5GT1xyXG4gICAgX21hc3M6IG51bWJlclxyXG4gICAgX2RlbnNpdHk6IG51bWJlclxyXG5cclxuICAgIF9pc1NlbnNvcjogYm9vbGVhblxyXG5cclxuICAgIF9sYXllcjogbnVtYmVyXHJcbiAgICBfbGF5ZXJncm91cDogbnVtYmVyXHJcblxyXG4gICAgX2VuYWJsZWQ6IG51bWJlciAvLyAwOiBkaXNhYmxlIGJvZHkvZGlzYWJsZSBlbnQ7IDE6IGRpc2FibGUgYm9keS9lbmFibGUgZW50OyAyOiBlbmFibGUgYm9keS9kaXNhYmxlIGVudDsgMzogZW5hYmxlIGJvZHkvZW5hYmxlIGVudFxyXG5cclxuICAgIC8vIC0tIENPTlRBQ1RcclxuICAgIGxlZnRDb250YWN0czogQm9keVtdIC8vIHdpdGggc2FtZSBsZXZlbCBvciBoaWdoZXJcclxuICAgIHRvcENvbnRhY3RzOiBCb2R5W11cclxuICAgIGJvdENvbnRhY3RzOiBCb2R5W11cclxuICAgIHJpZ2h0Q29udGFjdHM6IEJvZHlbXVxyXG5cclxuICAgIGhpZ2hlckxlZnRDb250YWN0OiBCb2R5IC8vIHdpdGggaGlnaGVyIGxldmVsXHJcbiAgICBoaWdoZXJUb3BDb250YWN0OiBCb2R5XHJcbiAgICBoaWdoZXJCb3RDb250YWN0OiBCb2R5XHJcbiAgICBoaWdoZXJSaWdodENvbnRhY3Q6IEJvZHlcclxuXHJcbiAgICBnZXQgeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCB9XHJcbiAgICBnZXQgeSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feSB9XHJcblxyXG4gICAgc2V0IHgodmFsOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl94ID0gdmFsXHJcbiAgICB9XHJcbiAgICBzZXQgeSh2YWw6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3kgPSB2YWxcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZW50aXR5KCk6IEVudGl0eSB7IHJldHVybiB0aGlzLl9lbnRpdHkgfVxyXG4gICAgc2V0IGVudGl0eSh2YWw6IEVudGl0eSkgeyBcclxuICAgICAgICBpZighdGhpcy5fZW50aXR5ICYmIHZhbCAhPSB0aGlzLl9lbnRpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5fZW50aXR5LnJlbW92ZUJvZHkodGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodmFsKSB7XHJcbiAgICAgICAgICAgIHZhbC5hZGRCb2R5KHRoaXMpXHJcblxyXG4gICAgICAgICAgICBpZih2YWwuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5fZW5hYmxlZCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IDFcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0aGlzLl9lbmFibGVkID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gM1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5fZW5hYmxlZCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IDBcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZih0aGlzLl9lbmFibGVkID09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gMlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCB3b3JsZCgpOiB3by5Xb3JsZCB7IHJldHVybiB0aGlzLl9lbnRpdHkuX3dvcmxkIH1cclxuXHJcbiAgICBnZXQgbWFzcygpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWFzcyB9XHJcbiAgICBzZXQgbWFzcyh2YWw6IG51bWJlcikgeyBcclxuICAgICAgICB0aGlzLl9kZW5zaXR5ID0gLTFcclxuICAgICAgICBpZih0aGlzLmVudGl0eSkge1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eS5fbWFzcyArPSB2YWwgLSB0aGlzLl9tYXNzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21hc3MgPSB2YWxcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNTZW5zb3IoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc1NlbnNvciB9XHJcbiAgICBzZXQgaXNTZW5zb3IodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5faXNTZW5zb3IgPSB2YWxcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGF5ZXIoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuZW50aXR5LndvcmxkLmxheWVyTmFtZXNbdGhpcy5fbGF5ZXJdIH1cclxuICAgIHNldCBsYXllcih2YWw6IHN0cmluZykge1xyXG4gICAgICAgIGlmKCF0aGlzLmVudGl0eS53b3JsZC5sYXllcklkc1t2YWxdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5LndvcmxkLmFkZExheWVyKHZhbClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbGF5ZXIgPSB0aGlzLmVudGl0eS53b3JsZC5sYXllcklkc1t2YWxdXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxheWVyR3JvdXAoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2xheWVyZ3JvdXAgfVxyXG4gICAgc2V0IGxheWVyR3JvdXAodmFsOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9sYXllcmdyb3VwID0gdmFsXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9lbmFibGVkID49IDIgfVxyXG4gICAgc2V0IGVuYWJsZWQodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYodmFsKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuX2VuYWJsZWQgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IDJcclxuICAgICAgICAgICAgfSBlbHNlIGlmKHRoaXMuX2VuYWJsZWQgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IDNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYoIXRoaXMuX2VudGl0eS5maXhNYXNzKSB7XHJcbiAgICAgICAgICAgICAgICBpZighdGhpcy5fZW50aXR5Ll9tYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW50aXR5Ll9tYXNzID0gdGhpcy5fbWFzc1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdHkuX21hc3MgKz0gdGhpcy5fbWFzc1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYodGhpcy5fZW5hYmxlZCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gMFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYodGhpcy5fZW5hYmxlZCA9PSAzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZighdGhpcy5fZW50aXR5LmZpeE1hc3MpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuX2VudGl0eS5fbWFzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VudGl0eS5fbWFzcyAtPSB0aGlzLl9tYXNzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHBoeXNpY2FsKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZW5hYmxlZCA9PSAzIH1cclxuXHJcbiAgICBnZXQgaGFzTGVmdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubGVmdENvbnRhY3RzLmxlbmd0aCA+IDAgfVxyXG4gICAgZ2V0IGhhc1RvcCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMudG9wQ29udGFjdHMubGVuZ3RoID4gMCB9XHJcbiAgICBnZXQgaGFzQm90KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5ib3RDb250YWN0cy5sZW5ndGggPiAwIH1cclxuICAgIGdldCBoYXNSaWdodCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucmlnaHRDb250YWN0cy5sZW5ndGggPiAwIH1cclxuXHJcbiAgICBnZXQgaGFzSGlnaExlZnQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlckxlZnRDb250YWN0ICE9IG51bGwgfVxyXG4gICAgZ2V0IGhhc0hpZ2hUb3AoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlclRvcENvbnRhY3QgIT0gbnVsbCB9XHJcbiAgICBnZXQgaGFzSGlnaEJvdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaGlnaGVyQm90Q29udGFjdCAhPSBudWxsIH1cclxuICAgIGdldCBoYXNIaWdoUmlnaHQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlclJpZ2h0Q29udGFjdCAhPSBudWxsIH1cclxuXHJcbiAgICBnZXQgaGFzQW55TGVmdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaGlnaGVyTGVmdENvbnRhY3QgIT0gbnVsbCB8fCB0aGlzLmxlZnRDb250YWN0cy5sZW5ndGggPiAwIH1cclxuICAgIGdldCBoYXNBbnlUb3AoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlclRvcENvbnRhY3QgIT0gbnVsbCB8fCB0aGlzLnRvcENvbnRhY3RzLmxlbmd0aCA+IDAgfVxyXG4gICAgZ2V0IGhhc0FueUJvdCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaGlnaGVyQm90Q29udGFjdCAhPSBudWxsIHx8IHRoaXMuYm90Q29udGFjdHMubGVuZ3RoID4gMCB9XHJcbiAgICBnZXQgaGFzQW55UmlnaHQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmhpZ2hlclJpZ2h0Q29udGFjdCAhPSBudWxsIHx8IHRoaXMucmlnaHRDb250YWN0cy5sZW5ndGggPiAwIH1cclxuXHJcbiAgICAvLyAtLSBBQUJCXHJcbiAgICBnZXQgbWlueCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCAtIHRoaXMud2lkdGgvMiB9XHJcbiAgICBnZXQgbWF4eCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCArIHRoaXMuaGVpZ2h0LzIgfVxyXG4gICAgZ2V0IG1pbnkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3kgLSB0aGlzLndpZHRoLzIgfVxyXG4gICAgZ2V0IG1heHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3kgKyB0aGlzLmhlaWdodC8yIH1cclxuXHJcbiAgICAvLyBUTyBJTkhFUklUXHJcbiAgICBkZW5zaXR5OiBudW1iZXJcclxuXHJcbiAgICB3aWR0aDogbnVtYmVyXHJcbiAgICBoZWlnaHQ6IG51bWJlclxyXG5cclxuICAgIGxlZnRDb2xsaWRlOiBib29sZWFuXHJcbiAgICByaWdodENvbGxpZGU6IGJvb2xlYW5cclxuICAgIGJvdENvbGxpZGU6IGJvb2xlYW5cclxuICAgIHRvcENvbGxpZGU6IGJvb2xlYW5cclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgTGluZSBleHRlbmRzIEJvZHkge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudDogRW50aXR5LCB4OiBudW1iZXIsIHk6IG51bWJlciwgc2l6ZTogbnVtYmVyLCBvbmV3YXk6IGJvb2xlYW4sIG1hc3M6IG51bWJlciwgZGVuc2l0eTogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoZW50LCB4LCB5LCBtYXNzLCBkZW5zaXR5KVxyXG4gICAgICAgIHRoaXMuX3NpemUgPSBzaXplXHJcblxyXG4gICAgICAgIHRoaXMuX3R3b3dheSA9ICFvbmV3YXlcclxuXHJcbiAgICAgICAgaWYodGhpcy5fZGVuc2l0eSAhPSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9tYXNzID0gdGhpcy5fZGVuc2l0eSAqIHNpemVcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBpZihlbnQpIHsgZW50LmFkZEJvZHkodGhpcykgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tIFNUQVRJQyBQUk9QRVJUSUVTXHJcbiAgICBfc2l6ZTogbnVtYmVyXHJcblxyXG4gICAgX3R3b3dheTogYm9vbGVhblxyXG4gICAgX2RpcjogbnVtYmVyIC8vIDA6IGxlZnQsIDE6IHRvcCwgMjogcmlnaHQsIDM6IGJvdFxyXG5cclxuICAgIGdldCB0eXBlKCk6IHN0cmluZyB7IHJldHVybiBcImxpbmVcIiB9XHJcblxyXG4gICAgZ2V0IHNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3NpemUgfVxyXG4gICAgXHJcbiAgICAvLyAtLSBNQVNTXHJcbiAgICBnZXQgZGVuc2l0eSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZGVuc2l0eSB9XHJcbiAgICBzZXQgZGVuc2l0eSh2YWw6IG51bWJlcikgeyBcclxuICAgICAgICB0aGlzLl9kZW5zaXR5ID0gdmFsXHJcbiAgICAgICAgbGV0IG5ld01hc3MgPSB0aGlzLl9zaXplICogdmFsXHJcbiAgICAgICAgaWYodGhpcy5lbnRpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHkuX21hc3MgKz0gbmV3TWFzcyAtIHRoaXMuX21hc3NcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWFzcyA9IG5ld01hc3NcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmVydExpbmUgZXh0ZW5kcyBMaW5lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbnQ6IEVudGl0eSwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgb25ld2F5OiBib29sZWFuLCBtYXNzOiBudW1iZXIsIGRlbnNpdHk6IG51bWJlciwgZGlyOiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoZW50LCB4LCB5LCBzaXplLCBvbmV3YXksIG1hc3MsIGRlbnNpdHkpXHJcblxyXG4gICAgICAgIHRoaXMuX2RpciA9IGRpciA/IDIgOiAwXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHdpZHRoKCk6IG51bWJlciB7IHJldHVybiAwIH1cclxuICAgIGdldCBoZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3NpemUgfVxyXG5cclxuICAgIC8vIC0tIEFBQkJcclxuICAgIGdldCBtaW54KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94IH1cclxuICAgIGdldCBtYXh4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94IH1cclxuICAgIGdldCBtaW55KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95IC0gdGhpcy5fc2l6ZS8yIH1cclxuICAgIGdldCBtYXh5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95ICsgdGhpcy5fc2l6ZS8yIH1cclxuXHJcbiAgICBnZXQgbGVmdENvbGxpZGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90d293YXkgfHwgdGhpcy5fZGlyID09IDAgfVxyXG4gICAgZ2V0IHJpZ2h0Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB8fCB0aGlzLl9kaXIgPT0gMiB9XHJcbiAgICBnZXQgYm90Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB9XHJcbiAgICBnZXQgdG9wQ29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB9XHJcbn1cclxuXHJcbmNsYXNzIEhvckxpbmUgZXh0ZW5kcyBMaW5lIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbnQ6IEVudGl0eSwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHNpemU6IG51bWJlciwgb25ld2F5OiBib29sZWFuLCBtYXNzOiBudW1iZXIsIGRlbnNpdHk6IG51bWJlciwgZGlyOiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoZW50LCB4LCB5LCBzaXplLCBvbmV3YXksIG1hc3MsIGRlbnNpdHkpXHJcblxyXG4gICAgICAgIHRoaXMuX2RpciA9IGRpciA/IDMgOiAxXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9zaXplIH1cclxuICAgIGdldCBoZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIDAgfVxyXG5cclxuICAgIC8vIC0tIEFBQkJcclxuICAgIGdldCBtaW54KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94IC0gdGhpcy5fc2l6ZS8yIH1cclxuICAgIGdldCBtYXh4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl94ICsgdGhpcy5fc2l6ZS8yIH1cclxuICAgIGdldCBtaW55KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95IH1cclxuICAgIGdldCBtYXh5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95IH1cclxuXHJcbiAgICBnZXQgbGVmdENvbGxpZGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl90d293YXkgfVxyXG4gICAgZ2V0IHJpZ2h0Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB9XHJcbiAgICBnZXQgYm90Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB8fCB0aGlzLl9kaXIgPT0gMyB9XHJcbiAgICBnZXQgdG9wQ29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3R3b3dheSB8fCB0aGlzLl9kaXIgPT0gMSB9XHJcbn1cclxuXHJcbmNsYXNzIFJlY3QgZXh0ZW5kcyBCb2R5IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbnQ6IEVudGl0eSwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYXNzOiBudW1iZXIsIGRlbnNpdHk6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKGVudCwgeCwgeSwgbWFzcywgZGVuc2l0eSlcclxuICAgICAgICB0aGlzLl93aWR0aCA9IHdpZHRoXHJcbiAgICAgICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0XHJcblxyXG4gICAgICAgIGlmKHRoaXMuX2RlbnNpdHkgIT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5fbWFzcyA9IHRoaXMuX2RlbnNpdHkgKiB3aWR0aCAqIGhlaWdodFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZW50KSB7IGVudC5hZGRCb2R5KHRoaXMpIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgdHlwZSgpOiBzdHJpbmcgeyByZXR1cm4gXCJyZWN0XCIgfVxyXG5cclxuICAgIC8vIC0tIFNUQVRJQyBQUk9QRVJUSUVTXHJcbiAgICBwcml2YXRlIF93aWR0aDogbnVtYmVyXHJcbiAgICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlclxyXG5cclxuICAgIGdldCB3aWR0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fd2lkdGggfVxyXG4gICAgZ2V0IGhlaWdodCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5faGVpZ2h0IH1cclxuXHJcbiAgICAvLyAtLSBBQUJCXHJcbiAgICBnZXQgbWlueCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5feCAtIHRoaXMuX3dpZHRoLzIgfVxyXG4gICAgZ2V0IG1heHgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3ggKyB0aGlzLl93aWR0aC8yIH1cclxuICAgIGdldCBtaW55KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl95IC0gdGhpcy5faGVpZ2h0LzIgfVxyXG4gICAgZ2V0IG1heHkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3kgKyB0aGlzLl9oZWlnaHQvMiB9XHJcblxyXG4gICAgZ2V0IGxlZnRDb2xsaWRlKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZSB9XHJcbiAgICBnZXQgcmlnaHRDb2xsaWRlKCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZSB9XHJcbiAgICBnZXQgYm90Q29sbGlkZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWUgfVxyXG4gICAgZ2V0IHRvcENvbGxpZGUoKTogYm9vbGVhbiB7IHJldHVybiB0cnVlIH1cclxuXHJcbiAgICAvLyAtLSBNQVNTXHJcbiAgICBnZXQgZGVuc2l0eSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZGVuc2l0eSB9XHJcbiAgICBzZXQgZGVuc2l0eSh2YWw6IG51bWJlcikgeyBcclxuICAgICAgICB0aGlzLl9kZW5zaXR5ID0gdmFsXHJcbiAgICAgICAgbGV0IG5ld01hc3MgPSB0aGlzLl93aWR0aCAqIHRoaXMuX2hlaWdodCAqIHZhbFxyXG4gICAgICAgIGlmKHRoaXMuZW50aXR5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5Ll9tYXNzICs9IG5ld01hc3MgLSB0aGlzLl9tYXNzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21hc3MgPSBuZXdNYXNzXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFjdCB7XHJcbiAgICBib2R5OiBCb2R5XHJcbiAgICBvdGhlckJvZHk6IEJvZHlcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTbGlkZU9mZiB7XHJcbiAgICB0aW1lOiBudW1iZXJcclxuXHJcbiAgICBib2R5MTogQm9keSAvLyBvbiB0aGUgbGVmdC9ib3RcclxuICAgIGJvZHkyOiBCb2R5IC8vIG9uIHRoZSByaWdodC90b3BcclxuXHJcbiAgICBpc1g6IGJvb2xlYW5cclxufSIsImltcG9ydCAqIGFzIHZiIGZyb20gXCIuL3ZiaFwiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNCb2R5SW5DaXJjbGUoZTogdmIuSUFBQkIsIHg6IG51bWJlciwgeTogbnVtYmVyLCByOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIGxldCB0eCA9IGUuX3ggLSB4LFxyXG4gICAgICAgIHR5ID0gZS5feSAtIHksXHJcbiAgICAgICAgcnggPSAxMDAwMCwgcnkgPSAxMDAwMFxyXG5cclxuICAgIGlmKGUuX3ggIT0geCkge1xyXG4gICAgICAgIHJ4ID0gZS53aWR0aCAvIE1hdGguYWJzKHR4KVxyXG4gICAgfVxyXG4gICAgaWYoZS5feSAhPSB5KSB7XHJcbiAgICAgICAgcnkgPSBlLmhlaWdodCAvIE1hdGguYWJzKHR5KVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHJ4IDwgcnkpIHtcclxuICAgICAgICByZXR1cm4gciArIChyeCAtIDEpICogTWF0aC5zcXJ0KHR4ICogdHggKyB0eSAqIHR5KSA+PSAwIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gciArIChyeSAtIDEpICogTWF0aC5zcXJ0KHR4ICogdHggKyB0eSAqIHR5KSA+PSAwIFxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmF5Y2FzdEhlbHBlcjxUIGV4dGVuZHMgdmIuSUFBQkI+KGU6IFQsIGQ6IG51bWJlciwgdng6IG51bWJlciwgdnk6IG51bWJlciwgeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgcmVzOiB2Yi5SYXljYXN0UmVzdWx0PFQ+KTogbnVtYmVyIHtcclxuICAgIGxldCBtaW54ID0gZS5taW54LFxyXG4gICAgICAgIG1heHggPSBlLm1heHgsXHJcbiAgICAgICAgbWlueSA9IGUubWlueSxcclxuICAgICAgICBtYXh5ID0gZS5tYXh5XHJcblxyXG4gICAgaWYodnggPiAwICYmIHgxIDw9IG1pbnggJiYgZS5sZWZ0Q29sbGlkZSkge1xyXG4gICAgICAgIGxldCB5ID0geTEgKyB2eSAqIChtaW54IC0geDEpIC8gdngsXHJcbiAgICAgICAgICAgIG5ld2QgPSAobWlueCAtIHgxKSAqIChtaW54IC0geDEpICsgKHkgLSB5MSkgKiAoeSAtIHkxKVxyXG5cclxuICAgICAgICBpZihkID4gbmV3ZCAmJiB5ID49IG1pbnkgJiYgeSA8PSBtYXh5KSB7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5ID0gZVxyXG4gICAgICAgICAgICByZXMuc2lkZSA9IFwibGVmdFwiXHJcbiAgICAgICAgICAgIHJlcy54ID0gbWlueFxyXG4gICAgICAgICAgICByZXMueSA9IHlcclxuICAgICAgICAgICAgcmVzLmRpc3RhbmNlID0gbmV3ZFxyXG4gICAgICAgICAgICByZXR1cm4gbmV3ZFxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZih2eCA8IDAgJiYgeDEgPj0gbWF4eCAmJiBlLnJpZ2h0Q29sbGlkZSkge1xyXG4gICAgICAgIGxldCB5ID0geTEgKyB2eSAqIChtYXh4IC0geDEpIC8gdngsXHJcbiAgICAgICAgICAgIG5ld2QgPSAobWF4eCAtIHgxKSAqIChtYXh4IC0geDEpICsgKHkgLSB5MSkgKiAoeSAtIHkxKVxyXG5cclxuICAgICAgICBpZihkID4gbmV3ZCAmJiB5ID49IG1pbnkgJiYgeSA8PSBtYXh5KSB7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5ID0gZVxyXG4gICAgICAgICAgICByZXMuc2lkZSA9IFwicmlnaHRcIlxyXG4gICAgICAgICAgICByZXMueCA9IG1heHhcclxuICAgICAgICAgICAgcmVzLnkgPSB5XHJcbiAgICAgICAgICAgIHJlcy5kaXN0YW5jZSA9IG5ld2RcclxuICAgICAgICAgICAgcmV0dXJuIG5ld2RcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYodnkgPiAwICYmIHkxIDw9IG1pbnkgJiYgZS5ib3RDb2xsaWRlKSB7XHJcbiAgICAgICAgbGV0IHggPSB4MSArIHZ4ICogKG1pbnkgLSB5MSkgLyB2eSxcclxuICAgICAgICAgICAgbmV3ZCA9ICh4IC0geDEpICogKHggLSB4MSkgKyAobWlueSAtIHkxKSAqIChtaW55IC0geTEpXHJcblxyXG4gICAgICAgIGlmKGQgPiBuZXdkICYmIHggPj0gbWlueCAmJiB4IDw9IG1heHgpIHtcclxuICAgICAgICAgICAgcmVzLmJvZHkgPSBlXHJcbiAgICAgICAgICAgIHJlcy5zaWRlID0gXCJib3RcIlxyXG4gICAgICAgICAgICByZXMueCA9IHhcclxuICAgICAgICAgICAgcmVzLnkgPSBtaW55XHJcbiAgICAgICAgICAgIHJlcy5kaXN0YW5jZSA9IG5ld2RcclxuICAgICAgICAgICAgcmV0dXJuIG5ld2RcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYodnkgPCAwICYmIHkxID49IG1heHkgJiYgZS50b3BDb2xsaWRlKSB7XHJcbiAgICAgICAgbGV0IHggPSB4MSArIHZ4ICogKG1heHkgLSB5MSkgLyB2eSxcclxuICAgICAgICAgICAgbmV3ZCA9ICh4IC0geDEpICogKHggLSB4MSkgKyAobWF4eSAtIHkxKSAqIChtYXh5IC0geTEpXHJcblxyXG4gICAgICAgIGlmKGQgPiBuZXdkICYmIHggPj0gbWlueCAmJiB4IDw9IG1heHgpIHtcclxuICAgICAgICAgICAgcmVzLmJvZHkgPSBlXHJcbiAgICAgICAgICAgIHJlcy5zaWRlID0gXCJ0b3BcIlxyXG4gICAgICAgICAgICByZXMueCA9IHhcclxuICAgICAgICAgICAgcmVzLnkgPSBtYXh5XHJcbiAgICAgICAgICAgIHJlcy5kaXN0YW5jZSA9IG5ld2RcclxuICAgICAgICAgICAgcmV0dXJuIG5ld2RcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJheWNhc3RSZWN0SGVscGVyPFQgZXh0ZW5kcyB2Yi5JQUFCQj4oZTogVCwgZDogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlciwgdng6IG51bWJlciwgdnk6IG51bWJlciwgeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgcmVzOiB2Yi5SYXljYXN0UmVzdWx0PFQ+KTogbnVtYmVyIHtcclxuICAgIGxldCBtaW54ID0gZS5taW54LFxyXG4gICAgICAgIG1heHggPSBlLm1heHgsXHJcbiAgICAgICAgbWlueSA9IGUubWlueSxcclxuICAgICAgICBtYXh5ID0gZS5tYXh5XHJcblxyXG4gICAgaWYodnggPiAwICYmIHgxICsgdyA8PSBtaW54ICYmIGUubGVmdENvbGxpZGUpIHtcclxuICAgICAgICBsZXQgZHggPSAobWlueCAtIHgxIC0gdyksXHJcbiAgICAgICAgICAgIHkgPSB5MSArIHZ5ICogZHggLyB2eCxcclxuICAgICAgICAgICAgbmV3ZCA9IGR4ICogZHggKyAoeSAtIHkxKSAqICh5IC0geTEpXHJcblxyXG4gICAgICAgIGlmKGQgPiBuZXdkICYmICEoeSAtIGggPj0gbWF4eSB8fCB5ICsgaCA8PSBtaW55KSkge1xyXG4gICAgICAgICAgICByZXMuYm9keSA9IGVcclxuICAgICAgICAgICAgcmVzLnNpZGUgPSBcImxlZnRcIlxyXG4gICAgICAgICAgICByZXMueCA9IG1pbnggLSB3XHJcbiAgICAgICAgICAgIHJlcy55ID0geVxyXG4gICAgICAgICAgICByZXMuZGlzdGFuY2UgPSBuZXdkXHJcbiAgICAgICAgICAgIHJldHVybiBuZXdkXHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKHZ4IDwgMCAmJiB4MSAtIHcgPj0gbWF4eCAmJiBlLnJpZ2h0Q29sbGlkZSkge1xyXG4gICAgICAgIGxldCBkeCA9IChtYXh4IC0geDEgKyB3KSxcclxuICAgICAgICAgICAgeSA9IHkxICsgdnkgKiBkeCAvIHZ4LFxyXG4gICAgICAgICAgICBuZXdkID0gZHggKiBkeCArICh5IC0geTEpICogKHkgLSB5MSlcclxuXHJcbiAgICAgICAgaWYoZCA+IG5ld2QgJiYgISh5IC0gaCA+PSBtYXh5IHx8IHkgKyBoIDw9IG1pbnkpKSB7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5ID0gZVxyXG4gICAgICAgICAgICByZXMuc2lkZSA9IFwicmlnaHRcIlxyXG4gICAgICAgICAgICByZXMueCA9IG1heHggKyB3XHJcbiAgICAgICAgICAgIHJlcy55ID0geVxyXG4gICAgICAgICAgICByZXMuZGlzdGFuY2UgPSBuZXdkXHJcbiAgICAgICAgICAgIHJldHVybiBuZXdkXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmKHZ5ID4gMCAmJiB5MSArIGggPD0gbWlueSAmJiBlLmJvdENvbGxpZGUpIHtcclxuICAgICAgICBsZXQgZHkgPSAobWlueSAtIHkxIC0gaCksXHJcbiAgICAgICAgICAgIHggPSB4MSArIHZ4ICogZHkgLyB2eSxcclxuICAgICAgICAgICAgbmV3ZCA9ICh4IC0geDEpICogKHggLSB4MSkgKyBkeSAqIGR5XHJcblxyXG4gICAgICAgIGlmKGQgPiBuZXdkICYmICEoeCAtIHcgPj0gbWF4eCB8fCB4ICsgdyA8PSBtaW54KSkge1xyXG4gICAgICAgICAgICByZXMuYm9keSA9IGVcclxuICAgICAgICAgICAgcmVzLnNpZGUgPSBcImJvdFwiXHJcbiAgICAgICAgICAgIHJlcy54ID0geFxyXG4gICAgICAgICAgICByZXMueSA9IG1pbnkgLSBoXHJcbiAgICAgICAgICAgIHJlcy5kaXN0YW5jZSA9IG5ld2RcclxuICAgICAgICAgICAgcmV0dXJuIG5ld2RcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2UgaWYodnkgPCAwICYmIHkxIC0gaCA+PSBtYXh5ICYmIGUudG9wQ29sbGlkZSkge1xyXG4gICAgICAgIGxldCBkeSA9IChtaW55IC0geTEgLSBoKSxcclxuICAgICAgICAgICAgeCA9IHgxICsgdnggKiBkeSAvIHZ5LFxyXG4gICAgICAgICAgICBuZXdkID0gKHggLSB4MSkgKiAoeCAtIHgxKSArIGR5ICogZHlcclxuXHJcbiAgICAgICAgaWYoZCA+IG5ld2QgJiYgISh4IC0gdyA+PSBtYXh4IHx8IHggKyB3IDw9IG1pbngpKSB7XHJcbiAgICAgICAgICAgIHJlcy5ib2R5ID0gZVxyXG4gICAgICAgICAgICByZXMuc2lkZSA9IFwidG9wXCJcclxuICAgICAgICAgICAgcmVzLnggPSB4XHJcbiAgICAgICAgICAgIHJlcy55ID0gbWF4eSArIGhcclxuICAgICAgICAgICAgcmVzLmRpc3RhbmNlID0gbmV3ZFxyXG4gICAgICAgICAgICByZXR1cm4gbmV3ZFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZFxyXG59IiwiaW1wb3J0ICogYXMgZW50IGZyb20gXCIuL2VudGl0eVwiXHJcbmltcG9ydCAqIGFzIG1hdGggZnJvbSBcIi4vbWF0aFwiXHJcbmltcG9ydCAqIGFzIHdvIGZyb20gXCIuL3dvcmxkXCJcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUFBQkIge1xyXG4gICAgZW5hYmxlZDogYm9vbGVhblxyXG5cclxuICAgIG1pbng6IG51bWJlclxyXG4gICAgbWF4eDogbnVtYmVyXHJcbiAgICBtaW55OiBudW1iZXJcclxuICAgIG1heHk6IG51bWJlclxyXG5cclxuICAgIF94OiBudW1iZXJcclxuICAgIF95OiBudW1iZXJcclxuICAgIHdpZHRoOiBudW1iZXJcclxuICAgIGhlaWdodDogbnVtYmVyXHJcblxyXG4gICAgd29ybGQ6IHdvLldvcmxkXHJcblxyXG4gICAgX2xheWVyOiBudW1iZXJcclxuICAgIF9sYXllcmdyb3VwOiBudW1iZXJcclxuXHJcbiAgICBsZWZ0Q29sbGlkZTogYm9vbGVhblxyXG4gICAgcmlnaHRDb2xsaWRlOiBib29sZWFuXHJcbiAgICB0b3BDb2xsaWRlOiBib29sZWFuXHJcbiAgICBib3RDb2xsaWRlOiBib29sZWFuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU1vdmVBQUJCIGV4dGVuZHMgSUFBQkIge1xyXG4gICAgbW92ZU1pbng6IG51bWJlclxyXG4gICAgbW92ZU1heHg6IG51bWJlclxyXG4gICAgbW92ZU1pbnk6IG51bWJlclxyXG4gICAgbW92ZU1heHk6IG51bWJlclxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlcjxUPiB7XHJcbiAgICBpZ25vcmVkPzogVFtdIFxyXG4gICAgbGF5ZXI/OiBzdHJpbmdcclxuICAgIGxheWVyZ3JvdXA/OiBudW1iZXJcclxuICAgIGNoZWNrTGF5ZXI/OiBzdHJpbmdcclxuICAgIGNoZWNrTGF5ZXJncm91cD86IG51bWJlclxyXG4gICAgY2FsbGJhY2s/OiAoZW50OiBUKSA9PiBib29sZWFuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVkJIPFQgZXh0ZW5kcyBJQUFCQj4ge1xyXG5cclxuICAgIGZvcmFsbChmdW5jOiAoYjogVCkgPT4gdm9pZClcclxuXHJcbiAgICBjb250YWlucyhvOiBUKVxyXG5cclxuICAgIGluc2VydChyZWN0OiBUKVxyXG4gICAgcmVtb3ZlKHJlY3Q6IFQpXHJcbiAgICBjbGVhcigpXHJcblxyXG4gICAgdXBkYXRlKClcclxuXHJcbiAgICBxdWVyeVJlY3QobWlueDogbnVtYmVyLCBtYXh4OiBudW1iZXIsIG1pbnk6IG51bWJlciwgbWF4eHk6IG51bWJlciwgZmlsdGVyPzogRmlsdGVyPFQ+KTogVFtdXHJcbiAgICBxdWVyeUNpcmNsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIGZpbHRlcj86IEZpbHRlcjxUPik6IFRbXVxyXG5cclxuICAgIG5lYXJlc3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIGs6IG51bWJlciwgZmlsdGVyPzogRmlsdGVyPFQ+KTogVFtdXHJcblxyXG4gICAgcmF5Y2FzdCh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+XHJcbiAgICByYXljYXN0QWxsKHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIGZpbHRlcj86IEZpbHRlcjxUPik6IFJheWNhc3RSZXN1bHQ8VD5bXVxyXG5cclxuICAgIHJheWNhc3RSZWN0KHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+XHJcbiAgICByYXljYXN0UmVjdEFsbCh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlciwgZmlsdGVyPzogRmlsdGVyPFQ+KTogUmF5Y2FzdFJlc3VsdDxUPltdXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTW92ZVZCSDxUIGV4dGVuZHMgSU1vdmVBQUJCPiBleHRlbmRzIFZCSDxUPiB7XHJcbiAgICBjb2xsaXNpb25zKCk6IFtULCBUXVtdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhY2NlcHRzPFQgZXh0ZW5kcyBJQUFCQj4oZTogVCwgZmlsdGVyPzogRmlsdGVyPFQ+KSB7XHJcbiAgICBpZihlLmVuYWJsZWQpIHtcclxuICAgICAgICBpZighZmlsdGVyKSB7IHJldHVybiB0cnVlIH1cclxuXHJcbiAgICAgICAgaWYoZmlsdGVyLmlnbm9yZWQpIHtcclxuICAgICAgICAgICAgaWYoZmlsdGVyLmlnbm9yZWQuaW5kZXhPZihlKSA+PSAwKSB7IHJldHVybiBmYWxzZSB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihlLl9sYXllciA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmKGZpbHRlci5sYXllcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxheWVyaWQgPSBlLndvcmxkLmxheWVySWRzW2ZpbHRlci5sYXllcl1cclxuICAgICAgICAgICAgICAgIGlmKChmaWx0ZXIubGF5ZXJncm91cCAhPSBudWxsICYmIGUuX2xheWVyZ3JvdXAgIT0gZmlsdGVyLmxheWVyZ3JvdXApIHx8IGUuX2xheWVyICE9IGxheWVyaWQpIHsgXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKGZpbHRlci5jaGVja0xheWVyKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGF5ZXJpZCA9IGUud29ybGQubGF5ZXJJZHNbZmlsdGVyLmNoZWNrTGF5ZXJdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bGUgPSBlLndvcmxkLl9nZXRMYXllclJ1bGUoZS5fbGF5ZXIsIGxheWVyaWQpXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoZmlsdGVyLmNoZWNrTGF5ZXJncm91cCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYocnVsZSA9PSAweDAgXHJcbiAgICAgICAgICAgICAgICAgICAgfHwgcnVsZSA9PSAweDIgJiYgZmlsdGVyLmNoZWNrTGF5ZXJncm91cCAhPSBlLl9sYXllcmdyb3VwIFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IHJ1bGUgPT0gMHgxICYmIGZpbHRlci5jaGVja0xheWVyZ3JvdXAgPT0gZS5fbGF5ZXJncm91cCl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIXJ1bGUpIHsgcmV0dXJuIGZhbHNlIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoZmlsdGVyLmNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXIuY2FsbGJhY2soZSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVWQkg8VCBleHRlbmRzIElBQUJCPiBpbXBsZW1lbnRzIFZCSDxUPiB7XHJcblxyXG4gICAgbGlzdDogVFtdXHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gW11cclxuICAgIH1cclxuXHJcbiAgICBmb3JhbGwoZnVuYzogKGI6IFQpID0+IHZvaWQpIHtcclxuICAgICAgICBmb3IobGV0IGJvZHkgb2YgdGhpcy5saXN0KSB7XHJcbiAgICAgICAgICAgIGZ1bmMoYm9keSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29udGFpbnMobzogVCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuaW5kZXhPZihvKSA+PSAwXHJcbiAgICB9XHJcblxyXG4gICAgaW5zZXJ0KHJlY3Q6IFQpIHtcclxuICAgICAgICBpZih0aGlzLmxpc3QuaW5kZXhPZihyZWN0KSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gocmVjdClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmUocmVjdDogVCkge1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5saXN0LmluZGV4T2YocmVjdClcclxuICAgICAgICBpZihpID49IDApIHsgdGhpcy5saXN0LnNwbGljZShpLCAxKSB9XHJcbiAgICB9XHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAvLyBOb3RoaW5nXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHF1ZXJ5UmVjdChtaW54OiBudW1iZXIsIG1heHg6IG51bWJlciwgbWlueTogbnVtYmVyLCBtYXh5OiBudW1iZXIsIGZpbHRlcj86IEZpbHRlcjxUPik6IFRbXSB7XHJcbiAgICAgICAgaWYodGhpcy5saXN0KSB7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmxpc3QubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgcmVzID0gW11cclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3RbaV1cclxuICAgICAgICAgICAgICAgIGlmKGFjY2VwdHMoY3VycmVudCwgZmlsdGVyKSAmJiAhKG1heHggPCBjdXJyZW50Lm1pbnggfHwgY3VycmVudC5tYXh4IDwgbWlueCB8fCBtYXh5IDwgY3VycmVudC5taW55IHx8IGN1cnJlbnQubWF4eSA8IG1pbnkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnB1c2goY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHF1ZXJ5Q2lyY2xlKHg6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgZmlsdGVyPzogRmlsdGVyPFQ+KTogVFtdIHtcclxuICAgICAgICBpZih0aGlzLmxpc3QpIHtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMubGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByZXMgPSBbXVxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubGlzdFtpXVxyXG4gICAgICAgICAgICAgICAgaWYoYWNjZXB0cyhjdXJyZW50LCBmaWx0ZXIpICYmIG1hdGguaXNCb2R5SW5DaXJjbGUoY3VycmVudCwgeCwgeSwgcmFkaXVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5wdXNoKGN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZWFyZXN0KHg6IG51bWJlciwgeTogbnVtYmVyLCBrOiBudW1iZXIsIGZpbHRlcj86IEZpbHRlcjxUPik6IFRbXSB7XHJcbiAgICAgICAgaWYodGhpcy5saXN0KSB7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSB0aGlzLmxpc3QubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgcmVzID0gW10sXHJcbiAgICAgICAgICAgICAgICBsZW4xID0gMFxyXG5cclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubGlzdFtpXVxyXG4gICAgICAgICAgICAgICAgaWYoYWNjZXB0cyhjdXJyZW50LCBmaWx0ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSAoY3VycmVudC5feCAtIHgpICogKGN1cnJlbnQuX3ggLSB4KSArIChjdXJyZW50Ll95IC0geSkgKiAoY3VycmVudC5feSAtIHkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnNlcnQgPSAwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKGluc2VydCA8IGxlbjEgJiYgcmVzW2luc2VydF0gPCBkKSB7IGluc2VydCsrIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYobGVuMSA9PSBrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGluc2VydCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMuc3BsaWNlKGluc2VydCwgMCwgY3VycmVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zaGlmdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMuc3BsaWNlKGluc2VydCwgMCwgY3VycmVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuMSsrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmF5Y2FzdCh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+IHtcclxuICAgICAgICBpZih0aGlzLmxpc3QpIHtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMubGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByZXM6IFJheWNhc3RSZXN1bHQ8VD4gPSB7IHg6IDAsIHk6IDAsIGRpc3RhbmNlOiAwLCBzaWRlOiBudWxsLCBib2R5OiBudWxsfSxcclxuICAgICAgICAgICAgICAgIGQgPSAxMDAwMDAwLFxyXG4gICAgICAgICAgICAgICAgdnggPSB4MiAtIHgxLCB2eSA9IHkyIC0geTFcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3RbaV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihhY2NlcHRzKGN1cnJlbnQsIGZpbHRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBkID0gbWF0aC5yYXljYXN0SGVscGVyPFQ+KGN1cnJlbnQsIGQsIHZ4LCB2eSwgeDEsIHkxLCB4MiwgeTIsIHJlcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocmVzLmJvZHkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmF5Y2FzdEFsbCh4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+W10ge1xyXG4gICAgICAgIGlmKHRoaXMubGlzdCkge1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gdGhpcy5saXN0Lmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHJlcyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudHJlczogUmF5Y2FzdFJlc3VsdDxUPiA9IHsgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IG51bGwsIGJvZHk6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgdnggPSB4MiAtIHgxLCB2eSA9IHkyIC0geTFcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3RbaV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihhY2NlcHRzKGN1cnJlbnQsIGZpbHRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRoLnJheWNhc3RIZWxwZXI8VD4oY3VycmVudCwgLTEsIHZ4LCB2eSwgeDEsIHkxLCB4MiwgeTIsIGN1cnJlbnRyZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudHJlcy5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5wdXNoKGN1cnJlbnRyZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRyZXMgPSB7IHg6IDAsIHk6IDAsIGRpc3RhbmNlOiAwLCBzaWRlOiBudWxsLCBib2R5OiBudWxsfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJheWNhc3RSZWN0KHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+IHtcclxuICAgICAgICBpZih0aGlzLmxpc3QpIHtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMubGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICByZXM6IFJheWNhc3RSZXN1bHQ8VD4gPSB7IHg6IDAsIHk6IDAsIGRpc3RhbmNlOiAwLCBzaWRlOiBudWxsLCBib2R5OiBudWxsfSxcclxuICAgICAgICAgICAgICAgIGQgPSAxMDAwMDAwLFxyXG4gICAgICAgICAgICAgICAgdnggPSB4MiAtIHgxLCB2eSA9IHkyIC0geTFcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3RbaV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihhY2NlcHRzKGN1cnJlbnQsIGZpbHRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBkID0gbWF0aC5yYXljYXN0UmVjdEhlbHBlcjxUPihjdXJyZW50LCBkLCB3LCBoLCB2eCwgdnksIHgxLCB5MSwgeDIsIHkyLCByZXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHJlcy5ib2R5KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJheWNhc3RSZWN0QWxsKHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBmaWx0ZXI/OiBGaWx0ZXI8VD4pOiBSYXljYXN0UmVzdWx0PFQ+W10ge1xyXG4gICAgICAgIGlmKHRoaXMubGlzdCkge1xyXG4gICAgICAgICAgICBsZXQgbGVuID0gdGhpcy5saXN0Lmxlbmd0aCxcclxuICAgICAgICAgICAgICAgIHJlcyA9IFtdLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudHJlczogUmF5Y2FzdFJlc3VsdDxUPiA9IHsgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IG51bGwsIGJvZHk6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgdnggPSB4MiAtIHgxLCB2eSA9IHkyIC0geTFcclxuXHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLmxpc3RbaV1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihhY2NlcHRzKGN1cnJlbnQsIGZpbHRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXRoLnJheWNhc3RSZWN0SGVscGVyPFQ+KGN1cnJlbnQsIC0xLCB3LCBoLCB2eCwgdnksIHgxLCB5MSwgeDIsIHkyLCBjdXJyZW50cmVzKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRyZXMuYm9keSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXMucHVzaChjdXJyZW50cmVzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50cmVzID0geyB4OiAwLCB5OiAwLCBkaXN0YW5jZTogMCwgIHNpZGU6IG51bGwsIGJvZHk6IG51bGx9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVNb3ZlVkJIPFQgZXh0ZW5kcyBJTW92ZUFBQkI+IGV4dGVuZHMgU2ltcGxlVkJIPFQ+IGltcGxlbWVudHMgTW92ZVZCSDxUPiB7XHJcblxyXG4gICAgY29sbGlzaW9ucygpOiBbVCwgVF1bXSB7XHJcbiAgICAgICAgbGV0IGxlbiA9IHRoaXMubGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgIHBhaXJzID0gW11cclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRoaXMubGlzdFtpXVxyXG4gICAgICAgICAgICBpZihmaXJzdC5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IobGV0IGogPSBpICsgMTsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlY29uZCA9IHRoaXMubGlzdFtqXVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZihzZWNvbmQuZW5hYmxlZCAmJiAhKGZpcnN0Lm1vdmVNYXh4IDwgc2Vjb25kLm1vdmVNaW54IHx8IHNlY29uZC5tb3ZlTWF4eCA8IGZpcnN0Lm1vdmVNaW54IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCBmaXJzdC5tb3ZlTWF4eSA8IHNlY29uZC5tb3ZlTWlueSB8fCBzZWNvbmQubW92ZU1heHkgPCBmaXJzdC5tb3ZlTWlueSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFpcnMucHVzaChbZmlyc3QsIHNlY29uZF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYWlyc1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJheWNhc3RSZXN1bHQ8VD4ge1xyXG4gICAgeDogbnVtYmVyXHJcbiAgICB5OiBudW1iZXJcclxuICAgIHNpZGU6IHN0cmluZyAvLyB0b3AsIGJvdCwgcmlnaHQgb3IgbGVmdFxyXG4gICAgYm9keTogVFxyXG4gICAgZGlzdGFuY2U6IG51bWJlclxyXG59IiwiaW1wb3J0ICogYXMgdmIgZnJvbSBcIi4vdmJoXCJcbmltcG9ydCAqIGFzIGVudCBmcm9tIFwiLi9lbnRpdHlcIlxuaW1wb3J0ICogYXMgbWF0aCBmcm9tIFwiLi9tYXRoXCJcblxuZXhwb3J0IGNsYXNzIFdvcmxkIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVudHMgPSBbXVxuICAgICAgICB0aGlzLnZiaCA9IG5ldyB2Yi5TaW1wbGVNb3ZlVkJIPGVudC5FbnRpdHk+KClcblxuICAgICAgICB0aGlzLmxheWVySWRzID0ge31cbiAgICAgICAgdGhpcy5sYXllck5hbWVzID0gbmV3IEFycmF5KDMyKVxuICAgICAgICB0aGlzLmxheWVycyA9IG5ldyBBcnJheSg2NClcblxuICAgICAgICB0aGlzLmxheWVySWRzW1wiZGVmYXVsdFwiXSA9IDBcbiAgICAgICAgdGhpcy5sYXllck5hbWVzWzBdID0gXCJkZWZhdWx0XCJcbiAgICAgICAgdGhpcy5sYXllcnNbMF0gPSAweEZGRkZGRkZGXG4gICAgICAgIHRoaXMubGF5ZXJzWzMyXSA9IDB4RkZGRkZGRkZcblxuICAgICAgICBmb3IobGV0IGkgPSAxOyBpIDwgMzI7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSAweDNcbiAgICAgICAgICAgIHRoaXMubGF5ZXJzW2krMzJdID0gMHgwXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLSBWQkggSU5GT1xuICAgIHZiaDogdmIuTW92ZVZCSDxlbnQuRW50aXR5PlxuXG4gICAgLy8gLS0gV09STEQgRU5USVRJRVNcbiAgICBlbnRzOiBlbnQuRW50aXR5W11bXSAvLyBsaXN0cyBvZiBlbnRpdGllcyBpbmRleGVkIGJ5IGxldmVsXG5cbiAgICBzaW1zID0gW11cbiAgICBzaW1cbiAgICBzaW1sZXZlbFxuICAgIHNpbUNvdW50OiBudW1iZXIgPSAwXG4gICAgdGltZTogbnVtYmVyID0gMFxuXG4gICAgLy8gLS0gQURESU5HL1JFTU9WSU5HIEVOVElUSUVTXG4gICAgY3JlYXRlRW50aXR5KHg6IG51bWJlciwgeTogbnVtYmVyLCBsZXZlbDogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIGNoaWxkQ291bnQ/OiBudW1iZXIpOiBlbnQuRW50aXR5IHtcbiAgICAgICAgbGV0IGUgPSBuZXcgZW50LkVudGl0eSh0aGlzLCB4LCB5LCBsZXZlbCwgbmFtZSwgY2hpbGRDb3VudCAhPSBudWxsID8gY2hpbGRDb3VudDoxKVxuICAgICAgICB0aGlzLnZiaC5pbnNlcnQoZSlcbiAgICAgICAgaWYoIXRoaXMuZW50c1tsZXZlbF0pIHsgdGhpcy5lbnRzW2xldmVsXSA9IFtlXSB9IFxuICAgICAgICBlbHNlIHsgdGhpcy5lbnRzW2xldmVsXS5wdXNoKGUpIH1cbiAgICAgICAgcmV0dXJuIGVcbiAgICB9XG4gICAgY3JlYXRlUmVjdCh4OiBudW1iZXIsIHk6IG51bWJlciwgbGV2ZWw6IG51bWJlciwgbmFtZTogc3RyaW5nLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IGVudC5FbnRpdHkge1xuICAgICAgICBsZXQgZSA9IHRoaXMuY3JlYXRlRW50aXR5KHgsIHksIGxldmVsLCBuYW1lLCAxKVxuICAgICAgICBpZihuYW1lID09IFwiY2hhclwiKSB7XG4gICAgICAgICAgICBlLmFkZFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCwgMSwgMClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGUuYWRkUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0LCAyLCAwKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlXG4gICAgfVxuICAgIGNyZWF0ZUxlZnRMaW5lKHg6IG51bWJlciwgeTogbnVtYmVyLCBsZXZlbDogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIHNpemU6IG51bWJlciwgb25ld2F5OiBib29sZWFuKTogZW50LkVudGl0eSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5jcmVhdGVFbnRpdHkoeCwgeSwgbGV2ZWwsIG5hbWUsIDEpXG4gICAgICAgIGUuYWRkTGVmdExpbmUoMCwgMCwgc2l6ZSwgb25ld2F5LCAxLCAwKVxuICAgICAgICByZXR1cm4gZVxuICAgIH1cbiAgICBjcmVhdGVSaWdodExpbmUoeDogbnVtYmVyLCB5OiBudW1iZXIsIGxldmVsOiBudW1iZXIsIG5hbWU6IHN0cmluZywgc2l6ZTogbnVtYmVyLCBvbmV3YXk6IGJvb2xlYW4pOiBlbnQuRW50aXR5IHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNyZWF0ZUVudGl0eSh4LCB5LCBsZXZlbCwgbmFtZSwgMSlcbiAgICAgICAgZS5hZGRSaWdodExpbmUoMCwgMCwgc2l6ZSwgb25ld2F5LCAxLCAwKVxuICAgICAgICByZXR1cm4gZVxuICAgIH1cbiAgICBjcmVhdGVUb3BMaW5lKHg6IG51bWJlciwgeTogbnVtYmVyLCBsZXZlbDogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIHNpemU6IG51bWJlciwgb25ld2F5OiBib29sZWFuKTogZW50LkVudGl0eSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5jcmVhdGVFbnRpdHkoeCwgeSwgbGV2ZWwsIG5hbWUsIDEpXG4gICAgICAgIGUuYWRkVG9wTGluZSgwLCAwLCBzaXplLCBvbmV3YXksIDEsIDApXG4gICAgICAgIHJldHVybiBlXG4gICAgfVxuICAgIGNyZWF0ZUJvdExpbmUoeDogbnVtYmVyLCB5OiBudW1iZXIsIGxldmVsOiBudW1iZXIsIG5hbWU6IHN0cmluZywgc2l6ZTogbnVtYmVyLCBvbmV3YXk6IGJvb2xlYW4pOiBlbnQuRW50aXR5IHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNyZWF0ZUVudGl0eSh4LCB5LCBsZXZlbCwgbmFtZSwgMSlcbiAgICAgICAgZS5hZGRCb3RMaW5lKDAsIDAsIHNpemUsIG9uZXdheSwgMSwgMClcbiAgICAgICAgcmV0dXJuIGVcbiAgICB9ICAgXG5cbiAgICAvLyAtLSBMQVlFUlNcbiAgICBsYXllcklkczogYW55IC8vIG5hbWUgLT4gaWRcbiAgICBsYXllck5hbWVzOiBzdHJpbmdbXSAvLyBpZCAtPiBuYW1lXG4gICAgbGF5ZXJzOiBudW1iZXJbXVxuXG4gICAgYWRkTGF5ZXIobGF5ZXI6IHN0cmluZykge1xuICAgICAgICBsZXQgaSA9IDE2XG4gICAgICAgIHdoaWxlKGkgPCAzMiAmJiB0aGlzLmxheWVyTmFtZXNbaV0pIHtcbiAgICAgICAgICAgIGkrK1xuICAgICAgICB9XG4gICAgICAgIGlmKGkgPT0gMzIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiW0VSUk9SXSBDYW4ndCBhZGQgbGF5ZXI6IG5vIG1vcmUgbGF5ZXJzIGF2YWlsYWJsZVwiKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sYXllck5hbWVzW2ldID0gbGF5ZXJcbiAgICAgICAgICAgIHRoaXMubGF5ZXJJZHNbbGF5ZXJdID0gaVxuICAgICAgICB9XG4gICAgfVxuICAgIHNldExheWVyUnVsZShsYXllcjE6IHN0cmluZywgbGF5ZXIyOiBzdHJpbmcsIHJ1bGU6IHN0cmluZykge1xuICAgICAgICBpZighdGhpcy5sYXllcklkc1tsYXllcjFdKSB7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKGxheWVyMSlcbiAgICAgICAgfVxuICAgICAgICBpZighdGhpcy5sYXllcklkc1tsYXllcjJdKSB7XG4gICAgICAgICAgICB0aGlzLmFkZExheWVyKGxheWVyMilcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWQxID0gdGhpcy5sYXllcklkc1tsYXllcjFdLFxuICAgICAgICAgICAgaWQyID0gdGhpcy5sYXllcklkc1tsYXllcjJdXG4gICAgICAgIFxuICAgICAgICBpZihpZDIgPj0gMTYpIHtcbiAgICAgICAgICAgIGxldCBhZGQsIGNsZWFyID0gfigzIDw8ICgyICogaWQyIC0gMTYpKVxuICAgICAgICAgICAgc3dpdGNoKHJ1bGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWxsXCI6IGFkZCA9IDMgPDwgKDIgKiBpZDIgLSAxNik7IGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSBcImVxdWFsXCI6IGFkZCA9IDIgPDwgKDIgKiBpZDIgLSAxNik7IGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSBcInVuZXF1YWxcIjogYWRkID0gMSA8PCAoMiAqIGlkMiAtIDE2KTsgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlIFwibm9uZVwiOiBhZGQgPSAwOyBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXllcnNbaWQxKzMyXSA9ICgodGhpcy5sYXllcnNbaWQxKzMyXSAmIGNsZWFyKSB8IGFkZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBhZGQsIGNsZWFyID0gfigzIDw8IDIgKiBpZDIpXG4gICAgICAgICAgICBzd2l0Y2gocnVsZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJhbGxcIjogYWRkID0gMyA8PCAoMiAqIGlkMik7IGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSBcImVxdWFsXCI6IGFkZCA9IDIgPDwgKDIgKiBpZDIpOyBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ1bmVxdWFsXCI6IGFkZCA9IDEgPDwgKDIgKiBpZDIpOyBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgXCJub25lXCI6IGFkZCA9IDA7IGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxheWVyc1tpZDFdID0gKCh0aGlzLmxheWVyc1tpZDFdICYgY2xlYXIpIHwgYWRkKVxuICAgICAgICB9XG4gICAgICAgIGlmKGlkMSAhPSBpZDIpIHtcbiAgICAgICAgICAgIGlmKGlkMSA+PSAxNikge1xuICAgICAgICAgICAgICAgIGxldCBhZGQsIGNsZWFyID0gfigzIDw8ICgyICogaWQxIC0gMTYpKVxuICAgICAgICAgICAgICAgIHN3aXRjaChydWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJhbGxcIjogYWRkID0gMyA8PCAoMiAqIGlkMSAtIDE2KTsgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImVxdWFsXCI6IGFkZCA9IDIgPDwgKDIgKiBpZDEgLSAxNik7IGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJ1bmVxdWFsXCI6IGFkZCA9IDEgPDwgKDIgKiBpZDEgLSAxNik7IGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJub25lXCI6IGFkZCA9IDA7IGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2lkMiszMl0gPSAoKHRoaXMubGF5ZXJzW2lkMiszMl0gJiBjbGVhcikgfCBhZGQpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBhZGQsIGNsZWFyID0gfigzIDw8IDIgKiBpZDEpXG4gICAgICAgICAgICAgICAgc3dpdGNoKHJ1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImFsbFwiOiBhZGQgPSAzIDw8ICgyICogaWQxKTsgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImVxdWFsXCI6IGFkZCA9IDIgPDwgKDIgKiBpZDEpOyBicmVha1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwidW5lcXVhbFwiOiBhZGQgPSAxIDw8ICgyICogaWQxKTsgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm5vbmVcIjogYWRkID0gMDsgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaWQyXSA9ICgodGhpcy5sYXllcnNbaWQyXSAmIGNsZWFyKSB8IGFkZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBfZ2V0TGF5ZXJSdWxlKGlkMTogbnVtYmVyLCBpZDI6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGlmKGlkMiA8IDE2KSB7XG4gICAgICAgICAgICBsZXQgYiA9IDIgKiBpZDIsIGEgPSAzIDw8IGJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5sYXllcnNbaWQxXSAmIGEpID4+IGJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBiID0gKDIgKiBpZDIgLSAxNiksIGEgPSAzIDw8IGJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5sYXllcnNbaWQxICsgMzJdICYgYSkgPj4gYlxuICAgICAgICB9XG4gICAgfVxuICAgIGdldExheWVyUnVsZShsYXllcjE6IHN0cmluZywgbGF5ZXIyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBsZXQgaWQxID0gdGhpcy5sYXllcklkc1tsYXllcjFdLFxuICAgICAgICAgICAgaWQyID0gdGhpcy5sYXllcklkc1tsYXllcjJdXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2godGhpcy5fZ2V0TGF5ZXJSdWxlKGlkMSwgaWQyKSkge1xuICAgICAgICAgICAgY2FzZSAweDM6IHJldHVybiBcImFsbFwiXG4gICAgICAgICAgICBjYXNlIDB4MjogcmV0dXJuIFwiZXF1YWxcIlxuICAgICAgICAgICAgY2FzZSAweDE6IHJldHVybiBcInVuZXF1YWxcIlxuICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gXCJub25lXCJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tIFFVRVJZSU5HXG4gICAgcXVlcnlSZWN0KG1pbng6IG51bWJlciwgbWF4eDogbnVtYmVyLCBtaW55OiBudW1iZXIsIG1heHk6IG51bWJlciwgZmlsdGVyPzogdmIuRmlsdGVyPGVudC5Cb2R5Pikge1xuICAgICAgICBsZXQgZW50cyA9IHRoaXMudmJoLnF1ZXJ5UmVjdChtaW54LCBtYXh4LCBtaW55LCBtYXh5KSxcbiAgICAgICAgICAgIHJlcyA9IFtdXG5cbiAgICAgICAgZm9yKGxldCBlIG9mIGVudHMpIHtcbiAgICAgICAgICAgIGlmKGUuX2FsbEJvZHlDaGlsZHMpIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaC5hcHBseShyZXMsIGUuX2FsbEJvZHlDaGlsZHMucXVlcnlSZWN0KG1pbnggLSBlLl94LCBtYXh4IC0gZS5feCwgbWlueSAtIGUuX3ksIG1heHkgLSBlLl95LCBmaWx0ZXIpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHsgcmVzLnB1c2goZS5fYm9keUNoaWxkcykgfSBcbiAgICAgICAgICAgICAgICBlbHNlIHsgcmVzLnB1c2guYXBwbHkocmVzLCBlLl9ib2R5Q2hpbGRzLnF1ZXJ5UmVjdChtaW54IC0gZS5feCwgbWF4eCAtIGUuX3gsIG1pbnkgLSBlLl95LCBtYXh5IC0gZS5feSwgZmlsdGVyKSkgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH1cblxuICAgIHF1ZXJ5Q2lyY2xlKHg6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgZmlsdGVyPzogdmIuRmlsdGVyPGVudC5Cb2R5Pik6IGVudC5Cb2R5W10ge1xuICAgICAgICBsZXQgZW50cyA9IHRoaXMudmJoLnF1ZXJ5Q2lyY2xlKHgsIHksIHJhZGl1cyksXG4gICAgICAgICAgICByZXMgPSBbXVxuXG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBpZihlLl9hbGxCb2R5Q2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2guYXBwbHkocmVzLCBlLl9hbGxCb2R5Q2hpbGRzLnF1ZXJ5Q2lyY2xlKHggLSBlLl94LCB5IC0gZS5feSwgcmFkaXVzLCBmaWx0ZXIpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHsgcmVzLnB1c2goZS5fYm9keUNoaWxkcykgfSBcbiAgICAgICAgICAgICAgICBlbHNlIHsgcmVzLnB1c2guYXBwbHkocmVzLCBlLl9ib2R5Q2hpbGRzLnF1ZXJ5Q2lyY2xlKHggLSBlLl94LCB5IC0gZS5feSwgcmFkaXVzLCBmaWx0ZXIpKSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgbmVhcmVzdCh4OiBudW1iZXIsIHk6IG51bWJlciwgazogbnVtYmVyLCBmaWx0ZXI/OiB2Yi5GaWx0ZXI8ZW50LkVudGl0eT4pOiBlbnQuRW50aXR5W10gIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmJoLm5lYXJlc3QoeCwgeSwgaywgZmlsdGVyKVxuICAgIH1cblxuICAgIHJheWNhc3QoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgZmlsdGVyPzogdmIuRmlsdGVyPGVudC5Cb2R5Pik6IHZiLlJheWNhc3RSZXN1bHQ8ZW50LkJvZHk+ICB7XG4gICAgICAgIGxldCBlbnRzID0gdGhpcy52YmgucXVlcnlSZWN0KE1hdGgubWluKHgxLCB4MiksIE1hdGgubWF4KHgxLCB4MiksIE1hdGgubWluKHkxLCB5MiksIE1hdGgubWF4KHkxLCB5MikpLFxuICAgICAgICAgICAgcmVzOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiA9IG51bGwsXG4gICAgICAgICAgICB0bXA6IHZiLlJheWNhc3RSZXN1bHQ8ZW50LkJvZHk+ID0gbnVsbFxuXG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBpZihlLl9hbGxCb2R5Q2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgdG1wID0gZS5fYWxsQm9keUNoaWxkcy5yYXljYXN0KHgxIC0gZS5feCwgeTEgLSBlLl95LCB4MiAtIGUuX3gsIHkyIC0gZS5feSwgZmlsdGVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodmIuYWNjZXB0czxlbnQuQm9keT4oZS5fYm9keUNoaWxkcywgZmlsdGVyKSkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0dG1wOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiA9IHsgYm9keTogbnVsbCwgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IFwiYm90XCIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0aC5yYXljYXN0SGVscGVyPGVudC5Cb2R5PihlLl9ib2R5Q2hpbGRzLCAxMDAwMDAsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDIgLSB4MSwgeTIgLSB5MSwgeDEgLSBlLl94LCB5MSAtIGUuX3ksIHgyIC0gZS5feCwgeTIgLSBlLl95LCB0dG1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYodHRtcC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wID0gdHRtcFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgdG1wID0gZS5fYm9keUNoaWxkcy5yYXljYXN0KHgxIC0gZS5feCwgeTEgLSBlLl95LCB4MiAtIGUuX3gsIHkyIC0gZS5feSwgZmlsdGVyKSB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRtcCAmJiAoIXJlcyB8fCByZXMuZGlzdGFuY2UgPiB0bXAuZGlzdGFuY2UpKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gdG1wICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuICAgIHJheWNhc3RBbGwoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgZmlsdGVyPzogdmIuRmlsdGVyPGVudC5Cb2R5Pik6IHZiLlJheWNhc3RSZXN1bHQ8ZW50LkJvZHk+W10gIHtcbiAgICAgICAgbGV0IGVudHMgPSB0aGlzLnZiaC5xdWVyeVJlY3QoTWF0aC5taW4oeDEsIHgyKSwgTWF0aC5tYXgoeDEsIHgyKSwgTWF0aC5taW4oeTEsIHkyKSwgTWF0aC5tYXgoeTEsIHkyKSksXG4gICAgICAgICAgICByZXM6IHZiLlJheWNhc3RSZXN1bHQ8ZW50LkJvZHk+W10gPSBbXVxuXG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBpZihlLl9hbGxCb2R5Q2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgcmVzLnB1c2guYXBwbHkocmVzLCBlLl9hbGxCb2R5Q2hpbGRzLnJheWNhc3RBbGwoeDEgLSBlLl94LCB5MSAtIGUuX3ksIHgyIC0gZS5feCwgeTIgLSBlLl95LCBmaWx0ZXIpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHsgXG4gICAgICAgICAgICAgICAgICAgIGxldCB0dG1wOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiA9IHsgYm9keTogbnVsbCwgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IFwiYm90XCIgfVxuICAgICAgICAgICAgICAgICAgICBtYXRoLnJheWNhc3RIZWxwZXI8ZW50LkJvZHk+KGUuX2JvZHlDaGlsZHMsIDEwMDAwMCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgyIC0geDEsIHkyIC0geTEsIHgxIC0gZS5feCwgeTEgLSBlLl95LCB4MiAtIGUuX3gsIHkyIC0gZS5feSwgdHRtcClcbiAgICAgICAgICAgICAgICAgICAgaWYodHRtcC5ib2R5KSB7IHJlcy5wdXNoKHR0bXApIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgeyByZXMucHVzaC5hcHBseShlLl9ib2R5Q2hpbGRzLnJheWNhc3QoeDEgLSBlLl94LCB5MSAtIGUuX3ksIHgyIC0gZS5feCwgeTIgLSBlLl95LCBmaWx0ZXIpKSB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgcmF5Y2FzdFJlY3QoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIsIGZpbHRlcj86IHZiLkZpbHRlcjxlbnQuQm9keT4pOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiAge1xuICAgICAgICBsZXQgZW50cyA9IHRoaXMudmJoLnF1ZXJ5UmVjdChNYXRoLm1pbih4MSwgeDIpIC0gdywgTWF0aC5tYXgoeDEsIHgyKSArIHcsIE1hdGgubWluKHkxLCB5MikgLSBoLCBNYXRoLm1heCh5MSwgeTIpICsgaCksXG4gICAgICAgICAgICByZXM6IHZiLlJheWNhc3RSZXN1bHQ8ZW50LkJvZHk+ID0gbnVsbCxcbiAgICAgICAgICAgIHRtcDogdmIuUmF5Y2FzdFJlc3VsdDxlbnQuQm9keT4gPSBudWxsXG5cbiAgICAgICAgZm9yKGxldCBlIG9mIGVudHMpIHtcbiAgICAgICAgICAgIGlmKGUuX2FsbEJvZHlDaGlsZHMpIHtcbiAgICAgICAgICAgICAgICB0bXAgPSBlLl9hbGxCb2R5Q2hpbGRzLnJheWNhc3RSZWN0KHgxIC0gZS5feCwgeTEgLSBlLl95LCB4MiAtIGUuX3gsIHkyIC0gZS5feSwgdywgaCwgZmlsdGVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodmIuYWNjZXB0czxlbnQuQm9keT4oZS5fYm9keUNoaWxkcywgZmlsdGVyKSkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0dG1wOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiA9IHsgYm9keTogbnVsbCwgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IFwiYm90XCIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0aC5yYXljYXN0UmVjdEhlbHBlcjxlbnQuQm9keT4oZS5fYm9keUNoaWxkcywgMTAwMDAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHcsIGgsIHgyIC0geDEsIHkyIC0geTEsIHgxIC0gZS5feCwgeTEgLSBlLl95LCB4MiAtIGUuX3gsIHkyIC0gZS5feSwgdHRtcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR0bXAuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcCA9IHR0bXBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IHRtcCA9IGUuX2JvZHlDaGlsZHMucmF5Y2FzdFJlY3QoeDEgLSBlLl94LCB5MSAtIGUuX3ksIHgyIC0gZS5feCwgeTIgLSBlLl95LCB3LCBoLCBmaWx0ZXIpIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYodG1wICYmICghcmVzIHx8IHJlcy5kaXN0YW5jZSA+IHRtcC5kaXN0YW5jZSkpIHtcbiAgICAgICAgICAgICAgICByZXMgPSB0bXAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XG4gICAgcmF5Y2FzdFJlY3RBbGwoeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIsIGZpbHRlcj86IHZiLkZpbHRlcjxlbnQuQm9keT4pOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PltdICB7XG4gICAgICAgIGxldCBlbnRzID0gdGhpcy52YmgucXVlcnlSZWN0KE1hdGgubWluKHgxLCB4MikgLSB3LCBNYXRoLm1heCh4MSwgeDIpICsgdywgTWF0aC5taW4oeTEsIHkyKSAtIGgsIE1hdGgubWF4KHkxLCB5MikgKyBoKSxcbiAgICAgICAgICAgIHJlczogdmIuUmF5Y2FzdFJlc3VsdDxlbnQuQm9keT5bXSA9IFtdXG5cbiAgICAgICAgZm9yKGxldCBlIG9mIGVudHMpIHtcbiAgICAgICAgICAgIGlmKGUuX2FsbEJvZHlDaGlsZHMpIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaC5hcHBseShyZXMsIGUuX2FsbEJvZHlDaGlsZHMucmF5Y2FzdFJlY3RBbGwoeDEgLSBlLl94LCB5MSAtIGUuX3ksIHgyIC0gZS5feCwgeTIgLSBlLl95LCB3LCBoLCBmaWx0ZXIpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihlLl9ib2R5Q2hpbGRzIGluc3RhbmNlb2YgZW50LkJvZHkpIHsgXG4gICAgICAgICAgICAgICAgICAgIGxldCB0dG1wOiB2Yi5SYXljYXN0UmVzdWx0PGVudC5Cb2R5PiA9IHsgYm9keTogbnVsbCwgeDogMCwgeTogMCwgZGlzdGFuY2U6IDAsIHNpZGU6IFwiYm90XCIgfVxuICAgICAgICAgICAgICAgICAgICBtYXRoLnJheWNhc3RSZWN0SGVscGVyPGVudC5Cb2R5PihlLl9ib2R5Q2hpbGRzLCAxMDAwMDAsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3LCBoLCB4MiAtIHgxLCB5MiAtIHkxLCB4MSAtIGUuX3gsIHkxIC0gZS5feSwgeDIgLSBlLl94LCB5MiAtIGUuX3ksIHR0bXApXG4gICAgICAgICAgICAgICAgICAgIGlmKHR0bXAuYm9keSkgeyByZXMucHVzaCh0dG1wKSB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgcmVzLnB1c2guYXBwbHkoZS5fYm9keUNoaWxkcy5yYXljYXN0UmVjdEFsbCh4MSAtIGUuX3gsIHkxIC0gZS5feSwgeDIgLSBlLl94LCB5MiAtIGUuX3ksIHcsIGgsIGZpbHRlcikpIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgLy8gLS0gU0lNVUxBVElPTlxuICAgIHNpbXVsYXRlKHRpbWVEZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGlmKHRpbWVEZWx0YSA+IDAuNSkgeyB0aW1lRGVsdGEgPSAwLjUgfVxuICAgICAgICB0aGlzLnNpbSA9IHsgbmI6IHRoaXMuc2ltQ291bnQsIHN0YXJ0OiB0aGlzLnRpbWUsIGR1cmF0aW9uOiB0aW1lRGVsdGEsIGxldmVsczogW10gfVxuXG4gICAgICAgIC8vIC0tICBzcGVlZCBpbiB0aGUgdm9pZFxuICAgICAgICB0aGlzLmNvbXB1dGVWb2lkU3BlZWQodGltZURlbHRhKVxuXG4gICAgICAgIC8vIC0tIGJyb2FkcGhhc2VcbiAgICAgICAgdGhpcy5icm9hZHBoYXNlKClcblxuICAgICAgICAvLyAtLSBzaW11bGF0ZSB0aHJvdWdoIGxldmVsc1xuICAgICAgICB0aGlzLnNpbXVsYXRlTGV2ZWxzKHRpbWVEZWx0YSlcblxuICAgICAgICAvLyAtLSBzZXQgcG9zaXRpb24gKyByZXNldCBjYWNoZSBpbmZvXG4gICAgICAgIHRoaXMuY29tcHV0ZUZpbmFsUG9zaXRpb24odGltZURlbHRhKVxuXG4gICAgICAgIGZvcihsZXQgbGV2ZWwgaW4gdGhpcy5lbnRzKSB7XG4gICAgICAgICAgICBmb3IobGV0IGUgb2YgdGhpcy5lbnRzW2xldmVsXSkge1xuICAgICAgICAgICAgICAgIC8vIENBTENVTEFURSBTRU5TT1IgTE9TU1xuICAgICAgICAgICAgICAgIGUuZm9yYWxsVG9wQm9keSgoYjogZW50LkJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYoYi5faXNTZW5zb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqID0gMCwgbGVuID0gYi5ib3RDb250YWN0cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvdGhlciA9IGIuYm90Q29udGFjdHNbal1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihvdGhlci5fZW50aXR5Ll94ICsgb3RoZXIubWF4eCA8PSBlLl94ICsgYi5taW54IHx8IG90aGVyLl9lbnRpdHkuX3ggKyBvdGhlci5taW54ID49IGUuX3ggKyBlLm1heHggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgb3RoZXIuX2VudGl0eS5feSArIG90aGVyLm1heHkgPD0gZS5feCArIGUubWlueSB8fCBvdGhlci5fZW50aXR5Ll95ICsgb3RoZXIubWlueSA+PSBlLl94ICsgZS5tYXh5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuYm90Q29udGFjdHMuc3BsaWNlKGosIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogc2Vuc29yIGNvbnRhY3QgbG9zczogXCIgKyBlLm5hbWUgKyBcIiBcIiArIGUubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC8vIENBTENVTEFURSBJRiBUV08gRU5USVRZIFRPVUNIICAgIFxuICAgICAgICAgICAgICAgIC8vIGZvcihsZXQgY29udGFjdCBvZiBlLl9wb3RDb250YWN0KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIGlmKCFjb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9tYXJrZWQgJiYgIWNvbnRhY3Qub3RoZXJCb2R5Ll9pc1NlbnNvciAmJiAhY29udGFjdC5ib2R5Ll9pc1NlbnNvcikge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgbGV0IGJvZHkgPSBjb250YWN0LmJvZHksXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgb3RoZXIgPSBjb250YWN0Lm90aGVyQm9keSxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBzYW1lID0gb3RoZXIuX2VudGl0eS5fbGV2ZWwgPT0gYm9keS5fZW50aXR5Ll9sZXZlbCxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBoYW5kbGUgPSBmYWxzZVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaWYoc2FtZSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIGhhbmRsZSA9IGJvZHkudG9wQ29udGFjdHMuaW5kZXhPZihvdGhlcikgPCAwICYmIGJvZHkuYm90Q29udGFjdHMuaW5kZXhPZihvdGhlcikgPCAwIFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAmJiBib2R5LmxlZnRDb250YWN0cy5pbmRleE9mKG90aGVyKSA8IDAgJiYgYm9keS5yaWdodENvbnRhY3RzLmluZGV4T2Yob3RoZXIpIDwgMFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBoYW5kbGUgPSBib2R5LmhpZ2hlclRvcENvbnRhY3QgIT0gb3RoZXIgJiYgYm9keS5oaWdoZXJCb3RDb250YWN0ICE9IG90aGVyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICYmIGJvZHkuaGlnaGVyTGVmdENvbnRhY3QgIT0gb3RoZXIgJiYgYm9keS5oaWdoZXJSaWdodENvbnRhY3QgIT0gb3RoZXJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgaWYoaGFuZGxlKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgbGV0IG1pbngxID0gZS5feCArIGJvZHkubWlueCxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbWlueTEgPSBlLl95ICsgYm9keS5taW55LFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBtYXh4MSA9IGUuX3ggKyBib2R5Lm1heHgsXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIG1heHkxID0gZS5feSArIGJvZHkubWF4eSxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbWlueDIgPSBvdGhlci5fZW50aXR5Ll94ICsgb3RoZXIubWlueCxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbWlueTIgPSBvdGhlci5fZW50aXR5Ll95ICsgb3RoZXIubWlueSxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbWF4eDIgPSBvdGhlci5fZW50aXR5Ll94ICsgb3RoZXIubWF4eCxcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbWF4eTIgPSBvdGhlci5fZW50aXR5Ll95ICsgb3RoZXIubWF4eVxuXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgaWYoIShtaW55MSA+PSBtYXh5MiArIDAuMDAwMSB8fCBtYXh5MSArIDAuMDAwMSA8PSBtaW55MikpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgLy8gcmVjdCBsZWZ0LCBvdGhlciByaWdodFxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBpZihib2R5LnJpZ2h0Q29sbGlkZSAmJiBvdGhlci5sZWZ0Q29sbGlkZSAmJiBNYXRoLmFicyhtYXh4MSAtIG1pbngyKSA8IDAuMDAwMSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgaWYoc2FtZSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGUucmlnaHRDb250YWN0cy5wdXNoKHsgYm9keTogYm9keSwgb3RoZXJCb2R5OiBvdGhlciB9KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkucmlnaHRDb250YWN0cy5wdXNoKG90aGVyKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyLl9lbnRpdHkubGVmdENvbnRhY3RzLnB1c2goeyBib2R5OiBvdGhlciwgb3RoZXJCb2R5OiBib2R5IH0pXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXIubGVmdENvbnRhY3RzLnB1c2goYm9keSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IGpvaW4obGVmdCwgcmlnaHQpOiBcIiArIGUubmFtZSArIFwiIFwiICsgb3RoZXIuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmKCFib2R5LmhpZ2hlclJpZ2h0Q29udGFjdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGUuaGlnaGVyUmlnaHRDb250YWN0ID0geyBib2R5OiBib2R5LCBvdGhlckJvZHk6IG90aGVyIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBib2R5LmhpZ2hlclJpZ2h0Q29udGFjdCA9IG90aGVyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zaW1Db3VudCArIFwiOiBqb2luKGxlZnQsIHJpZ2h0KTogXCIgKyBlLm5hbWUgKyBcIiBcIiArIG90aGVyLl9lbnRpdHkubmFtZSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAvLyByZWN0IHJpZ2h0LCBvdGhlciBsZWZ0XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKGJvZHkubGVmdENvbGxpZGUgJiYgb3RoZXIucmlnaHRDb2xsaWRlICYmIE1hdGguYWJzKG1pbngxIC0gbWF4eDIpIDwgMC4wMDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBpZihzYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgZS5sZWZ0Q29udGFjdHMucHVzaCh7IGJvZHk6IGJvZHksIG90aGVyQm9keTogb3RoZXIgfSlcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBib2R5LmxlZnRDb250YWN0cy5wdXNoKG90aGVyKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyLl9lbnRpdHkucmlnaHRDb250YWN0cy5wdXNoKHsgYm9keTogb3RoZXIsIG90aGVyQm9keTogYm9keSB9KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyLnJpZ2h0Q29udGFjdHMucHVzaChib2R5KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogam9pbihyaWdodCwgbGVmdCk6IFwiICsgZS5uYW1lICsgXCIgXCIgKyBvdGhlci5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIWUuaGlnaGVyTGVmdENvbnRhY3QpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBlLmhpZ2hlckxlZnRDb250YWN0ID0geyBib2R5OiBib2R5LCBvdGhlckJvZHk6IG90aGVyIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBib2R5LmhpZ2hlckxlZnRDb250YWN0ID0gb3RoZXJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IGpvaW4ocmlnaHQsIGxlZnQpOiBcIiArIGUubmFtZSArIFwiIFwiICsgb3RoZXIuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBpZighKG1pbngxID49IG1heHgyICsgMC4wMDAxIHx8IG1heHgxICsgMC4wMDAxIDw9IG1pbngyKSkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAvLyByZWN0IGJvdCwgb3RoZXIgdG9wXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKGJvZHkudG9wQ29sbGlkZSAmJiBvdGhlci5ib3RDb2xsaWRlICYmIE1hdGguYWJzKG1heHkxIC0gbWlueTIpIDwgMC4wMDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBpZihzYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgZS50b3BDb250YWN0cy5wdXNoKHsgYm9keTogYm9keSwgb3RoZXJCb2R5OiBvdGhlciB9KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkudG9wQ29udGFjdHMucHVzaChvdGhlcilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlci5fZW50aXR5LmJvdENvbnRhY3RzLnB1c2goeyBib2R5OiBvdGhlciwgb3RoZXJCb2R5OiBib2R5IH0pXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXIuYm90Q29udGFjdHMucHVzaChib2R5KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogam9pbihib3QsIHRvcCk6IFwiICsgZS5uYW1lICsgXCIgXCIgKyBvdGhlci5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIWUuaGlnaGVyVG9wQ29udGFjdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGUuaGlnaGVyVG9wQ29udGFjdCA9IHsgYm9keTogYm9keSwgb3RoZXJCb2R5OiBvdGhlciB9XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5oaWdoZXJUb3BDb250YWN0ID0gb3RoZXJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IGpvaW4oYm90LCB0b3ApOiBcIiArIGUubmFtZSArIFwiIFwiICsgb3RoZXIuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAvLyByZWN0IHRvcCwgb3RoZXIgYm90XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIGlmKGJvZHkuYm90Q29sbGlkZSAmJiBvdGhlci50b3BDb2xsaWRlICYmIE1hdGguYWJzKG1pbnkxIC0gbWF4eTIpIDwgMC4wMDAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBpZihzYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgZS5ib3RDb250YWN0cy5wdXNoKHsgYm9keTogYm9keSwgb3RoZXJCb2R5OiBvdGhlciB9KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkuYm90Q29udGFjdHMucHVzaChvdGhlcilcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlci5fZW50aXR5LnRvcENvbnRhY3RzLnB1c2goeyBib2R5OiBvdGhlciwgb3RoZXJCb2R5OiBib2R5IH0pXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXIudG9wQ29udGFjdHMucHVzaChib2R5KVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogam9pbih0b3AsIGJvdCk6IFwiICsgZS5uYW1lICsgXCIgXCIgKyBvdGhlci5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIWJvZHkuaGlnaGVyQm90Q29udGFjdCkge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGUuaGlnaGVyQm90Q29udGFjdCA9IHsgYm9keTogYm9keSwgb3RoZXJCb2R5OiBvdGhlciB9XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgYm9keS5oaWdoZXJCb3RDb250YWN0ID0gb3RoZXJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IGpvaW4odG9wLCBib3QpOiBcIiArIGUubmFtZSArIFwiIFwiICsgb3RoZXIuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBlLl9wb3RDb250YWN0ID0gW11cbiAgICAgICAgICAgICAgICBlLl9uYXJyb3dDb3VudCA9IDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlLl9zbGlkZU9mZiA9IFtdXG5cbiAgICAgICAgICAgICAgICBlLmF4ID0gMFxuICAgICAgICAgICAgICAgIGUuYXkgPSAwXG4gICAgICAgICAgICAgICAgZS5fbWFya2VkID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IobGV0IGUgb2YgdGhpcy5lbnRzW2xldmVsXSkge1xuICAgICAgICAgICAgICAgIGUuX21hcmtlZCA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNpbXMucHVzaCh0aGlzLnNpbSlcbiAgICAgICAgdGhpcy5zaW1Db3VudCsrXG4gICAgICAgIHRoaXMudGltZSArPSB0aW1lRGVsdGFcbiAgICB9XG5cbiAgICBsb2dFbnRMaXN0KGVudHM6IGVudC5FbnRpdHlbXSk6IHN0cmluZyB7XG4gICAgICAgIGlmKGVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgcmVzOiBzdHJpbmcgPSBlbnRzWzBdLm5hbWUgKyBcIihcIiArIGVudHNbMF0uX2xldmVsICsgXCIpXCJcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMTsgaSA8IGVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXMgKz0gXCIsIFwiICsgZW50c1tpXS5uYW1lICsgXCIoXCIgKyBlbnRzW2ldLl9sZXZlbCArIFwiKVwiXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gLS0gTUFJTiBTVUIgUFJPQ0VEVVJFUyA6IFxuICAgIC8vIC0tIFRoZSBwcm9jZWR1cmVzIHRoYXQgYXJlIGNhbGxlZCBieSB0aGUgbWFpbiBzaW11bGF0aW9uIHByb2NlZHVyZXNcbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5cbiAgICAvLyAtLSBDT01QVVRFIFZPSUQgU1BFRURcbiAgICAvL1xuICAgIC8vIC0tIFBSRSA6IG5vbmVcbiAgICAvLyAtLSBQT1NUIDogcmVjdHMuX3JlbHYgaXMgc2V0IHRvIHRoZSBjb3JyZWN0IHNwZWVkXG4gICAgcHJpdmF0ZSBjb21wdXRlVm9pZFNwZWVkKHRpbWVEZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGZvcihsZXQgbGV2ZWwgaW4gdGhpcy5lbnRzKSB7XG4gICAgICAgICAgICBmb3IobGV0IGVudCBvZiB0aGlzLmVudHNbbGV2ZWxdKSB7XG4gICAgICAgICAgICAgICAgZW50LnJlbHZ4ICs9IGVudC5heCAqIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgIGVudC5yZWx2eSArPSBlbnQuYXkgKiB0aW1lRGVsdGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYnJvYWRwaGFzZUludGVyKGUxOiBlbnQuRW50aXR5LCBlMjogZW50LkVudGl0eSwgYjE6IGVudC5Cb2R5LCBiMjogZW50LkJvZHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlueDE6IG51bWJlciwgbWF4eDE6IG51bWJlciwgbWlueTE6IG51bWJlciwgbWF4eTE6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW54MjogbnVtYmVyLCBtYXh4MjogbnVtYmVyLCBtaW55MjogbnVtYmVyLCBtYXh5MjogbnVtYmVyKSB7XG4gICAgICAgIGlmKCEobWlueDEgPiBtYXh4MiB8fCBtaW54MiA+IG1heHgxIHx8IG1pbnkxID4gbWF4eTIgfHwgbWlueTIgPiBtYXh5MSkpIHtcbiAgICAgICAgICAgIGxldCBydWxlID0gdGhpcy5fZ2V0TGF5ZXJSdWxlKGIxLl9sYXllciwgYjIuX2xheWVyKVxuICAgICAgICAgICAgaWYocnVsZSA9PSAweDMgXG4gICAgICAgICAgICAgICAgfHwgKHJ1bGUgPT0gMHgyICYmIGIxLl9sYXllcmdyb3VwID09IGIyLl9sYXllcmdyb3VwKSBcbiAgICAgICAgICAgICAgICB8fCAocnVsZSA9PSAweDEgJiYgYjEuX2xheWVyZ3JvdXAgIT0gYjIuX2xheWVyZ3JvdXApKSB7XG4gICAgICAgICAgICAgICAgaWYoZTEuX2xldmVsID09IGUyLl9sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBlMS5fcG90Q29udGFjdC5wdXNoKHsgYm9keTogYjEsIG90aGVyQm9keTogYjIgfSlcbiAgICAgICAgICAgICAgICAgICAgZTIuX3BvdENvbnRhY3QucHVzaCh7IGJvZHk6IGIyLCBvdGhlckJvZHk6IGIxIH0pXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZTEuX2xldmVsIDwgZTIuX2xldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlMi5fcG90Q29udGFjdC5wdXNoKHsgYm9keTogYjIsIG90aGVyQm9keTogYjEgfSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUxLl9wb3RDb250YWN0LnB1c2goeyBib2R5OiBiMSwgb3RoZXJCb2R5OiBiMiB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHByaXZhdGUgYnJvYWRwaGFzZSgpIHtcbiAgICAgICAgLy8gLS0gdXBkYXRlIHJlZ2lvbiBpbmZvcm1hdGlvblxuICAgICAgICB0aGlzLnZiaC51cGRhdGUoKVxuICAgICAgICBsZXQgY29sbGlzaW9ucyA9IHRoaXMudmJoLmNvbGxpc2lvbnMoKVxuXG4gICAgICAgIC8vIC0tIGF0dHJpYnV0ZSBwb3RlbnRpYWwgZnV0dXJlIGNvbGxpc2lvbnNcbiAgICAgICAgZm9yKGxldCBjb2xsaXNpb24gb2YgY29sbGlzaW9ucykge1xuICAgICAgICAgICAgbGV0IGUxID0gY29sbGlzaW9uWzBdLCBlMiA9IGNvbGxpc2lvblsxXVxuXG4gICAgICAgICAgICBpZihlMS5fZW5hYmxlZCAmJiBlMi5fZW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIGxldCB2MSA9IChlMS5fYWxsQm9keUNoaWxkcyA/IGUxLl9hbGxCb2R5Q2hpbGRzIDogZTEuX2JvZHlDaGlsZHMpLFxuICAgICAgICAgICAgICAgICAgICB2MiA9IChlMi5fYWxsQm9keUNoaWxkcyA/IGUyLl9hbGxCb2R5Q2hpbGRzIDogZTIuX2JvZHlDaGlsZHMpXG5cbiAgICAgICAgICAgICAgICBpZih2MSBpbnN0YW5jZW9mIGVudC5Cb2R5ICYmIHYyIGluc3RhbmNlb2YgZW50LkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYodjEucGh5c2ljYWwgJiYgdjIucGh5c2ljYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW54MSA9IGUxLl94ICsgdjEuX3ggLSB2MS53aWR0aC8yICAtIE1hdGguYWJzKGUxLl92eCkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heHgxID0gZTEuX3ggKyB2MS5feCArIHYxLndpZHRoLzIgICsgTWF0aC5hYnMoZTEuX3Z4KSArIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlueTEgPSBlMS5feSArIHYxLl95IC0gdjEuaGVpZ2h0LzIgLSBNYXRoLmFicyhlMS5fdnkpIC0gZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXh5MSA9IGUxLl95ICsgdjEuX3kgKyB2MS5oZWlnaHQvMiArIE1hdGguYWJzKGUxLl92eSkgKyBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbngyID0gZTIuX3ggKyB2Mi5feCAtIHYyLndpZHRoLzIgIC0gTWF0aC5hYnMoZTIuX3Z4KSAtIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eDIgPSBlMi5feCArIHYyLl94ICsgdjIud2lkdGgvMiAgKyBNYXRoLmFicyhlMi5fdngpICsgZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW55MiA9IGUyLl95ICsgdjIuX3kgLSB2Mi5oZWlnaHQvMiAtIE1hdGguYWJzKGUyLl92eSkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heHkyID0gZTIuX3kgKyB2Mi5feSArIHYyLmhlaWdodC8yICsgTWF0aC5hYnMoZTIuX3Z5KSArIGVudC5BQUJCX1NLSU5cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZHBoYXNlSW50ZXIoZTEsIGUyLCB2MSwgdjIsIG1pbngxLCBtYXh4MSwgbWlueTEsIG1heHkxLCBtaW54MiwgbWF4eDIsIG1pbnkyLCBtYXh5MilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHYxIGluc3RhbmNlb2YgZW50LkJvZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHYxLnBoeXNpY2FsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1pbngxID0gZTEuX3ggKyB2MS5feCAtIHYxLndpZHRoLzIgLSBNYXRoLmFicyhlMS5fdngpIC0gZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eDEgPSBlMS5feCArIHYxLl94ICsgdjEud2lkdGgvMiArIE1hdGguYWJzKGUxLl92eCkgKyBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW55MSA9IGUxLl95ICsgdjEuX3kgLSB2MS5oZWlnaHQvMiAtIE1hdGguYWJzKGUxLl92eSkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXh5MSA9IGUxLl95ICsgdjEuX3kgKyB2MS5oZWlnaHQvMiArIE1hdGguYWJzKGUxLl92eSkgKyBlbnQuQUFCQl9TS0lOO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKDx2Yi5WQkg8ZW50LkJvZHk+PnYyKS5mb3JhbGwoKGI6IGVudC5Cb2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGIucGh5c2ljYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW54MiA9IGUyLl94ICsgYi5feCAtIGIud2lkdGgvMiAtIE1hdGguYWJzKGUyLl92eCkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heHgyID0gZTIuX3ggKyBiLl94ICsgYi53aWR0aC8yICsgTWF0aC5hYnMoZTIuX3Z4KSArIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlueTIgPSBlMi5feSArIGIuX3kgLSBiLmhlaWdodC8yIC0gTWF0aC5hYnMoZTIuX3Z5KSAtIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eTIgPSBlMi5feSArIGIuX3kgKyBiLmhlaWdodC8yICsgTWF0aC5hYnMoZTIuX3Z5KSArIGVudC5BQUJCX1NLSU5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZHBoYXNlSW50ZXIoZTEsIGUyLCA8ZW50LkJvZHk+djEsIGIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW54MSwgbWF4eDEsIG1pbnkxLCBtYXh5MSwgbWlueDIsIG1heHgyLCBtaW55MiwgbWF4eTIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYodjIgaW5zdGFuY2VvZiBlbnQuQm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodjIucGh5c2ljYWwpIHsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1pbngxID0gZTIuX3ggKyB2Mi5feCAtIHYyLndpZHRoLzIgLSBNYXRoLmFicyhlMi5fdngpIC0gZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eDEgPSBlMi5feCArIHYyLl94ICsgdjIud2lkdGgvMiArIE1hdGguYWJzKGUyLl92eCkgKyBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW55MSA9IGUyLl95ICsgdjIuX3kgLSB2Mi5oZWlnaHQvMiAtIE1hdGguYWJzKGUyLl92eSkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXh5MSA9IGUyLl95ICsgdjIuX3kgKyB2Mi5oZWlnaHQvMiArIE1hdGguYWJzKGUyLl92eSkgKyBlbnQuQUFCQl9TS0lOO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKDx2Yi5WQkg8ZW50LkJvZHk+PnYxKS5mb3JhbGwoKGI6IGVudC5Cb2R5KSA9PiB7ICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYi5waHlzaWNhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1pbngyID0gZTEuX3ggKyBiLl94IC0gYi53aWR0aC8yIC0gTWF0aC5hYnMoZTEuX3Z4KSAtIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eDIgPSBlMS5feCArIGIuX3ggKyBiLndpZHRoLzIgKyBNYXRoLmFicyhlMS5fdngpICsgZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW55MiA9IGUxLl95ICsgYi5feSAtIGIuaGVpZ2h0LzIgLSBNYXRoLmFicyhlMS5fdnkpIC0gZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXh5MiA9IGUxLl95ICsgYi5feSArIGIuaGVpZ2h0LzIgKyBNYXRoLmFicyhlMS5fdnkpICsgZW50LkFBQkJfU0tJTlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb2FkcGhhc2VJbnRlcihlMiwgZTEsIDxlbnQuQm9keT52MiwgYiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbngxLCBtYXh4MSwgbWlueTEsIG1heHkxLCBtaW54MiwgbWF4eDIsIG1pbnkyLCBtYXh5MilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2MS5mb3JhbGwoKGIxOiBlbnQuQm9keSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGIxLnBoeXNpY2FsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW54MSA9IGUxLl94ICsgYjEuX3ggLSBiMS53aWR0aC8yIC0gTWF0aC5hYnMoZTEuX3Z4KSAtIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXh4MSA9IGUxLl94ICsgYjEuX3ggKyBiMS53aWR0aC8yICsgTWF0aC5hYnMoZTEuX3Z4KSArIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW55MSA9IGUxLl95ICsgYjEuX3kgLSBiMS5oZWlnaHQvMiAtIE1hdGguYWJzKGUxLl92eSkgLSBlbnQuQUFCQl9TS0lOLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eTEgPSBlMS5feSArIGIxLl95ICsgYjEuaGVpZ2h0LzIgKyBNYXRoLmFicyhlMS5fdnkpICsgZW50LkFBQkJfU0tJTjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoPHZiLlZCSDxlbnQuQm9keT4+djIpLmZvcmFsbCgoYjI6IGVudC5Cb2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihiMi5waHlzaWNhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtaW54MiA9IGUyLl94ICsgYjIuX3ggLSBiMi53aWR0aC8yIC0gTWF0aC5hYnMoZTIuX3Z4KSAtIGVudC5BQUJCX1NLSU4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heHgyID0gZTIuX3ggKyBiMi5feCArIGIyLndpZHRoLzIgKyBNYXRoLmFicyhlMi5fdngpICsgZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlueTIgPSBlMi5feSArIGIyLl95IC0gYjIuaGVpZ2h0LzIgLSBNYXRoLmFicyhlMi5fdnkpIC0gZW50LkFBQkJfU0tJTixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4eTIgPSBlMi5feSArIGIyLl95ICsgYjIuaGVpZ2h0LzIgKyBNYXRoLmFicyhlMi5fdnkpICsgZW50LkFBQkJfU0tJTlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm9hZHBoYXNlSW50ZXIoZTEsIGUyLCBiMSwgYjIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWlueDEsIG1heHgxLCBtaW55MSwgbWF4eTEsIG1pbngyLCBtYXh4MiwgbWlueTIsIG1heHkyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNpbS5jb2xsaXNpb25zID0gY29sbGlzaW9uc1xuICAgIH1cblxuICAgIHByaXZhdGUgc2ltdWxhdGVMZXZlbHModGltZURlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgZm9yKGxldCBsIGluIHRoaXMuZW50cykge1xuICAgICAgICAgICAgbGV0IGxldmVsOiBudW1iZXIgPSBwYXJzZUludChsKSxcbiAgICAgICAgICAgICAgICBlbnRzOiBlbnQuRW50aXR5W10gPSB0aGlzLmVudHNbbF0sXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uVGltZWxpbmU6IE5hcnJvd1Jlc3VsdFtdID0gW10sXG4gICAgICAgICAgICAgICAgbmV4dENvbGxpc2lvbjogTmFycm93UmVzdWx0XG5cbiAgICAgICAgICAgIHRoaXMuc2ltbGV2ZWwgPSB7IFxuICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCwgXG4gICAgICAgICAgICAgICAgY29sbGlzaW9uczogW10sXG4gICAgICAgICAgICAgICAgbmFycm93cGhhc2VzOiBbXSxcbiAgICAgICAgICAgICAgICBzb2x2ZTogW10sXG4gICAgICAgICAgICAgICAgc2xpZGVvZmY6IFtdXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC0tIGluaXRpYWwgc3BlZWQgY2FsY3VsYXRpb25cbiAgICAgICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYoZS5fcGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGUuX3Z4ID0gZS5yZWx2eCArIGUuX3BhcmVudC5fc2ltdnhcbiAgICAgICAgICAgICAgICAgICAgZS5fdnkgPSBlLnJlbHZ5ICsgZS5fcGFyZW50Ll9zaW12eVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGUuX3Z4ID0gZS5yZWx2eFxuICAgICAgICAgICAgICAgICAgICBlLl92eSA9IGUucmVsdnlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBlLl9sYXN0eCA9IGUuX3hcbiAgICAgICAgICAgICAgICBlLl9sYXN0eSA9IGUuX3lcbiAgICAgICAgICAgICAgICBlLl9sYXN0VGltZSA9IDBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zb2x2ZUluaXQoZW50cywgdGltZURlbHRhKVxuXG4gICAgICAgICAgICAvLyAtLSBpbml0aWFsIG5hcnJvd3BoYXNlXG4gICAgICAgICAgICB0aGlzLm5hcnJvd1BoYXNlcyhlbnRzLCBsZXZlbCwgdGltZURlbHRhLCAwLCBjb2xsaXNpb25UaW1lbGluZSlcblxuICAgICAgICAgICAgLy8gLS0gaGFuZGxlIGV2ZW50c1xuICAgICAgICAgICAgbmV4dENvbGxpc2lvbiA9IGNvbGxpc2lvblRpbWVsaW5lLmxlbmd0aCA+IDAgPyBjb2xsaXNpb25UaW1lbGluZS5zaGlmdCgpIDogbnVsbFxuXG4gICAgICAgICAgICB3aGlsZShuZXh0Q29sbGlzaW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaW1sZXZlbC5jb2xsaXNpb25zLnB1c2gobmV4dENvbGxpc2lvbilcblxuICAgICAgICAgICAgICAgIGlmKG5leHRDb2xsaXNpb24uYm9keTEuX2lzU2Vuc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDb2xsaXNpb24uYm9keTEuYm90Q29udGFjdHMucHVzaChuZXh0Q29sbGlzaW9uLmJvZHkyKVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogc2Vuc29yIGNvbGxpc2lvbjogXCIgKyBuZXh0Q29sbGlzaW9uLmJvZHkxLl9lbnRpdHkubmFtZSArIFwiIFwiICsgbmV4dENvbGxpc2lvbi5ib2R5Mi5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5leHRDb2xsaXNpb24pXG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBpZihuZXh0Q29sbGlzaW9uLmJvZHkyLl9pc1NlbnNvcikge1xuICAgICAgICAgICAgICAgICAgICBuZXh0Q29sbGlzaW9uLmJvZHkyLmJvdENvbnRhY3RzLnB1c2gobmV4dENvbGxpc2lvbi5ib2R5MSlcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNlbnNvciBjb2xsaXNpb246IFwiICsgbmV4dENvbGxpc2lvbi5ib2R5MS5fZW50aXR5Lm5hbWUgKyBcIiBcIiArIG5leHRDb2xsaXNpb24uYm9keTIuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXh0Q29sbGlzaW9uKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZighbmV4dENvbGxpc2lvbi5ib2R5MS5faXNTZW5zb3IgJiYgIW5leHRDb2xsaXNpb24uYm9keTIuX2lzU2Vuc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogY29sbGlzaW9uOiBcIiArIG5leHRDb2xsaXNpb24uYm9keTEuX2VudGl0eS5uYW1lICsgXCIgXCIgKyBuZXh0Q29sbGlzaW9uLmJvZHkyLl9lbnRpdHkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV4dENvbGxpc2lvbilcbiAgICAgICAgICAgICAgICAgICAgLy8gLS0gdXBkYXRlIGNvbnRhY3RzXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ29udGFjdHMobmV4dENvbGxpc2lvbi5ib2R5MSwgbmV4dENvbGxpc2lvbi5ib2R5MiwgbmV4dENvbGxpc2lvbi5pc1gpXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gLS0gcmUgY2x1bXAgKG1lcmdlL3NwbGl0KVxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kaWZpZWQgPSB0aGlzLnNvbHZlTmV3Q29udGFjdChuZXh0Q29sbGlzaW9uLCB0aW1lRGVsdGEpXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gLS0gZWxpbWluYXRlIG5hcnJvdyBwaGFzZXNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDb2xsaXNpb25FdmVudHMobW9kaWZpZWQsIGNvbGxpc2lvblRpbWVsaW5lKVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIC0tICBuZXcgbmFycm93IHBoYXNlc1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hcnJvd1BoYXNlcyhtb2RpZmllZCwgbGV2ZWwsIHRpbWVEZWx0YSwgbmV4dENvbGxpc2lvbi50aW1lLCBjb2xsaXNpb25UaW1lbGluZSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBuZXh0Q29sbGlzaW9uID0gY29sbGlzaW9uVGltZWxpbmUubGVuZ3RoID4gMCA/IGNvbGxpc2lvblRpbWVsaW5lLnNoaWZ0KCkgOiBudWxsXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2xpZGVPZmZzKGVudHMsIHRpbWVEZWx0YSlcblxuICAgICAgICAgICAgLy8gLS0gcHJlcGFyZSBmb3IgbG93ZXIgbGV2ZWxcbiAgICAgICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICAgICAgZS5fc2ltdnggPSAoZS5fbGFzdHggKyBlLl92eCAqICh0aW1lRGVsdGEgLSBlLl9sYXN0VGltZSkgLSBlLl94KSAvIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgIGUuX3NpbXZ5ID0gKGUuX2xhc3R5ICsgZS5fdnkgKiAodGltZURlbHRhIC0gZS5fbGFzdFRpbWUpIC0gZS5feSkgLyB0aW1lRGVsdGFcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zaW0ubGV2ZWxzLnB1c2godGhpcy5zaW1sZXZlbClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY29tcHV0ZUZpbmFsUG9zaXRpb24odGltZURlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgZm9yKGxldCBsZXZlbCBpbiB0aGlzLmVudHMpIHtcbiAgICAgICAgICAgIGZvcihsZXQgcmVjdCBvZiB0aGlzLmVudHNbbGV2ZWxdKSB7XG4gICAgICAgICAgICAgICAgcmVjdC5feCA9IHJlY3QuX2xhc3R4ICsgcmVjdC5fdnggKiAodGltZURlbHRhIC0gcmVjdC5fbGFzdFRpbWUpXG4gICAgICAgICAgICAgICAgcmVjdC5feSA9IHJlY3QuX2xhc3R5ICsgcmVjdC5fdnkgKiAodGltZURlbHRhIC0gcmVjdC5fbGFzdFRpbWUpXG5cbiAgICAgICAgICAgICAgICBpZihyZWN0Ll9wYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdC5yZWx2eCA9IHJlY3QuX3Z4IC0gcmVjdC5fcGFyZW50Ll9zaW12eFxuICAgICAgICAgICAgICAgICAgICByZWN0LnJlbHZ5ID0gcmVjdC5fdnkgLSByZWN0Ll9wYXJlbnQuX3NpbXZ5XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdC5yZWx2eCA9IHJlY3QuX3Z4XG4gICAgICAgICAgICAgICAgICAgIHJlY3QucmVsdnkgPSByZWN0Ll92eVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5hcnJvd1BoYXNlKGIxOiBlbnQuQm9keSwgbGV2ZWwxOiBudW1iZXIsIHRpbWUxOiBudW1iZXIsIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHZ4MTogbnVtYmVyLCB2eTE6IG51bWJlciwgXG4gICAgICAgICAgICAgICAgYjI6IGVudC5Cb2R5LCBsZXZlbDI6IG51bWJlciwgdGltZTI6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgdngyOiBudW1iZXIsIHZ5MjogbnVtYmVyLFxuICAgICAgICAgICAgICAgIG1heFRpbWU6IG51bWJlcik6IE5hcnJvd1Jlc3VsdCB7XG4gICAgICAgIC8vIC0tICB0aW1lIGluZm9ybWF0aW9uICh3aG8gbW92ZXMgZmlyc3Q/KVxuICAgICAgICBsZXQgc3RhcnREZWx0YTEsXG4gICAgICAgICAgICBzdGFydERlbHRhMixcbiAgICAgICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHRvaXggPSAxMDAwLFxuICAgICAgICAgICAgdG9peSA9IDEwMDAsXG4gICAgICAgICAgICBuYXJyb3c6IE5hcnJvd1Jlc3VsdFxuXG4gICAgICAgIGlmKHRpbWUxIDwgdGltZTIpIHtcbiAgICAgICAgICAgIHN0YXJ0RGVsdGExID0gdGltZTIgLSB0aW1lMVxuICAgICAgICAgICAgc3RhcnREZWx0YTIgPSAwXG4gICAgICAgICAgICBzdGFydFRpbWUgPSB0aW1lMlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnREZWx0YTIgPSB0aW1lMSAtIHRpbWUyXG4gICAgICAgICAgICBzdGFydERlbHRhMSA9IDBcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IHRpbWUxXG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLSAgVE9JXG4gICAgICAgIGlmKCghYjEuX2lzU2Vuc29yIHx8IGIxLmJvdENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMCkgJiYgKCFiMi5faXNTZW5zb3IgfHwgYjIuYm90Q29udGFjdHMuaW5kZXhPZihiMSkgPCAwKSkge1xuICAgICAgICBpZih2eDEgIT0gdngyKSB7XG4gICAgICAgICAgICBpZih4MSA8IHgyKSB7XG4gICAgICAgICAgICAgICAgaWYoYjEucmlnaHRDb2xsaWRlICYmIGIyLmxlZnRDb2xsaWRlICYmIFxuICAgICAgICAgICAgICAgIChsZXZlbDEgPT0gbGV2ZWwyICYmIGIxLnJpZ2h0Q29udGFjdHMuaW5kZXhPZihiMikgPCAwICYmIGIxLnRvcENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMCAmJiBiMS5ib3RDb250YWN0cy5pbmRleE9mKGIyKSA8IDBcbiAgICAgICAgICAgICAgICB8fCBsZXZlbDEgPiBsZXZlbDIgJiYgYjEuaGlnaGVyUmlnaHRDb250YWN0ICE9IGIyICYmIGIxLmhpZ2hlclRvcENvbnRhY3QgIT0gYjIgJiYgYjEuaGlnaGVyQm90Q29udGFjdCAhPSBiMlxuICAgICAgICAgICAgICAgIHx8IGxldmVsMSA8IGxldmVsMiAmJiBiMi5oaWdoZXJMZWZ0Q29udGFjdCAhPSBiMSAmJiBiMi5oaWdoZXJUb3BDb250YWN0ICE9IGIxICYmIGIyLmhpZ2hlckJvdENvbnRhY3QgIT0gYjEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvaXggPSAoeDEgLSB4MiAtIHZ4MiAqIHN0YXJ0RGVsdGEyICsgdngxICogc3RhcnREZWx0YTEgKyAoYjEud2lkdGggKyBiMi53aWR0aCkgLyAyKSAvICh2eDIgLSB2eDEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZihiMS5sZWZ0Q29sbGlkZSAmJiBiMi5yaWdodENvbGxpZGUgJiYgXG4gICAgICAgICAgICAgICAgKGxldmVsMSA9PSBsZXZlbDIgJiYgYjEubGVmdENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMCAmJiBiMS50b3BDb250YWN0cy5pbmRleE9mKGIyKSA8IDAgJiYgYjEuYm90Q29udGFjdHMuaW5kZXhPZihiMikgPCAwXG4gICAgICAgICAgICAgICAgfHwgbGV2ZWwxID4gbGV2ZWwyICYmIGIxLmhpZ2hlckxlZnRDb250YWN0ICE9IGIyICYmIGIxLmhpZ2hlclRvcENvbnRhY3QgIT0gYjIgJiYgYjEuaGlnaGVyQm90Q29udGFjdCAhPSBiMlxuICAgICAgICAgICAgICAgIHx8IGxldmVsMSA8IGxldmVsMiAmJiBiMi5oaWdoZXJSaWdodENvbnRhY3QgIT0gYjEgJiYgYjIuaGlnaGVyVG9wQ29udGFjdCAhPSBiMSAmJiBiMi5oaWdoZXJCb3RDb250YWN0ICE9IGIxKSkge1xuICAgICAgICAgICAgICAgICAgICB0b2l4ID0gKHgxIC0geDIgLSB2eDIgKiBzdGFydERlbHRhMiArIHZ4MSAqIHN0YXJ0RGVsdGExIC0gKGIxLndpZHRoICsgYjIud2lkdGgpIC8gMikgLyAodngyIC0gdngxKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYodnkxICE9IHZ5Mikge1xuICAgICAgICAgICAgaWYoeTEgPCB5Mikge1xuICAgICAgICAgICAgICAgIGlmKGIxLnRvcENvbGxpZGUgJiYgYjIuYm90Q29sbGlkZSAmJiBcbiAgICAgICAgICAgICAgICAobGV2ZWwxID09IGxldmVsMiAmJiBiMS50b3BDb250YWN0cy5pbmRleE9mKGIyKSA8IDAgJiYgYjEubGVmdENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMCAmJiBiMS5yaWdodENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMFxuICAgICAgICAgICAgICAgIHx8IGxldmVsMSA+IGxldmVsMiAmJiBiMS5oaWdoZXJUb3BDb250YWN0ICE9IGIyICYmIGIxLmhpZ2hlckxlZnRDb250YWN0ICE9IGIyICYmIGIxLmhpZ2hlclJpZ2h0Q29udGFjdCAhPSBiMlxuICAgICAgICAgICAgICAgIHx8IGxldmVsMSA8IGxldmVsMiAmJiBiMi5oaWdoZXJCb3RDb250YWN0ICE9IGIxICYmIGIyLmhpZ2hlckxlZnRDb250YWN0ICE9IGIxICYmIGIyLmhpZ2hlclJpZ2h0Q29udGFjdCAhPSBiMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9peSA9ICh5MSAtIHkyIC0gdnkyICogc3RhcnREZWx0YTIgKyB2eTEgKiBzdGFydERlbHRhMSArIChiMS5oZWlnaHQgKyBiMi5oZWlnaHQpIC8gMikgLyAodnkyIC0gdnkxKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYoYjEuYm90Q29sbGlkZSAmJiBiMi50b3BDb2xsaWRlICYmIFxuICAgICAgICAgICAgICAgIChsZXZlbDEgPT0gbGV2ZWwyICYmIGIxLmJvdENvbnRhY3RzLmluZGV4T2YoYjIpIDwgMCAmJiBiMS5sZWZ0Q29udGFjdHMuaW5kZXhPZihiMikgPCAwICYmIGIxLnJpZ2h0Q29udGFjdHMuaW5kZXhPZihiMikgPCAwXG4gICAgICAgICAgICAgICAgfHwgbGV2ZWwxID4gbGV2ZWwyICYmIGIxLmhpZ2hlckJvdENvbnRhY3QgIT0gYjIgJiYgYjEuaGlnaGVyTGVmdENvbnRhY3QgIT0gYjIgJiYgYjEuaGlnaGVyUmlnaHRDb250YWN0ICE9IGIyXG4gICAgICAgICAgICAgICAgfHwgbGV2ZWwxIDwgbGV2ZWwyICYmIGIyLmhpZ2hlclRvcENvbnRhY3QgIT0gYjEgJiYgYjIuaGlnaGVyTGVmdENvbnRhY3QgIT0gYjEgJiYgYjIuaGlnaGVyUmlnaHRDb250YWN0ICE9IGIxKSkge1xuICAgICAgICAgICAgICAgICAgICB0b2l5ID0gKHkxIC0geTIgLSB2eTIgKiBzdGFydERlbHRhMiArIHZ5MSAqIHN0YXJ0RGVsdGExIC0gKGIxLmhlaWdodCArIGIyLmhlaWdodCkgLyAyKSAvICh2eTIgLSB2eTEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICBpZigodG9peCA8IHRvaXkgfHwgdG9peSA8IDApICYmIHN0YXJ0VGltZSArIHRvaXggPCBtYXhUaW1lICYmIHRvaXggPiAwKSB7IFxuICAgICAgICAgICAgbGV0IG5ld3kxID0geTEgKyAodG9peCArIHN0YXJ0RGVsdGExKSAqIHZ5MSxcbiAgICAgICAgICAgICAgICBuZXd5MiA9IHkyICsgKHRvaXggKyBzdGFydERlbHRhMikgKiB2eTJcblxuICAgICAgICAgICAgaWYoIShuZXd5MiAtIGIyLmhlaWdodC8yID4gbmV3eTEgKyBiMS5oZWlnaHQvMiB8fCBuZXd5MSAtIGIxLmhlaWdodC8yID4gbmV3eTIgKyBiMi5oZWlnaHQvMikpIHtcbiAgICAgICAgICAgICAgICBpZih4MSA8IHgyKSB7XG4gICAgICAgICAgICAgICAgICAgIG5hcnJvdyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IHN0YXJ0VGltZSArIHRvaXgsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHgxOiB4MSArICh0b2l4ICsgc3RhcnREZWx0YTEpICogdngxLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTE6IG5ld3kxLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTE6IGIxLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4MjogeDIgKyAodG9peCArIHN0YXJ0RGVsdGEyKSAqIHZ4MixcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyOiBuZXd5MixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkyOiBiMixcblxuICAgICAgICAgICAgICAgICAgICAgICAgaXNYOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuYXJyb3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBzdGFydFRpbWUgKyB0b2l4LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4MjogeDEgKyAodG9peCArIHN0YXJ0RGVsdGExKSAqIHZ4MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyOiBuZXd5MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkyOiBiMSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgeDE6IHgyICsgKHRvaXggKyBzdGFydERlbHRhMikgKiB2eDIsXG4gICAgICAgICAgICAgICAgICAgICAgICB5MTogbmV3eTIsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5MTogYjIsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzWDogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IFxuICAgICAgICBcbiAgICAgICAgaWYoc3RhcnRUaW1lICsgdG9peSA8IG1heFRpbWUgJiYgdG9peSA+IDApIHsgXG4gICAgICAgICAgICBsZXQgbmV3eDEgPSB4MSArICh0b2l5ICsgc3RhcnREZWx0YTEpICogdngxLFxuICAgICAgICAgICAgICAgIG5ld3gyID0geDIgKyAodG9peSArIHN0YXJ0RGVsdGEyKSAqIHZ4MlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighKG5ld3gyIC0gYjIud2lkdGgvMiA+IG5ld3gxICsgYjEud2lkdGgvMiB8fCBuZXd4MSAtIGIxLndpZHRoLzIgPiBuZXd4MiArIGIyLndpZHRoLzIpKSB7XG4gICAgICAgICAgICAgICAgaWYoeTEgPCB5Mikge1xuICAgICAgICAgICAgICAgICAgICBuYXJyb3cgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lOiBzdGFydFRpbWUgKyB0b2l5LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4MTogbmV3eDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB5MTogeTEgKyAodG9peSArIHN0YXJ0RGVsdGExKSAqIHZ5MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkxOiBiMSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgeDI6IG5ld3gyLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTI6IHkyICsgKHRvaXkgKyBzdGFydERlbHRhMikgKiB2eTIsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5MjogYjIsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzWDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5hcnJvdyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWU6IHN0YXJ0VGltZSArIHRvaXksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHgyOiBuZXd4MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkyOiB5MSArICh0b2l5ICsgc3RhcnREZWx0YTEpICogdnkxLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTI6IGIxLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB4MTogbmV3eDIsXG4gICAgICAgICAgICAgICAgICAgICAgICB5MTogeTIgKyAodG9peSArIHN0YXJ0RGVsdGEyKSAqIHZ5MixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkxOiBiMixcblxuICAgICAgICAgICAgICAgICAgICAgICAgaXNYOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IFxuXG4gICAgICAgIHJldHVybiBuYXJyb3dcbiAgICB9XG5cbiAgICAvLyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICAgLy8gLS0gU0lNVUxBVElPTiBTVUIgUFJPQ0VEVVJFUyA6IFxuICAgIC8vIC0tIFRoZSBwcm9jZWR1cmVzIHRoYXQgYXJlIGNhbGxlZCBkdXJpbmcgdGhlIGRpZmZlcmVudFxuICAgIC8vIC0tIGV2ZW50cyBhcmUgaGFuZGxlZFxuICAgIC8vICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAgIHVwZGF0ZUNvbnRhY3RzKGJvZHkxOiBlbnQuQm9keSwgYm9keTI6IGVudC5Cb2R5LCBpc1g6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYoaXNYKSB7XG4gICAgICAgICAgICBpZihib2R5MS5fZW50aXR5Ll9sZXZlbCA9PSBib2R5Mi5fZW50aXR5Ll9sZXZlbCkge1xuICAgICAgICAgICAgICAgIGJvZHkxLl9lbnRpdHkucmlnaHRDb250YWN0cy5wdXNoKHsgYm9keTogYm9keTEsIG90aGVyQm9keTogYm9keTIgfSlcbiAgICAgICAgICAgICAgICBib2R5MS5yaWdodENvbnRhY3RzLnB1c2goYm9keTIpXG4gICAgICAgICAgICAgICAgYm9keTIuX2VudGl0eS5sZWZ0Q29udGFjdHMucHVzaCh7IGJvZHk6IGJvZHkyLCBvdGhlckJvZHk6IGJvZHkxIH0pXG4gICAgICAgICAgICAgICAgYm9keTIubGVmdENvbnRhY3RzLnB1c2goYm9keTEpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKGJvZHkxLl9lbnRpdHkuX2xldmVsIDwgYm9keTIuX2VudGl0eS5fbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTIuX2VudGl0eS5oaWdoZXJMZWZ0Q29udGFjdCA9IHsgYm9keTogYm9keTIsIG90aGVyQm9keTogYm9keTEgfVxuICAgICAgICAgICAgICAgICAgICBib2R5Mi5oaWdoZXJMZWZ0Q29udGFjdCA9IGJvZHkxXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTEuX2VudGl0eS5oaWdoZXJSaWdodENvbnRhY3QgPSB7IGJvZHk6IGJvZHkxLCBvdGhlckJvZHk6IGJvZHkyIH1cbiAgICAgICAgICAgICAgICAgICAgYm9keTEuaGlnaGVyUmlnaHRDb250YWN0ID0gYm9keTJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihib2R5MS5fZW50aXR5Ll9sZXZlbCA9PSBib2R5Mi5fZW50aXR5Ll9sZXZlbCkge1xuICAgICAgICAgICAgICAgIGJvZHkxLl9lbnRpdHkudG9wQ29udGFjdHMucHVzaCh7IGJvZHk6IGJvZHkxLCBvdGhlckJvZHk6IGJvZHkyIH0pXG4gICAgICAgICAgICAgICAgYm9keTEudG9wQ29udGFjdHMucHVzaChib2R5MilcbiAgICAgICAgICAgICAgICBib2R5Mi5fZW50aXR5LmJvdENvbnRhY3RzLnB1c2goeyBib2R5OiBib2R5Miwgb3RoZXJCb2R5OiBib2R5MSB9KVxuICAgICAgICAgICAgICAgIGJvZHkyLmJvdENvbnRhY3RzLnB1c2goYm9keTEpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKGJvZHkxLl9lbnRpdHkuX2xldmVsIDwgYm9keTIuX2VudGl0eS5fbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTIuX2VudGl0eS5oaWdoZXJCb3RDb250YWN0ID0geyBib2R5OiBib2R5Miwgb3RoZXJCb2R5OiBib2R5MSB9XG4gICAgICAgICAgICAgICAgICAgIGJvZHkyLmhpZ2hlckJvdENvbnRhY3QgPSBib2R5MVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkxLl9lbnRpdHkuaGlnaGVyVG9wQ29udGFjdCA9IHsgYm9keTogYm9keTEsIG90aGVyQm9keTogYm9keTIgfVxuICAgICAgICAgICAgICAgICAgICBib2R5MS5oaWdoZXJUb3BDb250YWN0ID0gYm9keTJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYm9keTEuX2VudGl0eS5fbmFycm93Q291bnQtLVxuICAgICAgICBib2R5Mi5fZW50aXR5Ll9uYXJyb3dDb3VudC0tXG4gICAgfVxuXG4gICAgLy8gLS0gTkFSUk9XIFBIQVNFU1xuICAgIC8vXG4gICAgLy8gLS0gcyBldmVyeSBwb3NzaWJsZSBjb2xsaXNpb25zIGZvciBhIHNldCBvZiByZWN0IGFuZCBhZGQgdGhlbSB0byB0aGUgY29sbGlzaW9uIHRpbWVsaW5lXG4gICAgLy8gLS0gUFJFIDpcbiAgICAvLyAtLS0tIGxpc3QgOiBsaXN0IG9mIHJlY3Qgb2YgbGV2ZWwgW2xldmVsXVxuICAgIC8vIC0tLS0gbGV2ZWwgOiB0aGUgbGV2ZWwgb2YgYWxsIHRoZSByZWN0IG9uIHRoZSBsaXN0XG4gICAgLy8gLS0tLSB0aW1lZGVsdGEgOiA+IDAsIHRoZSBtYXggdGltZSBhZnRlciB0aGUgc3RhcnQgdGhhdCB0aGUgY29sbGlzaW9uIGNhbiBiZSBkXG4gICAgLy8gLS0tLSBjdXJyZW50VGltZSA6ID4gMFxuICAgIC8vIC0tIFBPU1QgOlxuICAgIC8vIC0tLS0gYWRkIGNvbGxpc2lvbnMgdG8gdGhlIGNvbGxpc2lvblRpbWVsaW5lXG4gICAgLy8gLS0tLSBtYXJrZXIgdG8gZmFsc2VcbiAgICBuYXJyb3dQaGFzZXMoZW50czogZW50LkVudGl0eVtdLCBsZXZlbDogbnVtYmVyLCB0aW1lRGVsdGE6IG51bWJlciwgY3VycmVudFRpbWU6IG51bWJlciwgY29sbGlzaW9uVGltZWxpbmU6IE5hcnJvd1Jlc3VsdFtdKSB7XG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBmb3IobGV0IGMgb2YgZS5fcG90Q29udGFjdCkge1xuICAgICAgICAgICAgICAgIGlmKCFjLm90aGVyQm9keS5fZW50aXR5Ll9tYXJrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hcnJvdzogTmFycm93UmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJlOiBlbnQuRW50aXR5ID0gYy5vdGhlckJvZHkuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gZS5fdG1wbm9jb2xsLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKGkgPCBsZW4gJiYgZS5fdG1wbm9jb2xsW2ldLmJvZHkgIT0gYy5ib2R5ICYmIGUuX3RtcG5vY29sbFtpXS5vdGhlckJvZHkgIT0gYy5vdGhlckJvZHkpIHsgaSsrIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoaSAhPSBsZW4pIHsgY29udGludWUgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKG90aGVyZS5fbGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFycm93ID0gdGhpcy5uYXJyb3dQaGFzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLmJvZHksIGUuX2xldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCBlLl9sYXN0eCArIGMuYm9keS5feCwgZS5fbGFzdHkgKyBjLmJvZHkuX3ksIGUuX3Z4LCBlLl92eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLm90aGVyQm9keSwgb3RoZXJlLl9sZXZlbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgb3RoZXJlLl94ICsgYy5vdGhlckJvZHkuX3gsIG90aGVyZS5feSArIGMub3RoZXJCb2R5Ll95LCBvdGhlcmUuX3NpbXZ4LCBvdGhlcmUuX3NpbXZ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFycm93ID0gdGhpcy5uYXJyb3dQaGFzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLmJvZHksIGUuX2xldmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCBlLl9sYXN0eCArIGMuYm9keS5feCwgZS5fbGFzdHkgKyBjLmJvZHkuX3ksIGUuX3Z4LCBlLl92eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLm90aGVyQm9keSwgb3RoZXJlLl9sZXZlbCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJlLl9sYXN0VGltZSwgb3RoZXJlLl9sYXN0eCArIGMub3RoZXJCb2R5Ll94LCBvdGhlcmUuX2xhc3R5ICsgYy5vdGhlckJvZHkuX3ksIG90aGVyZS5fdngsIG90aGVyZS5fdnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZURlbHRhXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZihuYXJyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hcnJvdy5ib2R5MS5fZW50aXR5Ll9uYXJyb3dDb3VudCsrXG4gICAgICAgICAgICAgICAgICAgICAgICBuYXJyb3cuYm9keTIuX2VudGl0eS5fbmFycm93Q291bnQrK1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDAsIGxlbiA9IGNvbGxpc2lvblRpbWVsaW5lLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGxlbiAmJiBuYXJyb3cudGltZSA+IGNvbGxpc2lvblRpbWVsaW5lW2ldLnRpbWUpIHsgaSsrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGlzaW9uVGltZWxpbmUuc3BsaWNlKGksIDAsIG5hcnJvdylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuX3RtcG5vY29sbCA9IFtdXG4gICAgICAgICAgICBlLl9tYXJrZWQgPSB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICBmb3IobGV0IGUgb2YgZW50cykge1xuICAgICAgICAgICAgZS5fbWFya2VkID0gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB1cGRhdGVDb2xsaXNpb25FdmVudHMoZW50czogZW50LkVudGl0eVtdLCBjb2xsaXNpb25UaW1lbGluZTogTmFycm93UmVzdWx0W10pIHtcbiAgICAgICAgbGV0IGxlbiA9IGNvbGxpc2lvblRpbWVsaW5lLmxlbmd0aCxcbiAgICAgICAgICAgIGkgPSAwLFxuICAgICAgICAgICAgaiA9IDAsXG4gICAgICAgICAgICBjb2xsaWRlcnMgPSBlbnRzLmZpbHRlcigocmVjdDogZW50LkVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0Ll9uYXJyb3dDb3VudCA+IDBcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgd2hpbGUoaSA8IGxlbiAmJiBjb2xsaWRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgZWxpbUluZGV4MSA9IGNvbGxpZGVycy5pbmRleE9mKGNvbGxpc2lvblRpbWVsaW5lW2pdLmJvZHkxLl9lbnRpdHkpLFxuICAgICAgICAgICAgICAgIGVsaW1JbmRleDIgPSBjb2xsaWRlcnMuaW5kZXhPZihjb2xsaXNpb25UaW1lbGluZVtqXS5ib2R5Mi5fZW50aXR5KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoZWxpbUluZGV4MSA+PSAwIHx8IGVsaW1JbmRleDIgPj0gMCkge1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvblRpbWVsaW5lW2pdLmJvZHkxLl9lbnRpdHkuX25hcnJvd0NvdW50LS1cbiAgICAgICAgICAgICAgICBjb2xsaXNpb25UaW1lbGluZVtqXS5ib2R5MS5fZW50aXR5Ll9uYXJyb3dDb3VudC0tXG5cbiAgICAgICAgICAgICAgICBjb2xsaXNpb25UaW1lbGluZS5zcGxpY2UoaiwgMSlcblxuICAgICAgICAgICAgICAgIGlmKGVsaW1JbmRleDEgPj0gMCAmJiAhY29sbGlkZXJzW2VsaW1JbmRleDFdLl9uYXJyb3dDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBjb2xsaWRlcnMuc3BsaWNlKGVsaW1JbmRleDEsIDEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGVsaW1JbmRleDIgPj0gMCAmJiAhY29sbGlkZXJzW2VsaW1JbmRleDJdLl9uYXJyb3dDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBjb2xsaWRlcnMuc3BsaWNlKGVsaW1JbmRleDIsIDEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGkrKyBcbiAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc29sdmVJbml0KGVudHM6IGVudC5FbnRpdHlbXSwgdGltZURlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgLy8gLS0gIHRocm90dGxlXG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBlLl9zaW12eCA9IGUubWFzcyAqIGUuX3Z4XG4gICAgICAgICAgICBlLl9zaW12eSA9IGUubWFzcyAqIGUuX3Z5XG4gICAgICAgIH1cblxuICAgICAgICAvLyAtLSBnZXQgdGhlIG5ldyBncm91cHMgd2l0aCB0aGUgY29ycmVjdCBzcGVlZFxuICAgICAgICBsZXQgcmVjdHNYID0gdGhpcy5nZXRBbGxDb25uZXhSZWN0cyhlbnRzLCB0cnVlKVxuICAgICAgICBmb3IobGV0IGVudCBvZiBlbnRzKSB7IGVudC5fbWFya2VkID0gZmFsc2UgfVxuXG4gICAgICAgIGxldCByZWN0c1kgPSB0aGlzLmdldEFsbENvbm5leFJlY3RzKGVudHMsIGZhbHNlKVxuICAgICAgICBmb3IobGV0IGVudCBvZiBlbnRzKSB7IGVudC5fbWFya2VkID0gZmFsc2UgfVxuXG4gICAgICAgIGZvcihsZXQgZ3JvdXAgb2YgcmVjdHNYKSB7XG4gICAgICAgICAgICB0aGlzLnNvbHZlQXV4KGdyb3VwLCBmYWxzZSwgdHJ1ZSwgMClcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGdyb3VwIG9mIHJlY3RzWSkge1xuICAgICAgICAgICAgdGhpcy5zb2x2ZUF1eChncm91cCwgZmFsc2UsIGZhbHNlLCAwKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zbGlkZU9mZnMoZW50cywgMCwgdGltZURlbHRhKVxuICAgIH1cbiAgICBzb2x2ZU5ld0NvbnRhY3QobmFycm93OiBOYXJyb3dSZXN1bHQsIHRpbWVEZWx0YTogbnVtYmVyKTogZW50LkVudGl0eVtdIHtcbiAgICAgICAgbGV0IGVudDEgPSBuYXJyb3cuYm9keTEuX2VudGl0eSxcbiAgICAgICAgICAgIGVudDIgPSBuYXJyb3cuYm9keTIuX2VudGl0eSxcbiAgICAgICAgICAgIHRhcmdldDogZW50LkVudGl0eVxuXG4gICAgICAgIGlmKGVudDEuX2xldmVsID49IGVudDIuX2xldmVsKSB7XG4gICAgICAgICAgICBlbnQxLl9sYXN0eCA9IG5hcnJvdy54MSAtIG5hcnJvdy5ib2R5MS5feFxuICAgICAgICAgICAgZW50MS5fbGFzdHkgPSBuYXJyb3cueTEgLSBuYXJyb3cuYm9keTEuX3lcbiAgICAgICAgICAgIGVudDEuX2xhc3RUaW1lID0gbmFycm93LnRpbWVcblxuICAgICAgICAgICAgdGFyZ2V0ID0gZW50MVxuICAgICAgICB9XG4gICAgICAgIGlmKGVudDIuX2xldmVsID49IGVudDEuX2xldmVsKSB7XG4gICAgICAgICAgICBlbnQyLl9sYXN0eCA9IG5hcnJvdy54MiAtIG5hcnJvdy5ib2R5Mi5feFxuICAgICAgICAgICAgZW50Mi5fbGFzdHkgPSBuYXJyb3cueTIgLSBuYXJyb3cuYm9keTIuX3lcbiAgICAgICAgICAgIGVudDIuX2xhc3RUaW1lID0gbmFycm93LnRpbWVcblxuICAgICAgICAgICAgdGFyZ2V0ID0gZW50MlxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGdyb3VwID0gdGhpcy5nZXRDb25uZXhSZWN0cyh0YXJnZXQsIG5hcnJvdy5pc1gpLFxuICAgICAgICAgICAgcmVzID0gW10gXG5cbiAgICAgICAgZm9yKGxldCBlbnQgb2YgZ3JvdXApIHsgXG4gICAgICAgICAgICBlbnQuX21hcmtlZCA9IGZhbHNlIFxuICAgICAgICAgICAgZW50Ll9sYXN0eCArPSBlbnQuX3Z4ICogKG5hcnJvdy50aW1lIC0gZW50Ll9sYXN0VGltZSlcbiAgICAgICAgICAgIGVudC5fbGFzdHkgKz0gZW50Ll92eSAqIChuYXJyb3cudGltZSAtIGVudC5fbGFzdFRpbWUpXG4gICAgICAgICAgICBlbnQuX2xhc3RUaW1lID0gbmFycm93LnRpbWVcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlU2xpZGVPZmZzKGdyb3VwLCBuYXJyb3cudGltZSlcblxuICAgICAgICBmb3IobGV0IHN1Ymdyb3VwIG9mIHRoaXMuZ2V0QWxsQ29ubmV4UmVjdHMoZ3JvdXAsIG5hcnJvdy5pc1gpKSB7XG4gICAgICAgICAgICByZXMucHVzaC5hcHBseShyZXMsIHRoaXMuc29sdmVBdXgoc3ViZ3JvdXAsIHRydWUsIG5hcnJvdy5pc1gsIG5hcnJvdy50aW1lKSlcblxuICAgICAgICAgICAgdGhpcy5zbGlkZU9mZnMoc3ViZ3JvdXAsIG5hcnJvdy50aW1lLCB0aW1lRGVsdGEpXG4gICAgICAgIH1cblxuICAgICAgICBmb3IobGV0IHJlY3Qgb2YgZ3JvdXApIHsgcmVjdC5fbWFya2VkID0gZmFsc2UgfVxuXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBzb2x2ZUF1eChlbnRzOiBlbnQuRW50aXR5W10sIG1vZGlmaWVkOiBib29sZWFuLCBpc1g6IGJvb2xlYW4sIHRpbWU6IG51bWJlcik6IGVudC5FbnRpdHlbXSB7XG4gICAgICAgIGlmKGVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIGxldCBlbnQgPSBlbnRzWzBdXG4gICAgICAgICAgICBpZihpc1gpIHtcbiAgICAgICAgICAgICAgICBpZihlbnQuaGlnaGVyTGVmdENvbnRhY3QpIHsgXG4gICAgICAgICAgICAgICAgICAgIGlmKGVudC5fdnggPD0gZW50LmhpZ2hlckxlZnRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll92eCA9IGVudC5oaWdoZXJMZWZ0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnhcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogc3BsaXQoc21hbGwsIGxlZnQpOiBcIiArIGVudC5uYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC5oaWdoZXJMZWZ0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW50LmhpZ2hlckxlZnRDb250YWN0LmJvZHkuaGlnaGVyTGVmdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyTGVmdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZW50LmhpZ2hlclJpZ2h0Q29udGFjdCkgeyBcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50Ll92eCA+PSBlbnQuaGlnaGVyUmlnaHRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll92eCA9IGVudC5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ4XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KHNtYWxsLCByaWdodCk6IFwiICsgZW50Lm5hbWUgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiIFwiICsgZW50LmhpZ2hlclJpZ2h0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgZW50LmhpZ2hlclJpZ2h0Q29udGFjdC5ib2R5LmhpZ2hlclJpZ2h0Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJSaWdodENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmKGVudC5oaWdoZXJCb3RDb250YWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGVudC5fdnkgPD0gZW50LmhpZ2hlckJvdENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuX3Z5ID0gZW50LmhpZ2hlckJvdENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ5XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KHNtYWxsLCBib3QpOiBcIiArIGVudC5uYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC5oaWdoZXJCb3RDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyQm90Q29udGFjdC5ib2R5LmhpZ2hlckJvdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyQm90Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihlbnQuaGlnaGVyVG9wQ29udGFjdCkgeyBcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50Ll92eSA+PSBlbnQuaGlnaGVyVG9wQ29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5fdnkgPSBlbnQuaGlnaGVyVG9wQ29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogc3BsaXQoc21hbGwsIHRvcCk6IFwiICsgZW50Lm5hbWUgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiIFwiICsgZW50LmhpZ2hlclRvcENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJUb3BDb250YWN0LmJvZHkuaGlnaGVyVG9wQ29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJUb3BDb250YWN0ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoaXNYKSB7XG4gICAgICAgICAgICAgICAgLy8gLS0gIE1JTi9NQVggU1BFRUQgKyBMRUZUUyBPRiBMSU5FQVJcbiAgICAgICAgICAgICAgICAvLyAxLiAgZXh0cmVtZSBsZWZ0IGFuZCByaWdodFxuICAgICAgICAgICAgICAgIC8vIGxldCBleHRMZWZ0cyA9IFtdLCBcbiAgICAgICAgICAgICAgICAvLyAgICAgZXh0UmlnaHRzID0gW11cblxuICAgICAgICAgICAgICAgIC8vIGZvcihsZXQgcmVjdCBvZiByZWN0cykgeyBcbiAgICAgICAgICAgICAgICAvLyAgICAgaWYoIXJlY3QubGVmdENvbnRhY3RzLmxlbmd0aCkgeyBleHRMZWZ0cy5wdXNoKHJlY3QpIH1cbiAgICAgICAgICAgICAgICAvLyAgICAgaWYoIXJlY3QucmlnaHRDb250YWN0cy5sZW5ndGgpIHsgZXh0UmlnaHRzLnB1c2gocmVjdCkgfVxuICAgICAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgICAgIC8vIDIuIEdvIGZyb20gbGVmdCB0byByaWdodCB0byAgbWluIHNwZWVkXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5NaW5WWChleHRMZWZ0cylcblxuICAgICAgICAgICAgICAgIC8vIDMuIEdvIGZyb20gcmlnaHQgdG8gbGVmdCB0byBjYWxjdWxhdCBtYXggc3BlZWRcbiAgICAgICAgICAgICAgICAvLyB0aGlzLk1heFZYKGV4dFJpZ2h0cylcbiAgICAgICAgICAgICAgICBmb3IobGV0IGVudCBvZiBlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGVudC5oaWdoZXJSaWdodENvbnRhY3QpIHsgZW50Ll92eCA9IE1hdGgubWluKGVudC5fdngsIGVudC5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ4KSB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGVudC5oaWdoZXJMZWZ0Q29udGFjdCkgeyBlbnQuX3Z4ID0gTWF0aC5tYXgoZW50Ll92eCwgZW50LmhpZ2hlckxlZnRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCkgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tICBMSU5FQVIgQ0xVTVBTXG4gICAgICAgICAgICAgICAgdGhpcy5MaW5lYXJDbHVtcFgoZW50cylcblxuICAgICAgICAgICAgICAgIC8vIC0tIFNPTFZFIEpVTkNUSU9OU1xuICAgICAgICAgICAgICAgIGZvcihsZXQgZW50IG9mIGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJpZ2h0bGVuID0gZW50LnJpZ2h0Q29udGFjdHMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdGxlbiA9IGVudC5sZWZ0Q29udGFjdHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGlmKHJpZ2h0bGVuID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1heENsdW1wID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZSA9IC0wLjAwMVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmlnaHRsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlID0gZW50LnJpZ2h0Q29udGFjdHNbaV0ub3RoZXJCb2R5Ll9lbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wQ2x1bXAgPSBlLl9jbHVtcFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wQ2x1bXAubGVmdCA9PSBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0bXAgPSAoZW50Ll9jbHVtcC52IC0gdG1wQ2x1bXAudikgKiB0bXBDbHVtcC5tYXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heENsdW1wID0gdG1wQ2x1bXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlID0gdG1wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1heFZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQuX2NsdW1wLm1lcmdlUmlnaHQobWF4Q2x1bXApXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYobGVmdGxlbiA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXhDbHVtcCA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWUgPSAtMC4wMDFcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMTsgaSA8IGxlZnRsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlID0gZW50LmxlZnRDb250YWN0c1tpXS5vdGhlckJvZHkuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wQ2x1bXAgPSBlLl9jbHVtcFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wQ2x1bXAucmlnaHQgPT0gZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdG1wID0gKHRtcENsdW1wLnYgLSBlbnQuX2NsdW1wLnYpICogdG1wQ2x1bXAubWFzc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHRtcCA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDbHVtcCA9IHRtcENsdW1wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZSA9IHRtcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihtYXhWYWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Q2x1bXAubWVyZ2VSaWdodChlbnQuX2NsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gIExPTkcgTElORUFSIENMVU1QU1xuICAgICAgICAgICAgICAgIGZvcihsZXQgZW50IG9mIGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50LmxlZnRDb250YWN0cy5sZW5ndGggIT0gMSBcbiAgICAgICAgICAgICAgICAgICAgfHwgKGVudC5sZWZ0Q29udGFjdHMubGVuZ3RoID09IDEgJiYgZW50LmxlZnRDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS5yaWdodENvbnRhY3RzLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmlnaHQgPSB0aGlzLmNsdW1wTGVmdFRvUmlnaHQoZW50Ll9jbHVtcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2x1bXBSaWdodFRvTGVmdChyaWdodClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tIElURVJBVEUgVEhST1VHSCBOT04gTE9ORyBMSU5FQVIgQ0xVTVBTIEFORCBBREQgVE8gTE9ORyBMSU5FQVIgQ0xVTVAgVU5USUwgTk8gTU9SRSBBRERcbiAgICAgICAgICAgICAgICBsZXQgcnVuID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHdoaWxlKHJ1bikge1xuICAgICAgICAgICAgICAgICAgICBydW4gPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGVudCBvZiBlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGxlZnQgb2YgZW50LmxlZnRDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGxlZnQub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wICE9IGVudC5fY2x1bXAgJiYgbGVmdC5vdGhlckJvZHkuX2VudGl0eS5fY2x1bXAudiA+PSBlbnQuX2NsdW1wLnYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdC5vdGhlckJvZHkuX2VudGl0eS5fY2x1bXAubWVyZ2VSaWdodChlbnQuX2NsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW4gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCByaWdodCBvZiBlbnQucmlnaHRDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJpZ2h0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcCAhPSBlbnQuX2NsdW1wICYmIHJpZ2h0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcC52IDw9IGVudC5fY2x1bXAudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQuX2NsdW1wLm1lcmdlUmlnaHQocmlnaHQub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW4gPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gVVBEQVRFIFNQRUVEIEFORCBDT05UQUNUXG4gICAgICAgICAgICAgICAgZm9yKGxldCBlbnQgb2YgZW50cykge1xuICAgICAgICAgICAgICAgICAgICAvLyBVUERBVEUgU1BFRURcbiAgICAgICAgICAgICAgICAgICAgZW50Ll92eCA9IGVudC5fY2x1bXAudlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJFTU9WRSBMT1NUIExFRlQgQ09OVEFDVFNcbiAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IGVudC5sZWZ0Q29udGFjdHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKGkgPCBsZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVudC5sZWZ0Q29udGFjdHNbal0ub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wICE9IGVudC5fY2x1bXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KGxlZnQsIHJpZ2h0KTogXCIgKyBlbnQubmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIgXCIgKyBlbnQubGVmdENvbnRhY3RzW2pdLm90aGVyQm9keS5fZW50aXR5Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGsgPSAwLCBiID0gZW50LmxlZnRDb250YWN0c1tqXS5ib2R5XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLmxlZnRDb250YWN0cy5zcGxpY2UoYi5sZWZ0Q29udGFjdHMuaW5kZXhPZihlbnQubGVmdENvbnRhY3RzW2pdLm90aGVyQm9keSksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQubGVmdENvbnRhY3RzW2pdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudC5sZWZ0Q29udGFjdHMuc3BsaWNlKGosIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBSRU1PVkUgTE9TVCBSSUdIVCBDT05UQUNUU1xuICAgICAgICAgICAgICAgICAgICBqID0gMFxuICAgICAgICAgICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgICAgICAgICBsZW4gPSBlbnQucmlnaHRDb250YWN0cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZW50LnJpZ2h0Q29udGFjdHNbal0ub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wICE9IGVudC5fY2x1bXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KGxlZnQsIHJpZ2h0KTogXCIgKyBlbnQubmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiIFwiICsgZW50LnJpZ2h0Q29udGFjdHNbal0ub3RoZXJCb2R5Ll9lbnRpdHkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgayA9IDAsIGIgPSBlbnQucmlnaHRDb250YWN0c1tqXS5ib2R5XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLnJpZ2h0Q29udGFjdHMuc3BsaWNlKGIucmlnaHRDb250YWN0cy5pbmRleE9mKGVudC5yaWdodENvbnRhY3RzW2pdLm90aGVyQm9keSksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQucmlnaHRDb250YWN0c1tqXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQucmlnaHRDb250YWN0cy5zcGxpY2UoaiwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaisrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFJFTU9WRSBISUdIIENPTlRBQ1RTXG4gICAgICAgICAgICAgICAgICAgIGlmKGVudC5oaWdoZXJMZWZ0Q29udGFjdCAmJiBlbnQuX3Z4ICE9IGVudC5oaWdoZXJMZWZ0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdngpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KHNtYWxsLCBsZWZ0KTogXCIgKyBlbnQubmFtZSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIgXCIgKyBlbnQuaGlnaGVyTGVmdENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQuaGlnaGVyTGVmdENvbnRhY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyTGVmdENvbnRhY3QuYm9keS5oaWdoZXJMZWZ0Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJMZWZ0Q29udGFjdCA9IG51bGwgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoZW50LmhpZ2hlclJpZ2h0Q29udGFjdCAmJiBlbnQuX3Z4ICE9IGVudC5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ4KSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zaW1Db3VudCArIFwiOiBzcGxpdChzbWFsbCwgcmlnaHQpOiBcIiArIGVudC5uYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkubmFtZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQuaGlnaGVyUmlnaHRDb250YWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZW50LmhpZ2hlclJpZ2h0Q29udGFjdC5ib2R5LmhpZ2hlclJpZ2h0Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJSaWdodENvbnRhY3QgPSBudWxsIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyAtLSAgTUlOL01BWCBTUEVFRCArIExFRlRTIE9GIExJTkVBUlxuICAgICAgICAgICAgICAgIC8vIC8vIDEuICBleHRyZW1lIGxlZnQgYW5kIHJpZ2h0XG4gICAgICAgICAgICAgICAgLy8gbGV0IGV4dExlZnRzID0gW10sIFxuICAgICAgICAgICAgICAgIC8vICAgICBleHRSaWdodHMgPSBbXVxuXG4gICAgICAgICAgICAgICAgLy8gZm9yKGxldCByZWN0IG9mIHJlY3RzKSB7IFxuICAgICAgICAgICAgICAgIC8vICAgICBpZighcmVjdC5sZWZ0Q29udGFjdHMubGVuZ3RoKSB7IGV4dExlZnRzLnB1c2gocmVjdCkgfVxuICAgICAgICAgICAgICAgIC8vICAgICBpZighcmVjdC5yaWdodENvbnRhY3RzLmxlbmd0aCkgeyBleHRSaWdodHMucHVzaChyZWN0KSB9XG4gICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgLy8gMi4gR28gZnJvbSBsZWZ0IHRvIHJpZ2h0IHRvICBtaW4gc3BlZWRcbiAgICAgICAgICAgICAgICAvLyB0aGlzLk1pblZYKGV4dExlZnRzKVxuXG4gICAgICAgICAgICAgICAgLy8gMy4gR28gZnJvbSByaWdodCB0byBsZWZ0IHRvIGNhbGN1bGF0IG1heCBzcGVlZFxuICAgICAgICAgICAgICAgIC8vIHRoaXMuTWF4VlgoZXh0UmlnaHRzKVxuICAgICAgICAgICAgICAgIGZvcihsZXQgZW50IG9mIGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50LmhpZ2hlclRvcENvbnRhY3QpIHsgZW50Ll92eSA9IE1hdGgubWluKGVudC5fdnksIGVudC5oaWdoZXJUb3BDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eSkgfVxuICAgICAgICAgICAgICAgICAgICBpZihlbnQuaGlnaGVyQm90Q29udGFjdCkgeyBlbnQuX3Z5ID0gTWF0aC5tYXgoZW50Ll92eSwgZW50LmhpZ2hlckJvdENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ5KSB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gIExJTkVBUiBDTFVNUFNcbiAgICAgICAgICAgICAgICB0aGlzLkxpbmVhckNsdW1wWShlbnRzKVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gU09MVkUgSlVOQ1RJT05TXG4gICAgICAgICAgICAgICAgZm9yKGxldCBlbnQgb2YgZW50cykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdG9wbGVuID0gZW50LnRvcENvbnRhY3RzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdGxlbiA9IGVudC5ib3RDb250YWN0cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgaWYodG9wbGVuID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1heENsdW1wID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhWYWx1ZSA9IC0wLjAwMVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdG9wbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZSA9IGVudC50b3BDb250YWN0c1tpXS5vdGhlckJvZHkuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wQ2x1bXAgPSBlLl9jbHVtcFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wQ2x1bXAubGVmdCA9PSBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0bXAgPSAoZW50Ll9jbHVtcC52IC0gdG1wQ2x1bXAudikgKiB0bXBDbHVtcC5tYXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heENsdW1wID0gdG1wQ2x1bXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlID0gdG1wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1heFZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQuX2NsdW1wLm1lcmdlVG9wKG1heENsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGJvdGxlbiA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXhDbHVtcCA9IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4VmFsdWUgPSAtMC4wMDFcblxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpID0gMTsgaSA8IGJvdGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGUgPSBlbnQuYm90Q29udGFjdHNbaV0ub3RoZXJCb2R5Ll9lbnRpdHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0bXBDbHVtcCA9IGUuX2NsdW1wXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0bXBDbHVtcC5yaWdodCA9PSBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0bXAgPSAodG1wQ2x1bXAudiAtIGVudC5fY2x1bXAudikgKiB0bXBDbHVtcC5tYXNzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodG1wID4gbWF4VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heENsdW1wID0gdG1wQ2x1bXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFZhbHVlID0gdG1wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKG1heFZhbHVlID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDbHVtcC5tZXJnZVRvcChlbnQuX2NsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gIExPTkcgTElORUFSIENMVU1QU1xuICAgICAgICAgICAgICAgIGZvcihsZXQgcmVjdCBvZiBlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlY3QuYm90Q29udGFjdHMubGVuZ3RoICE9IDEgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgKHJlY3QuYm90Q29udGFjdHMubGVuZ3RoID09IDEgJiYgcmVjdC5ib3RDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS50b3BDb250YWN0cy5sZW5ndGggPiAxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJpZ2h0ID0gdGhpcy5jbHVtcEJvdFRvVG9wKHJlY3QuX2NsdW1wKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVtcFRvcFRvQm90KHJpZ2h0KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gLS0gSVRFUkFURSBUSFJPVUdIIE5PTiBMT05HIExJTkVBUiBDTFVNUFMgQU5EIEFERCBUTyBMT05HIExJTkVBUiBDTFVNUCBVTlRJTCBOTyBNT1JFIEFERFxuICAgICAgICAgICAgICAgIGxldCBydW4gPSB0cnVlXG4gICAgICAgICAgICAgICAgd2hpbGUocnVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1biA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgZW50IG9mIGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcihsZXQgbGVmdCBvZiBlbnQuYm90Q29udGFjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihsZWZ0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcCAhPSBlbnQuX2NsdW1wICYmIGxlZnQub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wLnYgPj0gZW50Ll9jbHVtcC52KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wLm1lcmdlVG9wKGVudC5fY2x1bXApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1biA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHJpZ2h0IG9mIGVudC50b3BDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJpZ2h0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcCAhPSBlbnQuX2NsdW1wICYmIHJpZ2h0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcC52IDw9IGVudC5fY2x1bXAudikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQuX2NsdW1wLm1lcmdlVG9wKHJpZ2h0Lm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tIFVQREFURSBTUEVFRCBBTkQgQ09OVEFDVFxuICAgICAgICAgICAgICAgIGZvcihsZXQgZW50IG9mIGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVVBEQVRFIFNQRUVEXG4gICAgICAgICAgICAgICAgICAgIGVudC5fdnkgPSBlbnQuX2NsdW1wLnZcblxuICAgICAgICAgICAgICAgICAgICAvLyBSRU1PVkUgTE9TVCBCT1QgQ09OVEFDVFNcbiAgICAgICAgICAgICAgICAgICAgbGV0IGogPSAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IGVudC5ib3RDb250YWN0cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZW50LmJvdENvbnRhY3RzW2pdLm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcCAhPSBlbnQuX2NsdW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zaW1Db3VudCArIFwiOiBzcGxpdCh0b3AsIGJvdCk6IFwiICsgZW50Lm5hbWUgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC5ib3RDb250YWN0c1tqXS5vdGhlckJvZHkuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBrID0gMCwgYiA9IGVudC5ib3RDb250YWN0c1tqXS5ib2R5XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLmJvdENvbnRhY3RzLnNwbGljZShiLmJvdENvbnRhY3RzLmluZGV4T2YoZW50LmJvdENvbnRhY3RzW2pdLm90aGVyQm9keSksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQuYm90Q29udGFjdHNbal0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50LmJvdENvbnRhY3RzLnNwbGljZShqLCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUkVNT1ZFIExPU1QgVE9QIENPTlRBQ1RTXG4gICAgICAgICAgICAgICAgICAgIGogPSAwXG4gICAgICAgICAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGVudC50b3BDb250YWN0cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUoaSA8IGxlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZW50LnRvcENvbnRhY3RzW2pdLm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcCAhPSBlbnQuX2NsdW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zaW1Db3VudCArIFwiOiBzcGxpdChib3QsIHRvcCk6IFwiICsgZW50Lm5hbWUgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC50b3BDb250YWN0c1tqXS5vdGhlckJvZHkuX2VudGl0eS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBrID0gMCwgYiA9IGVudC50b3BDb250YWN0c1tqXS5ib2R5XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLnRvcENvbnRhY3RzLnNwbGljZShiLnRvcENvbnRhY3RzLmluZGV4T2YoZW50LnRvcENvbnRhY3RzW2pdLm90aGVyQm9keSksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQudG9wQ29udGFjdHNbal0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50LnRvcENvbnRhY3RzLnNwbGljZShqLCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUkVNT1ZFIEhJR0ggQ09OVEFDVFNcbiAgICAgICAgICAgICAgICAgICAgaWYoZW50LmhpZ2hlckJvdENvbnRhY3QgJiYgZW50Ll92eSAhPSBlbnQuaGlnaGVyQm90Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnkpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNwbGl0KHNtYWxsLCBib3QpOiBcIiArIGVudC5uYW1lIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBcIiBcIiArIGVudC5oaWdoZXJCb3RDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Lm5hbWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5fdG1wbm9jb2xsLnB1c2goZW50LmhpZ2hlckJvdENvbnRhY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyQm90Q29udGFjdC5ib2R5LmhpZ2hlckJvdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnQuaGlnaGVyQm90Q29udGFjdCA9IG51bGwgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoZW50LmhpZ2hlclRvcENvbnRhY3QgJiYgZW50Ll92eSAhPSBlbnQuaGlnaGVyVG9wQ29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2ltQ291bnQgKyBcIjogc3BsaXQoc21hbGwsIHRvcCk6IFwiICsgZW50Lm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgXCIgXCIgKyBlbnQuaGlnaGVyVG9wQ29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5uYW1lKSBcblxuICAgICAgICAgICAgICAgICAgICAgICAgZW50Ll90bXBub2NvbGwucHVzaChlbnQuaGlnaGVyVG9wQ29udGFjdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJUb3BDb250YWN0LmJvZHkuaGlnaGVyVG9wQ29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudC5oaWdoZXJUb3BDb250YWN0ID0gbnVsbCBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGVudHNcbiAgICB9XG5cbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gLS0gU09MVkUgQVVYIFNVQiBQUk9DRURVUkVTXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIExpbmVhckNsdW1wWChlbnRzOiBlbnQuRW50aXR5W10pIHtcbiAgICAgICAgZm9yKGxldCByZWN0IG9mIGVudHMpIHtcbiAgICAgICAgICAgIGlmKHJlY3QubGVmdENvbnRhY3RzLmxlbmd0aCAhPSAxIFxuICAgICAgICAgICAgICAgfHwgKHJlY3QubGVmdENvbnRhY3RzLmxlbmd0aCA9PSAxICYmIHJlY3QubGVmdENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5LnJpZ2h0Q29udGFjdHMubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudENsdW1wID0gbmV3IENsdW1wKClcbiAgICAgICAgICAgICAgICBjdXJyZW50Q2x1bXAuaW5pdFgocmVjdClcblxuICAgICAgICAgICAgICAgIGlmKHJlY3QucmlnaHRDb250YWN0cy5sZW5ndGggPT0gMSAmJiByZWN0LnJpZ2h0Q29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkubGVmdENvbnRhY3RzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gcmVjdC5yaWdodENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gR08gRlJPTSBMRUZUIFRPIFJJR0hUIEFORCBDTFVNUFxuICAgICAgICAgICAgICAgICAgICB3aGlsZShuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50Q2x1bXAudiA+PSBuZXh0Ll92eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDbHVtcC5hZGRSaWdodChuZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q2x1bXAgPSBuZXcgQ2x1bXAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDbHVtcC5pbml0WChuZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihuZXh0LnJpZ2h0Q29udGFjdHMubGVuZ3RoID09IDEgJiYgcmVjdC5yaWdodENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5LmxlZnRDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHQgPSBuZXh0LnJpZ2h0Q29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIENMVU1QIEZST00gUklHSFQgVE8gTEVGVCBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbHVtcFJpZ2h0VG9MZWZ0KGN1cnJlbnRDbHVtcClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbHVtcFJpZ2h0VG9MZWZ0KHJpZ2h0OiBDbHVtcCkge1xuICAgICAgICBpZihyaWdodC5sZWZ0LmxlZnRDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgbGV0IG5leHRDbHVtcCA9IHJpZ2h0LmxlZnQubGVmdENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcFxuICAgICAgICAgICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmKG5leHRDbHVtcC52ID49IHJpZ2h0LnYpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dENsdW1wLm1lcmdlUmlnaHQocmlnaHQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJpZ2h0ID0gbmV4dENsdW1wXG4gICAgICAgICAgICAgICAgaWYocmlnaHQubGVmdC5sZWZ0Q29udGFjdHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dENsdW1wID0gcmlnaHQubGVmdC5sZWZ0Q29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJpZ2h0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJpZ2h0XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2x1bXBMZWZ0VG9SaWdodChsZWZ0OiBDbHVtcCkge1xuICAgICAgICBpZihsZWZ0LnJpZ2h0LnJpZ2h0Q29udGFjdHMubGVuZ3RoID09IDEgJiYgbGVmdC5yaWdodC5yaWdodENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5LmxlZnRDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgbGV0IG5leHRDbHVtcCA9IGxlZnQucmlnaHQucmlnaHRDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS5fY2x1bXBcbiAgICAgICAgICAgIHdoaWxlKHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZihuZXh0Q2x1bXAudiA8PSBsZWZ0LnYpIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdC5tZXJnZVJpZ2h0KG5leHRDbHVtcClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGVmdCA9IG5leHRDbHVtcFxuICAgICAgICAgICAgICAgIGlmKGxlZnQucmlnaHQucmlnaHRDb250YWN0cy5sZW5ndGggPT0gMSAmJiBsZWZ0LnJpZ2h0LnJpZ2h0Q29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkubGVmdENvbnRhY3RzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDbHVtcCA9IGxlZnQucmlnaHQucmlnaHRDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS5fY2x1bXBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBMaW5lYXJDbHVtcFkocmVjdHM6IGVudC5FbnRpdHlbXSkge1xuICAgICAgICBmb3IobGV0IHJlY3Qgb2YgcmVjdHMpIHtcbiAgICAgICAgICAgIGlmKHJlY3QuYm90Q29udGFjdHMubGVuZ3RoICE9IDFcbiAgICAgICAgICAgICAgIHx8IChyZWN0LmJvdENvbnRhY3RzLmxlbmd0aCA9PSAxICYmIHJlY3QuYm90Q29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkudG9wQ29udGFjdHMubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudENsdW1wID0gbmV3IENsdW1wKClcbiAgICAgICAgICAgICAgICBjdXJyZW50Q2x1bXAuaW5pdFkocmVjdClcblxuICAgICAgICAgICAgICAgIGlmKHJlY3QudG9wQ29udGFjdHMubGVuZ3RoID09IDEgJiYgcmVjdC50b3BDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS5ib3RDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IHJlY3QudG9wQ29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHlcblxuICAgICAgICAgICAgICAgICAgICAvLyBHTyBGUk9NIExFRlQgVE8gUklHSFQgQU5EIENMVU1QXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRDbHVtcC52ID49IG5leHQuX3Z5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudENsdW1wLmFkZFRvcChuZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q2x1bXAgPSBuZXcgQ2x1bXAoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDbHVtcC5pbml0WShuZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihuZXh0LnRvcENvbnRhY3RzLmxlbmd0aCA9PSAxICYmIHJlY3QudG9wQ29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkuYm90Q29udGFjdHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gbmV4dC50b3BDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ0xVTVAgRlJPTSBSSUdIVCBUTyBMRUZUIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsdW1wVG9wVG9Cb3QoY3VycmVudENsdW1wKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsdW1wVG9wVG9Cb3QodG9wOiBDbHVtcCkge1xuICAgICAgICBpZih0b3AubGVmdC5ib3RDb250YWN0cy5sZW5ndGggPT0gMSAmJiB0b3AubGVmdC5ib3RDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS50b3BDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgbGV0IG5leHRDbHVtcCA9IHRvcC5sZWZ0LmJvdENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcFxuICAgICAgICAgICAgd2hpbGUodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGlmKG5leHRDbHVtcC52ID49IHRvcC52KSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDbHVtcC5tZXJnZVRvcCh0b3ApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRvcCA9IG5leHRDbHVtcFxuICAgICAgICAgICAgICAgIGlmKHRvcC5sZWZ0LmJvdENvbnRhY3RzLmxlbmd0aCA9PSAxICYmIHRvcC5sZWZ0LmJvdENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5LnRvcENvbnRhY3RzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRDbHVtcCA9IHRvcC5sZWZ0LmJvdENvbnRhY3RzWzBdLm90aGVyQm9keS5fZW50aXR5Ll9jbHVtcFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b3BcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdG9wXG4gICAgICAgIH1cbiAgICB9XG4gICAgY2x1bXBCb3RUb1RvcChib3Q6IENsdW1wKSB7XG4gICAgICAgIGlmKGJvdC5yaWdodC50b3BDb250YWN0cy5sZW5ndGggPT0gMSAmJiBib3QucmlnaHQudG9wQ29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkuYm90Q29udGFjdHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIGxldCBuZXh0Q2x1bXAgPSBib3QucmlnaHQudG9wQ29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wXG4gICAgICAgICAgICB3aGlsZSh0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYobmV4dENsdW1wLnYgPD0gYm90LnYpIHtcbiAgICAgICAgICAgICAgICAgICAgYm90Lm1lcmdlVG9wKG5leHRDbHVtcClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYm90ID0gbmV4dENsdW1wXG4gICAgICAgICAgICAgICAgaWYoYm90LnJpZ2h0LnRvcENvbnRhY3RzLmxlbmd0aCA9PSAxICYmIGJvdC5yaWdodC50b3BDb250YWN0c1swXS5vdGhlckJvZHkuX2VudGl0eS5ib3RDb250YWN0cy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0Q2x1bXAgPSBib3QucmlnaHQudG9wQ29udGFjdHNbMF0ub3RoZXJCb2R5Ll9lbnRpdHkuX2NsdW1wXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBib3RcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAtLSBTTElERU9GRiBTVUIgUFJPQ0VEVVJFU1xuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB1cGRhdGVTbGlkZU9mZnMoZW50czogZW50LkVudGl0eVtdLCB0aW1lOiBudW1iZXIpIHtcbiAgICAgICAgZm9yKGxldCBlbnQgb2YgZW50cykge1xuICAgICAgICAgICAgaWYoZW50Ll9zbGlkZU9mZikge1xuICAgICAgICAgICAgICAgIGZvcihsZXQgc2xpZGVPZmYgb2YgZW50Ll9zbGlkZU9mZikge1xuICAgICAgICAgICAgICAgICAgICBpZihzbGlkZU9mZi50aW1lIDw9IHRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbnQxID0gc2xpZGVPZmYuYm9keTEuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQyID0gc2xpZGVPZmYuYm9keTIuX2VudGl0eVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihlbnQxLl9sZXZlbCA9PSBlbnQyLl9sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBib2R5MSA9IHNsaWRlT2ZmLmJvZHkxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5MiA9IHNsaWRlT2ZmLmJvZHkyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LCBvdGhlcmxpc3QsIGssIGxlblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2xpZGVPZmYuaXNYKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkxLnJpZ2h0Q29udGFjdHMuc3BsaWNlKGJvZHkxLnJpZ2h0Q29udGFjdHMuaW5kZXhPZihib2R5MiksIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkyLmxlZnRDb250YWN0cy5zcGxpY2UoYm9keTIubGVmdENvbnRhY3RzLmluZGV4T2YoYm9keTEpLCAxKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QgPSBlbnQucmlnaHRDb250YWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlcmxpc3QgPSBlbnQyLmxlZnRDb250YWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkxLnRvcENvbnRhY3RzLnNwbGljZShib2R5MS50b3BDb250YWN0cy5pbmRleE9mKGJvZHkyKSwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTIuYm90Q29udGFjdHMuc3BsaWNlKGJvZHkyLmJvdENvbnRhY3RzLmluZGV4T2YoYm9keTEpLCAxKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QgPSBlbnQudG9wQ29udGFjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJsaXN0ID0gZW50Mi5ib3RDb250YWN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuID0gbGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShrIDwgbGVuICYmIGxpc3Rba10uYm9keSAhPSBib2R5MSAmJiBsaXN0W2tdLm90aGVyQm9keSAhPSBib2R5MikgeyBrKysgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Quc3BsaWNlKGssIDEpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbiA9IG90aGVybGlzdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZShrIDwgbGVuICYmIG90aGVybGlzdFtrXS5ib2R5ICE9IGJvZHkyICYmIG90aGVybGlzdFtrXS5vdGhlckJvZHkgIT0gYm9keTEpIHsgaysrIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdGhlcmxpc3Quc3BsaWNlKGssIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVudDEuX2xldmVsID4gZW50Mi5fbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2xpZGVPZmYuaXNYKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQxLmhpZ2hlclJpZ2h0Q29udGFjdC5ib2R5LmhpZ2hlclJpZ2h0Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudDEuaGlnaGVyUmlnaHRDb250YWN0ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50MS5oaWdoZXJUb3BDb250YWN0LmJvZHkuaGlnaGVyVG9wQ29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudDEuaGlnaGVyVG9wQ29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHNsaWRlT2ZmLmlzWCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Mi5oaWdoZXJMZWZ0Q29udGFjdC5ib2R5LmhpZ2hlckxlZnRDb250YWN0ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50Mi5oaWdoZXJMZWZ0Q29udGFjdCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudDIuaGlnaGVyQm90Q29udGFjdC5ib2R5LmhpZ2hlckJvdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnQyLmhpZ2hlckJvdENvbnRhY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpbUNvdW50ICsgXCI6IHNsaWRlb2ZmOiBcIiArIGVudDEubmFtZSArIFwiIFwiICsgZW50Mi5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2xpZGVPZmYpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzbGlkZU9mZnMoZW50czogZW50LkVudGl0eVtdLCB0aW1lOiBudW1iZXIsIHRpbWVEZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGZvcihsZXQgZSBvZiBlbnRzKSB7XG4gICAgICAgICAgICBlLmZvcmFsbFRvcEJvZHkoKGI6IGVudC5Cb2R5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIWIuX2lzU2Vuc29yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKGIuaGlnaGVyQm90Q29udGFjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5YU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiwgYi5oaWdoZXJCb3RDb250YWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUsIGIuaGlnaGVyQm90Q29udGFjdC5fZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX3Z4LCBiLmhpZ2hlckJvdENvbnRhY3QuX2VudGl0eS5fc2ltdngsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eCArIGIuX3gsIGIuaGlnaGVyQm90Q29udGFjdC5fZW50aXR5Ll94ICsgYi5oaWdoZXJCb3RDb250YWN0Ll94LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3R5ICsgYi5feSA+IGIuaGlnaGVyQm90Q29udGFjdC5fZW50aXR5Ll95ICsgYi5oaWdoZXJCb3RDb250YWN0Ll95LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUsIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGIuaGlnaGVyVG9wQ29udGFjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5YU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLCBiLmhpZ2hlclRvcENvbnRhY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSwgYi5oaWdoZXJUb3BDb250YWN0Ll9lbnRpdHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX3Z4LCBiLmhpZ2hlclRvcENvbnRhY3QuX2VudGl0eS5fc2ltdngsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eCArIGIuX3gsIGIuaGlnaGVyVG9wQ29udGFjdC5fZW50aXR5Ll94ICsgYi5oaWdoZXJUb3BDb250YWN0Ll94LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3R5ICsgYi5feSA+IGIuaGlnaGVyVG9wQ29udGFjdC5fZW50aXR5Ll95ICsgYi5oaWdoZXJUb3BDb250YWN0Ll95LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUsIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGIuaGlnaGVyTGVmdENvbnRhY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuWVNsaWRlT2ZmKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIsIGIuaGlnaGVyTGVmdENvbnRhY3QsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUsIGIuaGlnaGVyTGVmdENvbnRhY3QuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl92eSwgZS5oaWdoZXJMZWZ0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eSArIGIuX3ksIGIuaGlnaGVyTGVmdENvbnRhY3QuX2VudGl0eS5feSArIGIuaGlnaGVyTGVmdENvbnRhY3QuX3ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fbGFzdHggKyBiLl94ID4gYi5oaWdoZXJMZWZ0Q29udGFjdC5fZW50aXR5Ll94ICsgYi5oaWdoZXJMZWZ0Q29udGFjdC5feCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLCB0aW1lRGVsdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZihiLmhpZ2hlclJpZ2h0Q29udGFjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ZU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLCBiLmhpZ2hlclJpZ2h0Q29udGFjdCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSwgYi5oaWdoZXJSaWdodENvbnRhY3QuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl92eSwgYi5oaWdoZXJSaWdodENvbnRhY3QuX2VudGl0eS5fc2ltdnksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCAwLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eSArIGIuX3ksIGIuaGlnaGVyUmlnaHRDb250YWN0Ll9lbnRpdHkuX3kgKyBiLmhpZ2hlclJpZ2h0Q29udGFjdC5feSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eCArIGIuX3ggPiBiLmhpZ2hlclJpZ2h0Q29udGFjdC5fZW50aXR5Ll94ICsgYi5oaWdoZXJSaWdodENvbnRhY3QuX3gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZSwgdGltZURlbHRhXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGNvbnRhY3Qgb2YgYi5ib3RDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5YU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiwgY29udGFjdCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSwgY29udGFjdC5fZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX3Z4LCBjb250YWN0Ll9lbnRpdHkuX3Z4LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0VGltZSwgY29udGFjdC5fZW50aXR5Ll9sYXN0VGltZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fbGFzdHggKyBiLl94LCBjb250YWN0Ll9lbnRpdHkuX2xhc3R4ICsgY29udGFjdC5feCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eSArIGIuX3kgPiBjb250YWN0Ll9lbnRpdHkuX2xhc3R5ICsgY29udGFjdC5feSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLCB0aW1lRGVsdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGNvbnRhY3Qgb2YgYi50b3BDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5YU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiLCBjb250YWN0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLCBjb250YWN0Ll9lbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fdngsIGNvbnRhY3QuX2VudGl0eS5fdngsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3RUaW1lLCBjb250YWN0Ll9lbnRpdHkuX2xhc3RUaW1lLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eCArIGIuX3gsIGNvbnRhY3QuX2VudGl0eS5fbGFzdHggKyBjb250YWN0Ll94LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3R5ICsgYi5feSA+IGNvbnRhY3QuX2VudGl0eS5fbGFzdHkgKyBjb250YWN0Ll95LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUsIHRpbWVEZWx0YVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgY29udGFjdCBvZiBiLmxlZnRDb250YWN0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ZU2xpZGVPZmYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYiwgY29udGFjdCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZSwgY29udGFjdC5fZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX3Z5LCBjb250YWN0Ll9lbnRpdHkuX3Z5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0VGltZSwgY29udGFjdC5fZW50aXR5Ll9sYXN0VGltZSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fbGFzdHkgKyBiLl95LCBjb250YWN0Ll9lbnRpdHkuX2xhc3R5ICsgY29udGFjdC5feSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl9sYXN0eCArIGIuX3ggPiBjb250YWN0Ll9lbnRpdHkuX2xhc3R4ICsgY29udGFjdC5feCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lLCB0aW1lRGVsdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGNvbnRhY3Qgb2YgYi5yaWdodENvbnRhY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLllTbGlkZU9mZihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIsIGNvbnRhY3QsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUsIGNvbnRhY3QuX2VudGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLl92eSwgY29udGFjdC5fZW50aXR5Ll92eSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fbGFzdFRpbWUsIGNvbnRhY3QuX2VudGl0eS5fbGFzdFRpbWUsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuX2xhc3R5ICsgYi5feSwgY29udGFjdC5fZW50aXR5Ll9sYXN0eSArIGNvbnRhY3QuX3ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5fbGFzdHggKyBiLl94ID4gY29udGFjdC5fZW50aXR5Ll9sYXN0eCArIGNvbnRhY3QuX3gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZSwgdGltZURlbHRhXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgWFNsaWRlT2ZmKGxlZnQxcmlnaHQyOiBib29sZWFuLCBiMTogZW50LkJvZHksIGIyOiBlbnQuQm9keSwgZTE6IGVudC5FbnRpdHksIGUyOiBlbnQuRW50aXR5LCB2MTogbnVtYmVyLCB2MjogbnVtYmVyLCBcbiAgICAgICAgICAgICAgdDE6IG51bWJlciwgdDI6IG51bWJlciwgeDE6IG51bWJlciwgeDI6IG51bWJlciwgb25lSGlnaGVyVHdvLCB0aW1lOiBudW1iZXIsIHRpbWVEZWx0YTogbnVtYmVyKSB7XG4gICAgICAgIGxldCByZWx4ID0gdjEgLSB2MixcbiAgICAgICAgICAgIGN1cnJ4MSA9IHgxICsgKHRpbWUgLSB0MSkgKiB2MSxcbiAgICAgICAgICAgIGN1cnJ4MiA9IHgyICsgKHRpbWUgLSB0MikgKiB2MixcbiAgICAgICAgICAgIHNsaWRlVGltZSA9IC0xLFxuICAgICAgICAgICAgc2xpZGVcblxuICAgICAgICBpZihyZWx4ID4gMCkge1xuICAgICAgICAgICAgc2xpZGVUaW1lID0gKGN1cnJ4MiArIGIyLndpZHRoLzIgLSBjdXJyeDEgKyBiMS53aWR0aC8yKSAvIHJlbHhcbiAgICAgICAgfSBlbHNlIGlmKHJlbHggPCAwKSB7XG4gICAgICAgICAgICBzbGlkZVRpbWUgPSAoY3VycngyIC0gYjIud2lkdGgvMiAtIGN1cnJ4MSAtIGIxLndpZHRoLzIpIC8gcmVseFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoc2xpZGVUaW1lICE9IC0xICYmIHNsaWRlVGltZSA8IHRpbWVEZWx0YSl7XG4gICAgICAgICAgICBpZihvbmVIaWdoZXJUd28pIHtcbiAgICAgICAgICAgICAgICBzbGlkZSA9IHsgXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6IHNsaWRlVGltZSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTE6IGIyLFxuICAgICAgICAgICAgICAgICAgICBib2R5MjogYjEsXG4gICAgICAgICAgICAgICAgICAgIGlzWDogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNsaWRlID0geyBcbiAgICAgICAgICAgICAgICAgICAgdGltZTogc2xpZGVUaW1lLFxuICAgICAgICAgICAgICAgICAgICBib2R5MTogYjEsXG4gICAgICAgICAgICAgICAgICAgIGJvZHkyOiBiMixcbiAgICAgICAgICAgICAgICAgICAgaXNYOiBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpID0gMCwgbGVuID0gZTEuX3NsaWRlT2ZmLmxlbmd0aFxuXG4gICAgICAgIHdoaWxlKGkgPCBsZW4gJiYgZTEuX3NsaWRlT2ZmW2ldLmJvZHkxICE9IGIyICYmIGUxLl9zbGlkZU9mZltpXS5ib2R5MiAhPSBiMikgeyBpKysgfVxuICAgICAgICBpZihpIDwgbGVuKSB7IGUxLl9zbGlkZU9mZi5zcGxpY2UoaSwgMSkgfVxuXG4gICAgICAgIGkgPSAwLCBsZW4gPSBlMi5fc2xpZGVPZmYubGVuZ3RoXG5cbiAgICAgICAgd2hpbGUoaSA8IGxlbiAmJiBlMi5fc2xpZGVPZmZbaV0uYm9keTEgIT0gYjEgJiYgZTIuX3NsaWRlT2ZmW2ldLmJvZHkyICE9IGIxKSB7IGkrKyB9XG4gICAgICAgIGlmKGkgPCBsZW4pIHsgZTIuX3NsaWRlT2ZmLnNwbGljZShpLCAxKSB9XG5cbiAgICAgICAgaWYoc2xpZGUpIHtcbiAgICAgICAgICAgIGlmKGUxLl9sZXZlbCA9PSBlMi5fbGV2ZWwpIHsgXG4gICAgICAgICAgICAgICAgaWYobGVmdDFyaWdodDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZTEuX3NsaWRlT2ZmLnB1c2goc2xpZGUpIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGUyLl9zbGlkZU9mZi5wdXNoKHNsaWRlKSBcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSBlbHNlIHsgXG4gICAgICAgICAgICAgICAgaWYoZTEuX2xldmVsID4gZTIuX2xldmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGUxLl9zbGlkZU9mZi5wdXNoKHNsaWRlKSBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlMi5fc2xpZGVPZmYucHVzaChzbGlkZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IFxuICAgIFlTbGlkZU9mZihib3QxdG9wMjogYm9vbGVhbiwgYjE6IGVudC5Cb2R5LCBiMjogZW50LkJvZHksIGUxOiBlbnQuRW50aXR5LCBlMjogZW50LkVudGl0eSwgdjE6IG51bWJlciwgdjI6IG51bWJlciwgXG4gICAgICAgICAgICAgIHQxOiBudW1iZXIsIHQyOiBudW1iZXIsIHkxOiBudW1iZXIsIHkyOiBudW1iZXIsIG9uZUhpZ2hlclR3bzogYm9vbGVhbiwgdGltZTogbnVtYmVyLCB0aW1lRGVsdGE6IG51bWJlcikge1xuICAgICAgICBsZXQgcmVseSA9IHYxIC0gdjIsIHNsaWRlOiBlbnQuU2xpZGVPZmYsXG4gICAgICAgICAgICBjdXJyeTEgPSB5MSArICh0aW1lIC0gdDEpICogdjEsXG4gICAgICAgICAgICBjdXJyeTIgPSB5MiArICh0aW1lIC0gdDIpICogdjIsXG4gICAgICAgICAgICBzbGlkZVRpbWUgPSAtMVxuXG4gICAgICAgIGlmKHJlbHkgPiAwKSB7XG4gICAgICAgICAgICBzbGlkZVRpbWUgPSAoY3VycnkyICsgYjIuaGVpZ2h0LzIgLSBjdXJyeTEgKyBiMS5oZWlnaHQvMikgLyByZWx5XG4gICAgICAgIH0gZWxzZSBpZihyZWx5IDwgMCkge1xuICAgICAgICAgICAgc2xpZGVUaW1lID0gKGN1cnJ5MiAtIGIyLmhlaWdodC8yIC0gY3VycnkxIC0gYjEuaGVpZ2h0LzIpIC8gcmVseVxuICAgICAgICB9XG4gICAgICAgIGlmKHNsaWRlVGltZSAhPSAtMSAmJiBzbGlkZVRpbWUgPD0gdGltZURlbHRhKSB7XG4gICAgICAgICAgICBpZihvbmVIaWdoZXJUd28pIHtcbiAgICAgICAgICAgICAgICBzbGlkZSA9IHsgXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6IHNsaWRlVGltZSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTE6IGIyLFxuICAgICAgICAgICAgICAgICAgICBib2R5MjogYjEsXG4gICAgICAgICAgICAgICAgICAgIGlzWDogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2xpZGUgPSB7IFxuICAgICAgICAgICAgICAgICAgICB0aW1lOiBzbGlkZVRpbWUsXG4gICAgICAgICAgICAgICAgICAgIGJvZHkxOiBiMSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTI6IGIyLFxuICAgICAgICAgICAgICAgICAgICBpc1g6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaSA9IDAsIGxlbiA9IGUxLl9zbGlkZU9mZi5sZW5ndGhcblxuICAgICAgICB3aGlsZShpIDwgbGVuICYmIGUxLl9zbGlkZU9mZltpXS5ib2R5MSAhPSBiMiAmJiBlMS5fc2xpZGVPZmZbaV0uYm9keTIgIT0gYjIpIHsgaSsrIH1cbiAgICAgICAgaWYoaSA8IGxlbikgeyBlMS5fc2xpZGVPZmYuc3BsaWNlKGksIDEpIH1cblxuICAgICAgICBpID0gMCwgbGVuID0gZTIuX3NsaWRlT2ZmLmxlbmd0aFxuXG4gICAgICAgIHdoaWxlKGkgPCBsZW4gJiYgZTIuX3NsaWRlT2ZmW2ldLmJvZHkxICE9IGIxICYmIGUyLl9zbGlkZU9mZltpXS5ib2R5MiAhPSBiMSkgeyBpKysgfVxuICAgICAgICBpZihpIDwgbGVuKSB7IGUyLl9zbGlkZU9mZi5zcGxpY2UoaSwgMSkgfVxuXG4gICAgICAgIGlmKHNsaWRlKSB7XG4gICAgICAgICAgICBpZihlMS5fbGV2ZWwgPT0gZTIuX2xldmVsKSB7IFxuICAgICAgICAgICAgICAgIGlmKGJvdDF0b3AyKSB7XG4gICAgICAgICAgICAgICAgICAgIGUxLl9zbGlkZU9mZi5wdXNoKHNsaWRlKSBcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlMi5fc2xpZGVPZmYucHVzaChzbGlkZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgeyBcbiAgICAgICAgICAgICAgICBpZihlMS5fbGV2ZWwgPiBlMi5fbGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgZTEuX3NsaWRlT2ZmLnB1c2goc2xpZGUpIFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGUyLl9zbGlkZU9mZi5wdXNoKHNsaWRlKSBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IFxuXG4gICAgZ2V0QWxsQ29ubmV4UmVjdHMoZW50czogZW50LkVudGl0eVtdLCBpc1g6IGJvb2xlYW4pOiBlbnQuRW50aXR5W11bXSB7XG4gICAgICAgIGxldCByZXM6IGVudC5FbnRpdHlbXVtdID0gW11cblxuICAgICAgICBmb3IobGV0IGN1cnJlbnQgb2YgZW50cykge1xuICAgICAgICAgICAgaWYoIWN1cnJlbnQuX21hcmtlZCkge1xuICAgICAgICAgICAgICAgIHJlcy5wdXNoKHRoaXMuZ2V0Q29ubmV4UmVjdHMoY3VycmVudCwgaXNYKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfVxuXG4gICAgZ2V0Q29ubmV4UmVjdHMocmVjdDogZW50LkVudGl0eSwgaXNYOiBib29sZWFuKTogZW50LkVudGl0eVtdIHtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSByZWN0LFxuICAgICAgICAgICAgb3BlbnNldCA9IFtdLFxuICAgICAgICAgICAgcmVzID0gW11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmKCFjdXJyZW50Ll9tYXJrZWQpIHtcbiAgICAgICAgICAgICAgICByZXMucHVzaChjdXJyZW50KVxuICAgICAgICAgICAgICAgIGN1cnJlbnQuX21hcmtlZCA9IHRydWVcblxuICAgICAgICAgICAgICAgIGlmKGlzWCkge1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGMgb2YgY3VycmVudC5sZWZ0Q29udGFjdHMpIHsgb3BlbnNldC5wdXNoKGMub3RoZXJCb2R5Ll9lbnRpdHkpIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBjIG9mIGN1cnJlbnQucmlnaHRDb250YWN0cykgeyBvcGVuc2V0LnB1c2goYy5vdGhlckJvZHkuX2VudGl0eSkgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgYyBvZiBjdXJyZW50LmJvdENvbnRhY3RzKSB7IG9wZW5zZXQucHVzaChjLm90aGVyQm9keS5fZW50aXR5KSB9XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgYyBvZiBjdXJyZW50LnRvcENvbnRhY3RzKSB7IG9wZW5zZXQucHVzaChjLm90aGVyQm9keS5fZW50aXR5KSB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50ID0gb3BlbnNldC5wb3AoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIE5hcnJvd1Jlc3VsdCB7XG4gICAgdGltZTogbnVtYmVyLFxuICAgIGJvZHkxOiBlbnQuQm9keSwgLy8gbGVmdCBvciBib3R0b21cbiAgICB4MTogbnVtYmVyLFxuICAgIHkxOiBudW1iZXIsXG5cbiAgICBib2R5MjogZW50LkJvZHksIC8vIHJpZ2h0IG9yIHRvcFxuICAgIHgyOiBudW1iZXIsXG4gICAgeTI6IG51bWJlcixcblxuICAgIGlzWDogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgQ2x1bXAge1xuICAgIGxlZnQ6IGVudC5FbnRpdHkgLy8gb3IgYm90XG4gICAgcmlnaHQ6IGVudC5FbnRpdHkgLy8gb3IgdG9wXG5cbiAgICB2OiBudW1iZXJcbiAgICBzaW12OiBudW1iZXJcbiAgICBtYXNzOiBudW1iZXJcblxuICAgIHJlY3RzOiBlbnQuRW50aXR5W11cblxuICAgIG1pbnY6IG51bWJlclxuICAgIG1heHY6IG51bWJlclxuXG4gICAgaW5pdFgoZTogZW50LkVudGl0eSkge1xuICAgICAgICB0aGlzLmxlZnQgPSBlXG4gICAgICAgIHRoaXMucmlnaHQgPSBlXG5cbiAgICAgICAgdGhpcy5zaW12ID0gZS5fc2ltdnhcbiAgICAgICAgdGhpcy5tYXNzID0gZS5tYXNzXG4gICAgICAgIHRoaXMudiA9IGUuX3Z4XG5cbiAgICAgICAgdGhpcy5yZWN0cyA9IFtlXVxuXG4gICAgICAgIHRoaXMubWludiA9IGUuaGlnaGVyTGVmdENvbnRhY3QgPyBlLmhpZ2hlckxlZnRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCA6IC0xMDAwMDAwXG4gICAgICAgIHRoaXMubWF4diA9IGUuaGlnaGVyUmlnaHRDb250YWN0ID8gZS5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ4IDogMTAwMDAwMFxuXG4gICAgICAgIGUuX2NsdW1wID0gdGhpc1xuICAgIH1cbiAgICBhZGRSaWdodChlOiBlbnQuRW50aXR5KSB7XG4gICAgICAgIHRoaXMucmlnaHQgPSBlXG5cbiAgICAgICAgdGhpcy5tYXNzICs9IGUubWFzc1xuICAgICAgICB0aGlzLnNpbXYgKz0gZS5fc2ltdnhcbiAgICAgICAgdGhpcy52ID0gdGhpcy5zaW12IC8gdGhpcy5tYXNzXG5cbiAgICAgICAgaWYoZS5oaWdoZXJMZWZ0Q29udGFjdCkgeyB0aGlzLm1pbnYgPSBNYXRoLm1heChlLmhpZ2hlckxlZnRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCwgdGhpcy5taW52KSB9XG4gICAgICAgIGlmKGUuaGlnaGVyUmlnaHRDb250YWN0KSB7IHRoaXMubWF4diA9IE1hdGgubWluKGUuaGlnaGVyUmlnaHRDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eCwgdGhpcy5tYXh2KSB9XG5cbiAgICAgICAgdGhpcy52ID0gTWF0aC5tYXgodGhpcy52LCB0aGlzLm1pbnYpXG4gICAgICAgIHRoaXMudiA9IE1hdGgubWluKHRoaXMudiwgdGhpcy5tYXh2KVxuXG4gICAgICAgIHRoaXMucmVjdHMucHVzaChlKVxuXG4gICAgICAgIGUuX2NsdW1wID0gdGhpc1xuICAgIH1cbiAgICBtZXJnZVJpZ2h0KGNsdW1wOiBDbHVtcCkge1xuICAgICAgICB0aGlzLnJpZ2h0ID0gY2x1bXAucmlnaHRcblxuICAgICAgICB0aGlzLm1hc3MgKz0gY2x1bXAubWFzc1xuICAgICAgICB0aGlzLnNpbXYgKz0gY2x1bXAuc2ltdlxuICAgICAgICB0aGlzLnYgPSB0aGlzLnNpbXYgLyB0aGlzLm1hc3NcblxuICAgICAgICB0aGlzLnJlY3RzLnB1c2guYXBwbHkodGhpcy5yZWN0cywgY2x1bXAucmVjdHMpXG5cbiAgICAgICAgZm9yKGxldCBlIG9mIGNsdW1wLnJlY3RzKSB7XG4gICAgICAgICAgICBlLl9jbHVtcCA9IHRoaXNcbiAgICAgICAgICAgIGlmKGUuaGlnaGVyTGVmdENvbnRhY3QpIHsgdGhpcy5taW52ID0gTWF0aC5tYXgoZS5oaWdoZXJMZWZ0Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdngsIHRoaXMubWludikgfVxuICAgICAgICAgICAgaWYoZS5oaWdoZXJSaWdodENvbnRhY3QpIHsgdGhpcy5tYXh2ID0gTWF0aC5taW4oZS5oaWdoZXJSaWdodENvbnRhY3Qub3RoZXJCb2R5Ll9lbnRpdHkuX3NpbXZ4LCB0aGlzLm1heHYpIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudiA9IE1hdGgubWF4KHRoaXMudiwgdGhpcy5taW52KVxuICAgICAgICB0aGlzLnYgPSBNYXRoLm1pbih0aGlzLnYsIHRoaXMubWF4dilcbiAgICB9XG5cbiAgICBpbml0WShlOiBlbnQuRW50aXR5KSB7XG4gICAgICAgIHRoaXMubGVmdCA9IGVcbiAgICAgICAgdGhpcy5yaWdodCA9IGVcblxuICAgICAgICB0aGlzLnNpbXYgPSBlLl9zaW12eVxuICAgICAgICB0aGlzLm1hc3MgPSBlLm1hc3NcbiAgICAgICAgdGhpcy52ID0gZS5fdnlcblxuICAgICAgICB0aGlzLnJlY3RzID0gW2VdXG5cbiAgICAgICAgdGhpcy5taW52ID0gZS5oaWdoZXJCb3RDb250YWN0ID8gZS5oaWdoZXJCb3RDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eSA6IC0xMDAwMDAwXG4gICAgICAgIHRoaXMubWF4diA9IGUuaGlnaGVyVG9wQ29udGFjdCA/IGUuaGlnaGVyVG9wQ29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnkgOiAxMDAwMDAwXG5cbiAgICAgICAgZS5fY2x1bXAgPSB0aGlzXG4gICAgfVxuICAgIGFkZFRvcChlOiBlbnQuRW50aXR5KSB7XG4gICAgICAgIHRoaXMucmlnaHQgPSBlXG5cbiAgICAgICAgdGhpcy5tYXNzICs9IGUubWFzc1xuICAgICAgICB0aGlzLnNpbXYgKz0gZS5fc2ltdnlcbiAgICAgICAgdGhpcy52ID0gdGhpcy5zaW12IC8gdGhpcy5tYXNzXG5cbiAgICAgICAgaWYoZS5oaWdoZXJCb3RDb250YWN0KSB7IHRoaXMubWludiA9IE1hdGgubWF4KGUuaGlnaGVyQm90Q29udGFjdC5vdGhlckJvZHkuX2VudGl0eS5fc2ltdnksIHRoaXMubWludikgfVxuICAgICAgICBpZihlLmhpZ2hlclRvcENvbnRhY3QpIHsgdGhpcy5tYXh2ID0gTWF0aC5taW4oZS5oaWdoZXJUb3BDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eSwgdGhpcy5tYXh2KSB9XG5cbiAgICAgICAgdGhpcy52ID0gTWF0aC5tYXgodGhpcy52LCB0aGlzLm1pbnYpXG4gICAgICAgIHRoaXMudiA9IE1hdGgubWluKHRoaXMudiwgdGhpcy5tYXh2KVxuXG4gICAgICAgIHRoaXMucmVjdHMucHVzaChlKVxuXG4gICAgICAgIGUuX2NsdW1wID0gdGhpc1xuICAgIH1cbiAgICBtZXJnZVRvcChjbHVtcDogQ2x1bXApIHtcbiAgICAgICAgdGhpcy5yaWdodCA9IGNsdW1wLnJpZ2h0XG5cbiAgICAgICAgdGhpcy5tYXNzICs9IGNsdW1wLm1hc3NcbiAgICAgICAgdGhpcy5zaW12ICs9IGNsdW1wLnNpbXZcbiAgICAgICAgdGhpcy52ID0gdGhpcy5zaW12IC8gdGhpcy5tYXNzXG5cbiAgICAgICAgdGhpcy5yZWN0cy5wdXNoLmFwcGx5KHRoaXMucmVjdHMsIGNsdW1wLnJlY3RzKVxuXG4gICAgICAgIGZvcihsZXQgZSBvZiBjbHVtcC5yZWN0cykge1xuICAgICAgICAgICAgZS5fY2x1bXAgPSB0aGlzXG4gICAgICAgICAgICBpZihlLmhpZ2hlckJvdENvbnRhY3QpIHsgdGhpcy5taW52ID0gTWF0aC5tYXgoZS5oaWdoZXJCb3RDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eSwgdGhpcy5taW52KSB9XG4gICAgICAgICAgICBpZihlLmhpZ2hlclRvcENvbnRhY3QpIHsgdGhpcy5tYXh2ID0gTWF0aC5taW4oZS5oaWdoZXJUb3BDb250YWN0Lm90aGVyQm9keS5fZW50aXR5Ll9zaW12eSwgdGhpcy5tYXh2KSB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnYgPSBNYXRoLm1heCh0aGlzLnYsIHRoaXMubWludilcbiAgICAgICAgdGhpcy52ID0gTWF0aC5taW4odGhpcy52LCB0aGlzLm1heHYpXG4gICAgfVxufSJdfQ==
