/*
 * ===========================================================================
 * File: GameMultiplayer.js - 4 
 * Author: Antonio Faienza
 * Desc: TODO 
 * ===========================================================================
 */
var P2PMaze = P2PMaze || {};

// global variable 
var map;
var backgroudLayer; 
var blockedLayer;
var player;  
var cursor; 
var items; 

var logicalOrder = {};
var playerOrder = 1; // the player starts to 1 for compare the item to take 



P2PMaze.GameMultiplayer = function(){
    console.log("%cStarting GameMultiplayer", "color:black; background:yellow");
};

P2PMaze.GameMultiplayer.prototype = {
    preload: function() {
        // TODO da togliere il preload che qui non dovrebbe servire 
        this.game.load.tilemap('temp', 'assets/tilemaps/temp.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tempImage', 'assets/images/tiles.png');

        // TODO CANCELLARE - vedere la grandezza dell'immagine        
        // 37x45 is the size of each frame
        //  There are 18 frames in the PNG - you can leave this value blank if the frames fill up the entire PNG, but in this case there are some
        //  blank frames at the end, so we tell the loader how many to load
        this.load.spritesheet('player', 'assets/images/dude.png',32,48);        // Quello che vorrei usare 
        // this.load.image('player', 'assets/images/player.png'); // Personaggio singolo importato da Tiled
        // this.load.image('player', 'assets/images/phaser-dude.png'); // Personaggio singolo 

        // TODO carichiamo le immagini
        this.load.image('redcup', 'assets/images/estintore_grande.png');
        this.load.image('greycup', 'assets/images/greencup.png');
        this.load.image('bluecup', 'assets/images/bluecup.png');
    }, 
    create: function() {
        

        console.log(peerClient.getId());
        //  We're going to be using physics, so enable the Arcade Physics system
        // TODO - mettere questo nel Boot
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

       map = this.game.add.tilemap('temp'); 

       map.addTilesetImage('tiles','tempImage');

       // create the layer 
       backgroudLayer = map.createLayer('backgroudLayer');
       blockedLayer = map.createLayer('blockedLayer');

        // TODO verificare per la nuova mappa che ciò avvenga

        // The number between 1 and 2000 is an index range for the tiles for which we want to enable
        // collision (in this case such a big number should include them all which is what I intended).
        // In order to obtain this number open file.json and in “layers” – “data” of the two layers 
        // find the largest number you can find, in this case 1896 so I put 2000 just to be sure I didn’t 
        // miss a slightly larger number. 
       map.setCollisionBetween(1, 200, true, 'blockedLayer'); 

       backgroudLayer.resizeWorld();


       this.createItems();
       
       var result = this.findObjectsByType('playerStart', map, 'objectLayer');


       // create the player 
       player = this.game.add.sprite(result[0].x, result[0].y, 'player');
       var player2= this.game.add.sprite(result[0].x+100, result[0].y+100, 'player');

       // create the phisics body. Can be a single object (as in this case) or of array of Objects
       this.game.physics.arcade.enable(player);

       //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.2;
        player.body.gravity.y = PLAYER.GRAVITY_Y;
        player.body.collideWorldBounds = true;

        // player2.body.bounce.y = 0.2;
        // player2.body.gravity.y = PLAYER.GRAVITY_Y;
        // player2.body.collideWorldBounds = true;

       // see image: 0, 1, 2, 3 is the frame for runring to left 
       // see image: 5, 6, 7, 8 is the frame for running to right 
       // 10 = frames per second 
       // the 'true' param tell the animation to loop 
       player.animations.add('left', [0, 1, 2, 3], 10, true);
       player.animations.add('right', [5, 6, 7, 8], 10, true);

       // TODO deve esse qualcosa nell'update

       //the camera will follow the player in the world
       this.game.camera.follow(player); // TODO forse questo non serve


       // move player with cursor key 
       cursor = this.game.input.keyboard.createCursorKeys();
       
    },
    update: function(){

        //  Collide the player and the stars with the platforms
         

        // collisio to do 
        // https://phaser.io/docs/2.4.4/Phaser.Physics.Arcade.html#collide
        var hitPlatform = this.game.physics.arcade.collide(player, blockedLayer);
        
        // player movement   
        // NB: comment these to gain less control over the sprite      
        // player.body.velocity.y = 0; // the player cab be jump and for this have to not "resize" to 0 the position
        player.body.velocity.x = PLAYER.VELOCITY_X_START;

        if(this.game.input.activePointer.justPressed()){
            // move on the direction of the input 
            this.game.physics.arcade.moveToPointer(player, 150); 
            player.animations.play('left');
        }

        // if(cursor.up.isDown) {
        //     player.body.velocity.y = -50;            
        // }else if(cursor.down.isDown){
        //     player.body.velocity.y = +50;
        // }else
         if(cursor.left.isDown){
            player.body.velocity.x = PLAYER.VELOCITY_X_LEFT;
            player.animations.play('left');
        }else if(cursor.right.isDown){
            player.body.velocity.x = PLAYER.VELOCITY_X_RIGHT;
            player.animations.play('right');
        }
        else{
            //  Stand still
            player.animations.stop();    
            player.frame = 4;
        }

        // if(cursor.up.isDown && player.body.touching.down){
        if(cursor.up.isDown && hitPlatform){
            player.body.velocity.y = -250;  // TODO se si vuole aumentare l'altezza vedere esempio index9.html         
        }

        
        // Checks for overlaps between two game objects.
        // - The first object or array of objects to check. 
        // - The second object or array of objects to check.
        // - An optional callback function that is called if the objects overlap. 
        //      The two objects will be passed to this function in the same order in which you specified them, 
        //      unless you are checking Group vs. Sprite, in which case Sprite will always be the first parameter.
        // - A callback function that lets you perform additional checks against the two objects if 
        //     they overlap. If this is set then overlapCallback will only be called if 
        //     this callback returns true
        // - The context in which to run the callbacks.
        // DECOMMENTARE 
        this.game.physics.arcade.overlap(player, items, this.collect, this.choiceItems, this);
        
       
        
    },
    collect: function(player, collectable){

        // TODO aggiungere il suono 

        console.log("PRESO " + collectable.key);
        // remove sprite
        collectable.destroy();

    },
    choiceItems: function(player, item){
        
        // TODO delete
        // BODY ENABLE https://phaser.io/examples/v2/arcade-physics/body-enable
        // console.log(" ORDINE DEL GIOCATORE " + playerOrder);
        // console.log(" liSTA ");
        // console.log(logicalOrder);

       // if exist inside the hashmap a key with the same name of the sprite
       // and the value is equal of playerOrder then return true
        if((item.key in logicalOrder) && logicalOrder[item.key] === playerOrder){
            playerOrder++;                  // icrease the order of player 
            delete logicalOrder[item.key];  // delete key-value            
            return true;
        }else {
            this.game.physics.arcade.collide(player, items);
            return false;
        }
       
        
    }, 
    findObjectsByType: function(type, map, layer){

        // DEBUG
        // console.log(map);
        // console.log(map.objects);

        var result = new Array();
        map.objects[layer].forEach(function(element){
                if(element.properties.type === type ){
                    //Phaser uses top left, Tiled bottom left so we have to adjust the y position
                    //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                    //so they might not be placed in the exact pixel position as in Tiled
                    element.y -= map.tileHeight;
                    result.push(element);
                }
        });

        return result;
    },
    // createItems: function(){
    //     // create items
    //     this.items = this.game.add.group();

    //     // If true all Sprites created with #create or #createMulitple will have a physics body created on them.
    //     this.items.enableBody = true;
    //     var item; 
    //     result = this.findObjectsByType('item', map, 'objectLayer');
        
    //     // result = take all element from tileset with specific proprieties
    //     //    |--> element = take a specific result with proprieties etc
    //     result.forEach(function(element){            
    //         this.createFromTiledObject(element, this.items);
    //       }, this);
    // },
    createItems: function(){

        // create items
        items = this.game.add.group();

        // If true all Sprites created with #create or #createMulitple will have a physics body created on them.
        items.enableBody = true;
        // items.physicsBodyType = Phaser.Physics.ARCADE;
         
        // result = take all element from tileset with 'item' proprieties
        var resultItem = this.findObjectsByType('item', map, 'objectLayer');
        
        
        // element = take a specific result with proprieties etc
        resultItem.forEach(function(element){    

            // Creates a new Phaser.Sprite object and adds it to the top of this group.
            // 'x' and 'y' are the coordinates that display the newly created Sprite at.The value is in relation to the group.x/group.y point
            // This is the image or texture used by the Sprite during rendering. 
            // It must matching from proprieties in Tiled and the name of sprite i.e redcup
            var spriteObject = items.create(element.x, element.y, element.properties.sprite);
            
            // enable for all sprites of object a physical properties
            this.game.physics.arcade.enable(spriteObject);
            
            // default = each objects are immovable
            spriteObject.body.immovable = true;

            // DEBUG
            //  console.log(element.properties.order + " " + element.properties.sprite);
           
            // fill the HashMap for the logic of game
            // key = sprite name
            // value = order  
            logicalOrder[element.properties.sprite] = element.properties.order;
                      
            //this.createFromTiledObject(element, items);
          }, this);
    },
    render:function() {

        // ===== DEBUG PLAYER 
        // this.game.debug.body(player);
        // this.game.debug.spriteInfo(player, 32, 32);

        // ===== DEBUG ITEMS
        // this.game.debug.physicsGroup(items);
        // space = 130; 
        // items.forEachAlive(this.renderGroup, this, space);       
       
    },
    renderGroup: function(member, number){
       
        this.game.debug.body(member);
        this.game.debug.spriteInfo(member, 32, number);
        space = number + 130;
    }
    // createFromTiledObject: function(element, group) {

    //     // Creates a new Phaser.Sprite object and adds it to the top of this group.
    //     // 'x' and 'y' are the coordinates that display the newly created Sprite at.The value is in relation to the group.x/group.y point
    //     // This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or other. See documentation for more detail.        
    //     var sprite = group.create(element.x, element.y, element.properties.sprite);
        
    //     // TODO - Capire perchè stava messo sto codice
    //     //copy all properties to the sprite
    //     // Object.keys(element.properties).forEach(function(key){
    //     //     sprite[key] = element.properties[key];
    //     //     // console.log(" --------------> " + sprite[key]);
    //     // });
    // }
};