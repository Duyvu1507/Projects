	//Keep value within a specific range
	function clamp(val, min, max){
        return val < min ? min : (val > max ? max : val);
    }
    
    //AABB Collision function 
	function rectsIntersect(a, b){
		var ab = a.getBounds();
		var bb = b.getBounds();
		return (ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height) && a != b;
	}
	
	//Returns a unit vector with random direction 
	function getRandomUnitVector(){
		let x = getRandom(-1,1);
		let y = getRandom(-1,1);
		let length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
	
		return {x:x, y:y};
	}

//Returns a random float between the min and max (exclusive)
	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
    }

//Gets the distance between two objects
function getDistance(A, B) {
    let xDist = A.x - B.x;
    let yDist = A.y - B.y;

    return Math.sqrt(xDist * xDist + yDist * yDist);
}

//Returns the unit vector from A to B
function getDirectionVector(A, B) {
    let xDist = B.x - A.x;
    xDist /= getDistance(A, B);
    let yDist = B.y - A.y;
    yDist /= getDistance(A, B);

    return { x: xDist, y: yDist };
}

//Returns the angle of the vector supplied
function getAngle(vector) {
    return Math.atan2(vector.y, vector.x);
}

//Return the dot product of the two vectors 
function dotProduct(A, B) {
    return A.x * B.x + A.y * B.y;
}

//Handles Collisions between a kinetic A and static B
function handleAABBCollisions(A, B) {
    if (rectsIntersect(A, B)) {
        //Top or Bottom Collision
        if (Math.abs(A.x - B.x) / (A.width + B.width) < Math.abs(A.y - B.y) / (A.height + B.height)) {
            if (A.y < B.y) {
                A.y = B.y - (B.height / 2 + A.height / 2);
            }
            else if (A.y > B.y) {
                A.y = B.y + (B.height / 2 + A.height / 2);
            }
            else if (A.x < B.x) {
                A.x = B.x - (B.width / 2 + A.width / 2);
            }
            else if (A.x > B.x) {
                A.x = B.x + (B.width / 2 + A.width / 2);
            }
        }
        //Left or Right Collision
        else {
            if (A.x < B.x) {
                A.x = B.x - (B.width / 2 + A.width / 2);
            }
            else if (A.x > B.x) {
                A.x = B.x + (B.width / 2 + A.width / 2);
            }

            else if (A.y < B.y) {
                A.y = B.y - (B.height / 2 + A.height / 2);
            }
            else if (A.y > B.y) {
                A.y = B.y + (B.height / 2 + A.height / 2);
            }
        }
        return true;
    }
    return false;
}

//Handles Collisions between a kinetic A and static B
function handleCircleCollisions(A, B) {
    if (getDistance(A, B) <= A.radius * 1.2 + B.radius) {
        let direction = getDirectionVector(B, A);
        let distance = getDistance(B, A);
        A.x = B.x + direction.x * distance * 1.1;
        A.y = B.y + direction.y * distance * 1.1;
        return true;
    }
    return false;
}