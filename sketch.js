let depthBuffer = [];
// players pos and dir
let cnv;
let posX = 12,
	posY = 10;

let dirX = -1,
	dirY = 0;
let dirLength = Math.sqrt(dirX ** 2 + dirY ** 2);

const canvasX = 600;
const canvasY = 400;
const aspectRatio = canvasX / canvasY;
// camera plane 
let planeLength = 0.6;
let planeX = dirY / Math.sqrt(Math.pow(-dirX, 2) + Math.pow(dirY, 2)) * planeLength;
let planeY = -dirX / Math.sqrt(Math.pow(-dirX, 2) + Math.pow(dirY, 2)) * planeLength;

let unitsPerSecond = 4.5;
let radsPerSecond = 4;

// color settings for sky
let cH = 200;
let cS = 50;
let cB = 100;

let wallImage;
let floorImg;
let sprite1;
let sprite2;

const texWidth = 64;
const texHeight = 64;

const wallHeight = 1;

let buffer = [];
let buffer2 = [];
let buffer3 = [];
let buffer4 = [];

let zBuffer = [];

class Sprite {
	constructor(x, y, spriteBuffer) {
		this.x = x;
		this.y = y;
		this.spriteBuffer = spriteBuffer;
		this.distance = ((posX - this.x) * (posX - this.x) + (posY - this.y) * (posY - this.y));
	}

	udpateDistance() {
		this.distance = ((posX - this.x) * (posX - this.x) + (posY - this.y) * (posY - this.y));
	}

	moveToPlayer() {
		if (this.distance < 0.4) return;
		let length = Math.sqrt((posX - this.x) * (posX - this.x) + (posY - this.y) * (posY - this.y));
		this.x += (posX - this.x) / length / 25;
		this.y += (posY - this.y) / length / 25;
	}

	teleport() {
		this.x = Math.random() * worldMap.length - 1;
		this.y = Math.random() * worldMap[0].length - 1;
	}
}

let sprites = [
	new Sprite(10, 10, buffer3),
	// new Sprite(10, 12, buffer4),
];

//let numSprites = 2;
//let spriteOrder = [];
//let spriteDistance = [];

p5.disableFriendlyErrors = true;

function preload() {
	wallImage = loadImage("./Pics/redbrick.png");
	floorImg = loadImage("./Pics/rocks.png");
	sprite1 = loadImage("./Pics/pillar.png");
	sprite2 = loadImage("./Pics/barrel.png");
}

function centerCanvas() {
	let x = (windowWidth - width) / 2;
	let y = (windowHeight - height) / 2;
	cnv.position(x, y);
	for (let i = 0; i < width; i++) {
		depthBuffer[i] = [];
		for (let j = 0; j < height; j++) {
			depthBuffer[i][j] = Infinity;
		}
	}
}

function setup() {
	cnv = createCanvas(canvasX, canvasY);
	centerCanvas();
	frameRate(30);
	for (let y = 0; y < 64; y++) {
		for (let x = 0; x < 64; x++) {
			buffer.push(floorImg.get(x, y));
			buffer2.push(wallImage.get(x, y));
			buffer3.push(sprite1.get(x, y));
			buffer4.push(sprite2.get(x, y));
		}
	}
	pixelDensity(1);
}

function windowResized() {
	centerCanvas();
}

function draw() {
	var fps = frameRate();
	//move forward if up arrow is pressed
	if (keyIsDown(87)) {
		// calculate collisions for walls, index 1
		let floorX = Math.floor(posX);
		let floorY = Math.floor(posY);

		let checkX = Math.floor(posX + dirX * (unitsPerSecond / fps + 0.2));
		let checkY = Math.floor(posY + dirY * (unitsPerSecond / fps + 0.2));

		if (worldMap[checkX] !== undefined && worldMap[checkX][floorY] !== undefined && !worldMap[checkX][floorY])
			posX += dirX * unitsPerSecond / fps;

		if (worldMap[floorX] !== undefined && worldMap[floorX][checkY] !== undefined && !worldMap[floorX][checkY])
			posY += dirY * unitsPerSecond / fps;
	}

	// //move backwards if down arrow is pressed
	if (keyIsDown(83)) {
		// calculate collisions for walls
		let floorX = Math.floor(posX);
		let floorY = Math.floor(posY);

		let checkX = Math.floor(posX - dirX * (unitsPerSecond / fps + 0.2));
		let checkY = Math.floor(posY - dirY * (unitsPerSecond / fps + 0.2));

		if (worldMap[checkX] !== undefined && worldMap[checkX][floorY] !== undefined && !worldMap[checkX][floorY])
			posX -= dirX * unitsPerSecond / fps;

		if (worldMap[floorX] !== undefined && worldMap[floorX][checkY] !== undefined && !worldMap[floorX][checkY])
			posY -= dirY * unitsPerSecond / fps;
	}
	// rotate dir and camera vectors by key input
	// rotate to right
	if (keyIsDown(68)) {
		//both camera direction and camera plane must be rotated
		let rotSpeed = radsPerSecond / frameRate();
		let oldDirX = dirX;
		dirX = dirX * Math.cos(-rotSpeed) - dirY * Math.sin(-rotSpeed);
		dirY = oldDirX * Math.sin(-rotSpeed) + dirY * Math.cos(-rotSpeed);
		let oldPlaneX = planeX;
		planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed);
		planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed);
	}
	//rotate to left
	if (keyIsDown(65)) {
		//both camera direction and camera plane must be rotated
		let rotSpeed = radsPerSecond / frameRate();
		let oldDirX = dirX;
		dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
		dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);
		let oldPlaneX = planeX;
		planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
		planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);
	}

	colorMode(HSB);
	// sky color 
	background(cH, cS, cB);
	CastRays();
	drawSprites();
	// renderDepth();
	// sprites.forEach((s) => {
	// 	s.moveToPlayer();
	// 	if (s.distance > 8 && frameCount % 600 == 0)
	// 		s.teleport();
	// });
}

function renderDepth() {
	loadPixels();
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			pixels[(x + y * width) * 4] /= depthBuffer[x][y];
			pixels[(x + y * width) * 4 + 1] /= depthBuffer[x][y];
			pixels[(x + y * width) * 4 + 2] /= depthBuffer[x][y];
			pixels[(x + y * width) * 4 + 3] = 255;
		}
	}
	updatePixels();
}

function CastRays() {
	if (document.getElementById("textFloor").checked)
		loadPixels();
	if (document.getElementById("textFloor").checked) {
		for (let y = 0; y < height; y++) {
			// rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
			// width / height is camera aspect ratio fix
			let rayDirX0 = dirX - planeX * aspectRatio;
			let rayDirY0 = dirY - planeY * aspectRatio;
			let rayDirX1 = dirX + planeX * aspectRatio;
			let rayDirY1 = dirY + planeY * aspectRatio;

			// Current y position compared to the center of the screen (the horizon)
			// multiplied by the length of our plane to match our raycasting FOV
			let p = (y - height / 2) * planeLength * 2;
			// Vertical position of the camera.
			let posZ = 0.5 * height;

			/*
			another set of values that can be used for p and posZ. These lines better represent these values, 
			but we can still use the other p, and posZ because they are proportional. 
			This means that even if they are both in pixel coords, they still calculate the same thing. 
			(looking at ceiling / floor casting section helps visualise this in raycasting notes doc)
			*/

			/*
			the length of our screen vertically (planeLength * 2, defined 
			by how we map our raycasting world vertically, 
			they both have to be the same range)
			*/

			// let p = map(y, 0, height, -planeLength, planeLength)

			/*
			vertical position of camera relative to the bottom of the screen. 
			This essentially represents the amount of units our floor and ceiling 
			is up and down from our camera.
			*/

			// let posZ = 0.5;

			// Horizontal distance from the camera to the floor for the current row.
			// 0.5 is the z position exactly in the middle between floor and ceiling.
			let rowDistance = abs(posZ / p);

			let floorStepX = rowDistance * (rayDirX1 - rayDirX0) / width;
			let floorStepY = rowDistance * (rayDirY1 - rayDirY0) / width;

			let floorX = posX + rowDistance * rayDirX0;
			let floorY = posY + rowDistance * rayDirY0;

			for (let x = 0; x < width; ++x) {
				// the cell coord is simply got from the integer parts of floorX and floorY
				let cellX = (int)(floorX);
				let cellY = (int)(floorY);

				// get the texture coordinate from the fractional part
				let tx = Math.floor(texWidth * (floorX - cellX)) & (texWidth - 1);
				let ty = Math.floor(texHeight * (floorY - cellY)) & (texHeight - 1);

				floorX += floorStepX;
				floorY += floorStepY;

				let color = buffer[tx + ty * texWidth];
				// adding random numbers to color for lighter effect
				pixels[(x + y * width) * 4] = color[0] + 25;
				pixels[(x + y * width) * 4 + 1] = color[1] + 25;
				pixels[(x + y * width) * 4 + 2] = color[2] + 20;
				pixels[(x + y * width) * 4 + 3] = color[3];
				depthBuffer[x][y] = rowDistance;
			}
		}
	} else {
		fill(0, 0, 50);
		noStroke();
		rect(0, height / 2, width, height / 2);
	}
	if (document.getElementById("textFloor").checked)
		updatePixels();

	if (document.getElementById("textWalls").checked)
		loadPixels();
	for (let x = 0; x < canvasX; x++) {

		// setting up variables for DDA
		// cameraX is our camera plane in camera space (width / height to fix streachting when changing aspect ratio of screen)
		let cameraX = map(x, 0, width, -aspectRatio, aspectRatio);
		let rayDirX = dirX + planeX * cameraX;
		let rayDirY = dirY + planeY * cameraX;

		// current map coord ray is in
		let mapX = Math.floor(posX);
		let mapY = Math.floor(posY);

		// initial side lengths to first x and y lines
		let sideDistX;
		let sideDistY;

		// distance to next grid intersections, x and y

		// unsimplified way, dividing the length of the ray by its x / y components
		// let deltaDistX = Math.sqrt(1 + (rayDirY / rayDirX) * (rayDirY / rayDirX));
		// let deltaDistY = Math.sqrt(1 + (rayDirX / rayDirY) * (rayDirX / rayDirY));

		// simplified way, allows for further perpWallDist simplification down below
		let deltaDistX = Math.abs(1 / rayDirX);
		let deltaDistY = Math.abs(1 / rayDirY);
		let perpWallDist;

		// rounded dir of ray, help calculate DDA
		let stepX;
		let stepY;

		let hit = 0;
		let side;

		// calculating sideDistX, sideDistY, and stepX, and stepY
		if (rayDirX < 0) {
			stepX = -1;
			sideDistX = (posX - mapX) * deltaDistX;
		} else {
			stepX = 1;
			sideDistX = (mapX + 1.0 - posX) * deltaDistX;
		}
		if (rayDirY < 0) {
			stepY = -1;
			sideDistY = (posY - mapY) * deltaDistY;
		} else {
			stepY = 1;
			sideDistY = (mapY + 1.0 - posY) * deltaDistY;
		}

		// preform DDA
		while (hit == 0) {

			//alternate between x and y side
			if (sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
				sideDistY += deltaDistY;
				mapY += stepY;
				side = 1;
			}

			// if ray hits anything greater than 1, set hit = 1
			if (worldMap[mapX] === undefined || worldMap[mapX][mapY] === undefined) {
				hit = undefined;
			} else if (worldMap[mapX][mapY] > 0) {
				// prototype door casting code
				// if (worldMap[mapX][mapY] === 7) {
				// 	if (sideDistX - deltaDistX / 1.5 < sideDistY) {
				// 		sideDistX += deltaDistX - deltaDistX / 1.5; // minus deltaDistX becuase we subtract deltaDistX from sideDist when getting perpwalldist
				// 		mapX += stepX;
				// 		side = 0;
				// 	} else {
				// 		sideDistY += deltaDistY;
				// 		mapY += stepY;
				// 		side = 1;
				// 	}
				// }
				hit = 1;
			}
		}

		if (side == 0) {
			// calculate dist to wall X
			// OLD WAY
			// perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;

			// ANOTHER WAY, ONLY WORKS IF USING ACTUALL RAY LENGTH FOR DELTAS
			// perpWallDist = (sideDistX - deltaDistX) / Math.sqrt(rayDirX * rayDirX + rayDirY * rayDirY) * dirLength;

			// BEST WAY, ONLY WORKS WHEN USING DIVISION BY 1 SIMPLIFICATION FOR DELTAS
			perpWallDist = (sideDistX - deltaDistX) * dirLength;
		} else {
			// calculate dist to wall Y
			// OLD WAY
			// perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

			// ANOTHER WAY, ONLY WORKS IF USING ACTUALL RAY LENGTH FOR DELTAS
			// perpWallDist = (sideDistY - deltaDistY) / Math.sqrt(rayDirX * rayDirX + rayDirY * rayDirY) * dirLength;

			// BEST WAY, ONLY WORKS WHEN USING DIVISION BY 1 SIMPLIFICATION FOR DELTAS
			perpWallDist = (sideDistY - deltaDistY) * dirLength;
		}
		// divide by dirlength to bring it into camera space
		zBuffer[x] = perpWallDist / dirLength;
		if (!hit) continue;

		// calculate line height according to screen
		let drawStart = Math.floor((-0.5 * dirLength / perpWallDist + planeLength) / (planeLength * 2) * height);
		// if (drawStart < 0) drawStart = 0;
		let drawEnd = Math.floor((0.5 * dirLength / perpWallDist + planeLength) / (planeLength * 2) * height);
		let lineHeight = Math.floor(drawEnd - drawStart);
		// if (drawEnd >= canvasY) drawEnd = canvasY - 1;

		if (document.getElementById("textWalls").checked) {

			let wallX; //where exactly the wall was hit
			if (side == 0) wallX = posY + perpWallDist / dirLength * rayDirY;
			else wallX = posX + perpWallDist / dirLength * rayDirX;
			wallX -= Math.floor((wallX));

			//x coordinate on the texture
			let texX = Math.floor(wallX * texWidth);
			if (side == 0 && rayDirX > 0) texX = texWidth - texX - 1;
			if (side == 1 && rayDirY < 0) texX = texWidth - texX - 1;

			let step = texHeight / lineHeight;

			let texPos = -drawStart > 0 ? -drawStart * step : 0;

			let yStart = constrain(drawStart, 0, height);
			let yEnd = constrain(drawEnd, 0, height);
			for (let y = yStart; y < yEnd; y++) {
				let texY = Math.floor(texPos) & (texHeight - 1);
				texPos += step;
				let color = buffer2[texHeight * texY + texX];

				if (side == 0) {
					pixels[(x + y * width) * 4] = color[0];
					pixels[(x + y * width) * 4 + 1] = color[1];
					pixels[(x + y * width) * 4 + 2] = color[2];
					pixels[(x + y * width) * 4 + 3] = color[3];
				} else {
					pixels[(x + y * width) * 4] = color[0] + 30;
					pixels[(x + y * width) * 4 + 1] = color[1] + 30;
					pixels[(x + y * width) * 4 + 2] = color[2] + 25;
					pixels[(x + y * width) * 4 + 3] = color[3];
				}
				depthBuffer[x][y] = perpWallDist;
			}
		} else {
			fill(0, 100, 55);
			noStroke();
			rect(x, drawStart, 1, drawEnd - drawStart);
		}
	}
	if (document.getElementById("textWalls").checked)
		updatePixels();
}

function drawSprites() {
	sprites.forEach((s) => {
		s.udpateDistance();
	});
	sprites.sort((a, b) => {
		return b.distance - a.distance;
	});

	loadPixels();
	for (let i = 0; i < sprites.length; i++) {
		let spriteX = sprites[i].x - posX;
		let spriteY = sprites[i].y - posY;

		let invDet = 1.0 / (planeX * dirY - dirX * planeY);

		let transformX = invDet * (dirY * spriteX - dirX * spriteY);
		let transformY = invDet * (-planeY * spriteX + planeX * spriteY);

		// let spriteScreenX = ((transformX / transformY + 1) / 2) * width;

		// let spriteHeight = (1 / transformY) * height;
		// divide by planeLength to keep square ratio, since the sprite is a square, 
		// go up the same amount of camera space units as we go horizontally
		let drawStartY = Math.floor(map(0 / planeLength / transformY, -1, 1, 0, height));
		// if (drawStartY < 0) drawStartY = 0;
		let drawEndY = Math.floor(map(1 / planeLength / transformY, -1, 1, 0, height));
		// if (drawEndY >= height) drawEndY = height - 1;

		// let spriteWidth = (1 / transformY) * height;
		// divide by planeLength to bring 0.5 units from world space to camera space
		let drawStartX = Math.floor(map((transformX - 0.5 / planeLength) / transformY, -aspectRatio, aspectRatio, 0, width));
		// if (drawStartX < 0) drawStartX = 0;
		let drawEndX = Math.floor(map((transformX + 0.5 / planeLength) / transformY, -aspectRatio, aspectRatio, 0, width));
		// if (drawEndX >= width) drawEndX = width - 1;

		let stripeStart = constrain(drawStartX, 0, width);
		let stripeEnd = constrain(drawEndX, 0, width);

		for (let stripe = stripeStart; stripe < stripeEnd; stripe++) {
			let texX = Math.floor((stripe - drawStartX) * texWidth / (drawEndX - drawStartX));

			if (transformY > 0 && stripe > 0 && stripe < width && transformY < zBuffer[stripe]) {
				let yStart = constrain(drawStartY, 0, height);
				let yEnd = constrain(drawEndY, 0, height);
				for (let y = yStart; y < yEnd; y++) {
					if (depthBuffer[stripe][y] < transformY) continue;
					let texY = Math.floor((y - drawStartY) * texHeight / (drawEndY - drawStartY));

					let color = sprites[i].spriteBuffer[constrain(Math.floor(texWidth * texY + texX), 0, 4095)];
					// interpolate the current screens rgb value to the color of the sprite depeding on the alpha of the sprites pixel
					let red = color[3] * ((color[0] - pixels[(stripe + y * width) * 4]) / 255) + pixels[(stripe + y * width) * 4];
					let blue = color[3] * ((color[1] - pixels[(stripe + y * width) * 4 + 1]) / 255) + pixels[(stripe + y * width) * 4 + 1];
					let green = color[3] * ((color[2] - pixels[(stripe + y * width) * 4 + 2]) / 255) + pixels[(stripe + y * width) * 4 + 2];
					pixels[(stripe + y * width) * 4] = red;
					pixels[(stripe + y * width) * 4 + 1] = blue;
					pixels[(stripe + y * width) * 4 + 2] = green;
					pixels[(stripe + y * width) * 4 + 3] = 255;
					depthBuffer[stripe][y] = transformY;
				}
			}
		}
	}
	updatePixels();
}