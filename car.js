class Car{
    constructor(x, y, width, height, controlType, maxSpeed = 3, color = "blue"){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height; 

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if(controlType != "DUMMY"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.numRays, 6, 4]);
        }
        this.controls = new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement("canvas");
        this.mask.width = this.width;
        this.mask.height = this.height;

        const maskCtx = this.mask.getContext("2d");
        this.img.onload = () => {
            maskCtx.fillStyle = color;
            maskCtx.rect(0, 0, this.width, this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation = "destination-atop";
            maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
        }
    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#checkDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s=>s == null ? 0:1 - s.offset);
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.backward = outputs[3];
            }
        }
    }
    
    draw(ctx, showSensor = false){
        if(this.sensor && showSensor){
            this.sensor.draw(ctx);
        }

         ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();
    }

    #checkDamage(roadBorders, traffic){  
        for(let i = 0; i < roadBorders.length; i++){
            if(polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height/2);
        const alpha = Math.atan2(this.width, this.height);

        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad, 
            y: this.y - Math.cos(this.angle - alpha) * rad
        });

        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad, 
            y: this.y - Math.cos(this.angle + alpha) * rad
        });

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad, 
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad, 
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.backward){
            this.speed -= this.acceleration;
        }

        if(this.speed != 0){
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.left){
                this.angle += 0.02*flip; //this is used the unit circle to calculate the angle and is used to define the coordinate system when turning to make sure that the car doesnt go faster when moving diagonally
            }
            if(this.controls.right){
                this.angle -= 0.02*flip;
            }
    
        }

        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }

        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
}