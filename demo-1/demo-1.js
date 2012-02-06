(function() {
    
    // Init som useful stuff for easier access (don't need 'em all)
    var   b2Vec2 = Box2D.Common.Math.b2Vec2
        , b2AABB = Box2D.Collision.b2AABB
        , b2BodyDef = Box2D.Dynamics.b2BodyDef
        , b2Body = Box2D.Dynamics.b2Body
        , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
        , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var SCALE,
        canvas,
        world,
        fixDef,
        ctx,
        width,
        height,
        shapes = {},
        needToDraw = false;
        
    var debug = false;
    
    var init = {
        start: function(id) {
            this.defaultProperties();
            this.canvas(id);
            
            box2d.create.world();
            box2d.create.defaultFixture();
            
            this.surroundings.leftWall();
            this.surroundings.rightWall();
            this.surroundings.ground();
            
            this.callbacks();
            
            setTimeout(function() { add.random(); }, 0);
            setTimeout(function() { add.random(); }, 100);
            setTimeout(function() { add.random(); }, 500);
            setTimeout(function() { add.random(); }, 700);
            setTimeout(function() { add.random(); }, 1000);
            
            // On my signal: Unleash hell.
            (function hell() {
                loop.step();
                loop.update();
                if (debug) {
                    world.DrawDebugData();
                }
                loop.draw();
                requestAnimFrame(hell);
            })();
        },
        defaultProperties: function() {
            SCALE = 30;
        },
        canvas: function(id) {
            canvas = document.getElementById(id);
            ctx = canvas.getContext("2d");
        },
        surroundings: {
            rightWall: function() {
                add.box({
                    x: 25.7,        // 740 / 30 + 1.1
                    y:  6.3,        // 380px / 30 / 2
                    height: 12.6,   // 380px / 30
                    width:2,
                    isStatic: true
                });
            },
            ground: function() {
                add.box({
                    x: 12.3,        // 740 / 30 / 2
                    y:  13.7,
                    height: 2,
                    width:24.6,     // 740 / 30
                    isStatic: true
                });
            },
            leftWall: function() {
                add.box({
                    x: -1,
                    y:  6.3,        // 380px / 30 / 2
                    height: 12.6,   // 380px / 30
                    width:2,
                    isStatic: true
                });
            }
        },
        callbacks: function() {
            canvas.addEventListener('click', function(e) {
                var shapeOptions = {
                    x: (canvas.width / SCALE) * (e.offsetX / canvas.width),
                    y: 0
                };
                add.random(shapeOptions);
            }, false);
        }
    };        
     
     
    var add = {
        random: function(options) {
            options = options || {};
            if (Math.random() < 0.5){
                this.circle(options);
            } else {
                this.box(options);
            }
        },
        circle: function(options) {
            options.radius = 0.5 + Math.random()*1;
            var shape = new Circle(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);
        },
        box: function(options) {
            options.width = options.width || 0.5 + Math.random()*2;
            options.height = options.height || 0.5 + Math.random()*2;
            var shape = new Box(options);
            shapes[shape.id] = shape;
            box2d.addToWorld(shape);
        }
    };

    var box2d = {
        addToWorld: function(shape) {
            var bodyDef = this.create.bodyDef(shape);
            var body = this.create.body(bodyDef);
            if (shape.radius) {
                this.create.fixtures.circle(body, shape);
            } else {
                this.create.fixtures.box(body, shape);
            }
        },
        create: {
            world: function() {
                world = new b2World(
                    new b2Vec2(0, 10)    //gravity
                    , false                 //allow sleep
                );
                
                if (debug) {
                    var debugDraw = new b2DebugDraw();
                    debugDraw.SetSprite(ctx);
                    debugDraw.SetDrawScale(30.0);
                    debugDraw.SetFillAlpha(0.3);
                    debugDraw.SetLineThickness(1.0);
                    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
                    world.SetDebugDraw(debugDraw);
                }
            },
            defaultFixture: function() {
                fixDef = new b2FixtureDef;
                fixDef.density = 1.0;
                fixDef.friction = 0.5;
                fixDef.restitution = 0.2;
            },
            bodyDef: function(shape) {
                var bodyDef = new b2BodyDef;
        
                if (shape.isStatic == true) {
                    bodyDef.type = b2Body.b2_staticBody;
                } else {
                    bodyDef.type = b2Body.b2_dynamicBody;
                }
                bodyDef.position.x = shape.x;
                bodyDef.position.y = shape.y;
                bodyDef.userData = shape.id;
                bodyDef.angle = shape.angle;
            
                return bodyDef;
            },
            body: function(bodyDef) {
                return world.CreateBody(bodyDef);
            },
            fixtures: {
                circle: function(body, shape) {
                    fixDef.shape = new b2CircleShape(shape.radius);
                    body.CreateFixture(fixDef);
                },
                box: function(body, shape) {
                    fixDef.shape = new b2PolygonShape;
                    fixDef.shape.SetAsBox(shape.width / 2, shape.height / 2);
                    body.CreateFixture(fixDef);
                }
            }
        },
        get: {
            bodySpec: function(b) {
                return {x: b.GetPosition().x, y: b.GetPosition().y, angle: b.GetAngle(), center: {x: b.GetWorldCenter().x, y: b.GetWorldCenter().y}};
            }
        }
    };


    var loop = {
        step: function() {
            var stepRate = 1 / 60;
            world.Step(stepRate, 10, 10);
            world.ClearForces();
        },
        update: function () {            
            for (var b = world.GetBodyList(); b; b = b.m_next) {
                if (b.IsActive() && typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
                    shapes[b.GetUserData()].update(box2d.get.bodySpec(b));
                }
            }
            needToDraw = true;
        },
        draw: function() {
            if (!needToDraw) return;
            
            if (!debug) ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (var i in shapes) {
                shapes[i].draw(ctx);
            }
            needToDraw = false;
        }
    };    
    
    var helpers = {
        randomColor: function() {
            var letters = '0123456789ABCDEF'.split(''),
                color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.round(Math.random() * 15)];
            }
            return color;
        }
    };
    
    /* Shapes down here */
    
    var Shape = function(v) {
        this.id = Math.round(Math.random() * 1000000);
        this.x = v.x || Math.random()*23 + 1;
        this.y = v.y || 0;
        this.angle = 0;
        this.color = helpers.randomColor();
        this.center = { x: null, y: null };
        this.isStatic = v.isStatic || false;
        
        this.update = function(options) {
            this.angle = options.angle;
            this.center = options.center;
            this.x = options.x;
            this.y = options.y;
        };
    };
    
    var Circle = function(options) {
        Shape.call(this, options);
        this.radius = options.radius || 1;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x * SCALE, this.y * SCALE, this.radius * SCALE, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
    };
    Circle.prototype = Shape;
    
    var Box = function(options) {
        Shape.call(this, options);
        this.width = options.width || Math.random()*2+0.5;
        this.height = options.height || Math.random()*2+0.5;
        
        this.draw = function() {
            ctx.save();
            ctx.translate(this.x * SCALE, this.y * SCALE);
            ctx.rotate(this.angle);
            ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
            ctx.fillStyle = this.color;
            ctx.fillRect(
                (this.x-(this.width / 2)) * SCALE,
                (this.y-(this.height / 2)) * SCALE,
                this.width * SCALE,
                this.height * SCALE
            );
            ctx.restore();
        };
    };
    Box.prototype = Shape;
    
    init.start('box2d-demo');
})();
