var game = new Phaser.Game(800, 600, Phaser.AUTO, 'main');
var sprite;
var txt;
var txt_val = 0;

var speed = 4;
var max_bots_count = 120;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}

function generate_bots() {
    for (var i=0; i <= max_bots_count; i++) {

        var spr = this.add.sprite(this.game.world.randomX, this.game.world.randomY, 'bot');
        spr["is_bot"] = true;
        spr.anchor.setTo(0.5, 0.5);

        spr["new_x"] = Math.ceil(getRandomInt(0, 3000));
        spr["new_y"] = Math.ceil(getRandomInt(0, 3000));

        var init_distance = Math.ceil(this.game.physics.arcade.distanceToXY(spr, spr.new_x, spr.new_y));

        spr.anchor.setTo(0.5, 0.5);
        game.physics.p2.enable(spr, false);
        spr.body.setCircle(27);
        spr.body.setZeroVelocity();
        spr.body.velosity = 2;

        var f_sensor = this.add.sprite(spr.x, spr.y+20);
        game.physics.p2.enable(f_sensor, false);
        f_sensor.body.setCircle(5);
        f_sensor.body.setZeroVelocity();

        game.physics.p2.createLockConstraint(spr, f_sensor, [0, 30], 0);

        f_sensor.body.createBodyCallback(sprite, my_spr_hitted, this);

        sprite.f_sensor_inst.body.createBodyCallback(spr, i_hitted, this);

        spr["f_sensor_inst"] = f_sensor;

        spr["init_distance"] = init_distance;

        this.enemy_bots.push(spr);
        sleepFor(0.01);
    }
};
function my_spr_hitted(body1, body2) {
    body2.sprite.kill();
    body2.sprite.f_sensor_inst.kill();
    alert("You LOOSE!!!");
    window.location.reload();
};

function i_hitted(body1, body2) {
    body2.sprite.kill();
    body2.sprite.f_sensor_inst.kill();

    txt_val+=1;

    txt.setText(txt_val.toString());
    if (txt_val >= max_bots_count) {
        alert("You WON!!!");
    }
    //console.log("YEAH", body1.sprite);
};

function chage_vecor(dt) {
    this.enemy_bots.forEach(function(element, index, array) {
        var new_x;
        var new_y;

        var distance = Math.ceil(this.game.physics.arcade.distanceToXY(element, element.new_x, element.new_y));

        if (distance <= Math.ceil(element.init_distance/3)) {
            new_x = Math.ceil(getRandomInt(0, 3000));
            element["new_x"] = new_x;
            new_y = Math.ceil(getRandomInt(0, 3000));
            element["new_y"] = new_y;

        } else {
            new_x = element.new_x;
            new_y = element.new_y;
        }

        //element.body.angularVelocity = getRandomInt(0, 360);
        //element.body.moveForward(300);
        this.game.physics.arcade.moveToXY(element, new_x, new_y, 60, 5000);
    });
}

var PhaserGame = function () {
    this.enemy_bots = [];
};

PhaserGame.prototype = {

    init: function () {
        this.game.renderer.renderSession.roundPixels = true;

        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.defaultRestitution = 0.9;

    },

    preload: function () {

        this.load.image('ship', 'images/player.png');
        this.load.image('earth', 'images/bg.png');
        this.load.image('bot', 'images/bot.png');
        //this.game.load.spritesheet('kaboom', 'images/explosion.png', 64, 64, 23);

    },

    create: function () {
        game.world.setBounds(0, 0, 3000, 3000);

        land = game.add.tileSprite(0, 0, 3000, 3000, 'earth');

        sprite = this.add.sprite(0, 0, 'ship');



        sprite["is_bot"] = false;
        sprite.anchor.setTo(0.5, 0.5);

        txt = this.game.add.text(-15, 25, txt_val.toString(), { font: "65px Arial", fill: "#ff0044", align: "center" });
        sprite.addChild(txt);

        game.physics.p2.enable(sprite, false, false);
        sprite.body.setCircle(27);

        game.physics.p2.setImpactEvents(true);

        var front_sensor = this.add.sprite(sprite.x, sprite.y+20);
        game.physics.p2.enable(front_sensor, false);
        front_sensor.sensor = true;
        front_sensor.body.setCircle(5);
        front_sensor.body.setZeroVelocity();

        //var tst = this.add.sprite(sprite.x, sprite.y+50);
        //game.physics.p2.enable(tst, true);
        //tst.body.sensor = true;
        //tst.body.setCircle(15);
        //sprite.addChild(tst);
        //front_sensor.body.setZeroVelocity();
        //game.physics.p2.createLockConstraint(sprite, tst, [0, 50], 0);

        game.physics.p2.createLockConstraint(sprite, front_sensor, [0, 30], 0);

        //game.physics.p2.createLockConstraint(sprite, txt, [0, 0], 0);


        sprite["f_sensor_inst"] = front_sensor;

        game.camera.follow(sprite);
        game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        game.camera.focusOnXY(0, 0);

        generate_bots.call(this);

    },

    update: function () {
        var deltaTime = game.time.elapsed / 1000;

        chage_vecor.call(this, deltaTime);

        sprite.body.setZeroVelocity();

        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        {
            sprite.body.angularVelocity = -3;
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        {
            sprite.body.angularVelocity = 3;
        }
        else {
            sprite.body.angularVelocity = 0;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
        {
            sprite.body.moveForward(300);
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
        {
            sprite.body.moveBackward(300);
            //game.physics.arcade.velocityFromAngle(sprite.angle, -300, sprite.body.velocity);
        }



    },

    render: function() {

        //game.debug.bodyInfo(sprite, 32, 32);
        //game.debug.text(result, 32, 32);

    }

};

game.state.add('Game', PhaserGame, true);