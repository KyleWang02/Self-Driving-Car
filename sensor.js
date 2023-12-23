class Sensor{
    constructor(car){
        this.car = car;
        this.numRays = 5;
        this.rayLength = 120;
        this.raySpread = Math.PI/2;

        this.rays = [];
        this.readings = [];
    }

    update(roadBorders, traffic){
        this.#castRays();
        this.readings = [];
        for(let i = 0; i < this.rays.length; i++){
            this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
        }
    }

    draw(ctx){
        for(let i = 0; i < this.numRays; i++){
            let end = this.rays[i][1];
            if(this.readings[i]){
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }

    #castRays(){
        this.rays = [];
        for(let i = 0; i < this.numRays; i++){
            const angle = lerp(this.raySpread/2, -this.raySpread/2, 
            this.numRays == 1?0.5 : i/(this.numRays - 1)) + this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                y: this.car.y - this.rayLength*Math.cos(angle),
                x: this.car.x - this.rayLength*Math.sin(angle)
            };
            this.rays.push([start, end]);
        }
    }

    #getReading(ray, roadBorders, traffic){
        let touches = [];
        for(let i = 0; i < roadBorders.length; i++){
            const touch = getIntersection(ray[0],ray[1], roadBorders[i][0], roadBorders[i][1]);
            if(touch){
                touches.push(touch);
            }
        }

        for(let i = 0; i < traffic.length; i++){
            const poly = traffic[i].polygon;
            for(let j = 0; j < poly.length; j++){
                const value = getIntersection(ray[0],ray[1], poly[j], poly[(j + 1)%poly.length]);
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length == 0){
            return null;
        }else{
            const offsets = touches.map(e=>e.offset); //goes through each element in touches and returns the offset of each element and stores it into another array called offsets
            const minOffset = Math.min(...offsets); //finds the minimum offset. The ... is the spread operator which spreads the array into individual elements
            return touches.find(e=>e.offset == minOffset); //finds the element in touches with the minimum offset and returns it
        }

    }

}