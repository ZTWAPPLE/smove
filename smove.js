var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var levelColor = [ 'rgb(255,13,100)','rgb(248,224,58)','rgb(51,187,119)','rgb(0,128,255)'];
var levelIntervalMin = [0, 1000, 1000, 1000, 1000];
var levelIntervalMax = [0, 2000, 2000, 2000, 2000];
var levelUsedMax = [0, 4, 10, 8, 8];
var grid_size = 80;
var revive_time = 10000;
var grid_pl = [{x:canvas.width/2 - grid_size,y:canvas.height/2 - grid_size},
          {x:canvas.width/2,y:canvas.height/2 - grid_size},
          {x:canvas.width/2 + grid_size,y:canvas.height/2 - grid_size},
          {x:canvas.width/2 - grid_size,y:canvas.height/2},
          {x:canvas.width/2 ,y:canvas.height/2},
          {x:canvas.width/2 + grid_size,y:canvas.height/2},
          {x:canvas.width/2 - grid_size,y:canvas.height/2 + grid_size},
          {x:canvas.width/2,y:canvas.height/2 + grid_size},
          {x:canvas.width/2 + grid_size,y:canvas.height/2+ grid_size}]
		  
//pace meatures how fast the white ball moves
var pace = 5;
var score = 0;
//level can be from 1 to 4.
var level = 1;
//status can be one of the following:"start", "end", "game", "interval".
var status = "start";
var timeoutId;
var colorStopLast = 1;
var colorStopNow = 1;
var transparent = 0.5;
var start_anime_finish = false;
var restart_anime_finish = false;
var title = new Image();
title.src = 'title.png';
var instruc = new Image();
instruc.src = 'instruction.png';
var restart = new Image();
restart.src = 'restart.png';
var game_over = new Image();
game_over.src = 'game_over.png';
var your_score = new Image();
your_score.src = 'your_score.png';
var you_won = new Image();
you_won.src = 'you_won.jpeg';

var target = {
  x: canvas.width / 2 - grid_size,
  y: canvas.height / 2 - grid_size,
  width: 20,
  radius: 0,
  position: 0,
  color: 'blue',
  angle:0 ,
  speed: Math.PI / 20,
  eaten: false,
  draw: function() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle);
    roundedRect(0, 0, this.width, this.width, this.radius,true)
    ctx.restore();
 
  }
};

var black_ball = [];
var used_black = 0;
for(var i = 0; i < 15; i++){
  black_ball.push({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 25,
    used: false,
    color: 'black',
    draw: function() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  });
}

var white_ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: 'white',
  move_left: 0,
  move_right:0,
  move_up:0,
  move_down:0,
  draw: function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};

function roundedRect(x_mid,y_mid,width,height,radius, fill){
	var x = x_mid - (width / 2);
	var y = y_mid - (height / 2);
	ctx.beginPath();
	ctx.moveTo(x,y+radius);
	ctx.lineTo(x,y+height-radius);
	ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
	ctx.lineTo(x+width-radius,y+height);
	ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
	ctx.lineTo(x+width,y+radius);
	ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
	ctx.lineTo(x+radius,y);
	ctx.quadraticCurveTo(x,y,x,y+radius);
	if(fill){
		ctx.fill();
	}
	else{
		ctx.stroke();
	}
}

function drawBackground() {
  var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
  lingrad.addColorStop(0, levelColor[level - 1]);
  lingrad.addColorStop(1, levelColor[level % 4]);
  ctx.fillStyle = lingrad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawGrid(){
  
  var semi = grid_size * 1.5;
  var x_start = canvas.width / 2 - semi;
  var y_start = canvas.height / 2 - semi;
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3;
  roundedRect(canvas.width / 2, canvas.height / 2, 2*semi, 2*semi, 50)
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x_start,y_start + 2*semi / 3);
  ctx.lineTo(x_start + 2*semi,y_start + 2*semi / 3);
  ctx.moveTo(x_start,y_start + 4*semi / 3);
  ctx.lineTo(x_start + 2*semi,y_start + 4*semi / 3);
  
  ctx.moveTo(x_start + 2*semi / 3,y_start);
  ctx.lineTo(x_start + 2*semi / 3,y_start + 2*semi);
  ctx.moveTo(x_start + 4*semi / 3,y_start);
  ctx.lineTo(x_start + 4*semi / 3,y_start + 2*semi);
  ctx.stroke();

}
function eat_event(){
  target.eaten = true;
  score++;
  if(score % 20 == 0 && score < 79){
	  status = 'interval';
  }
  else if(score == 80)
  {
	  status = "end";
	  colorStopLast = 0;
	  window.requestAnimationFrame(win_animation);
  }
  setTimeout(revive(target.position), revive_time);
}

function revive(last_index){
  var pos = Math.floor(Math.random()*9);
  while(pos == last_index){
	  pos = Math.floor(Math.random()*9);
  }
  var pos_obj = grid_pl[pos];
  target.x = pos_obj.x;
  target.y = pos_obj.y;
  target.position = pos;
  target.eaten = false;
}
function activate_black_ball(){
	if(status == 'game'){ 
		if(level == 1){
			if(used_black < levelUsedMax[level]){
				used_black++;
				var temp = black_ball.pop();
				temp.used = true;
				var ball_type = 4 * Math.random();
				var lane = 3 * Math.random();
				if(ball_type < 1){
					temp.vx = 3;
					temp.x = 0 - temp.radius;
					if(lane < 1){
					  temp.y = (canvas.height / 2) - grid_size;
					}
					else if(lane < 2){
					  temp.y = (canvas.height / 2)
				   }
					else{
					  temp.y = (canvas.height / 2) + grid_size;
				   }
				}
				else if(ball_type < 2){
					temp.vx = -3;
					temp.x = canvas.width + temp.radius;
					if(lane < 1){
					  temp.y = (canvas.height / 2) - grid_size;
					}
					else if(lane < 2){
					  temp.y = (canvas.height / 2)
				   }
					else{
					  temp.y = (canvas.height / 2) + grid_size;
				   }
				}
				else if(ball_type < 3){
					temp.vy = 3;
					temp.y = 0 - temp.radius;
					if(lane < 1){
					  temp.x = (canvas.width / 2) - grid_size;
					}
					else if(lane < 2){
					  temp.x = (canvas.width / 2)
					}
					else{
					  temp.x = (canvas.width / 2) + grid_size;
					}
				}
				else{
					temp.vy = -3;
					temp.y = canvas.height + temp.radius;
					if(lane < 1){
					  temp.x = (canvas.width / 2) - grid_size;
					}
					else if(lane < 2){
					  temp.x = (canvas.width / 2)
				   }
					else{
					  temp.x = (canvas.width / 2) + grid_size;
				   }
				}
				black_ball.unshift(temp);
			}
		}
		else if(level == 2){
			//there are 7 types of combination of balls in level 2
			var ball_type = 7 * Math.random()
			if(used_black + 2 < levelUsedMax[level]){
				var temp1 = black_ball.pop();
				var temp2 = black_ball.pop();
				if(ball_type < 1){
					if(used_black + 4 < levelUsedMax[level]){
						var temp3 = black_ball.pop();
						var temp4 = black_ball.pop();
						temp1.vx = 3;
						temp1.x = 0 - temp1.radius;
						temp1.y = (canvas.height / 2) + grid_size;
						temp2.vx = -3;
						temp2.x = canvas.width + temp2.radius;
						temp2.y = (canvas.height / 2) - grid_size;
						temp3.vy = 3;
						temp3.y = 0 - temp3.radius;
						temp3.x = (canvas.width / 2) - grid_size;
						temp3.used = true;
						temp4.vy = -3;
						temp4.y = canvas.height + temp4.radius;
						temp4.x = (canvas.width / 2) + grid_size;
						temp4.used = true;
						black_ball.unshift(temp3);
						black_ball.unshift(temp4);
						used_black += 2;
					}
				 }
				else if(ball_type < 2){
					temp1.vx = 3;
					temp1.x = 0 - temp1.radius;
					temp1.y = (canvas.height / 2) + grid_size;
					temp2.vx = -3;
					temp2.x = canvas.width + temp2.radius;
					temp2.y = (canvas.height / 2) - grid_size;

				}
				else if(ball_type < 3){
					temp1.vy = 3;
					temp1.y = 0 - temp1.radius;
					temp1.x = (canvas.width / 2) - grid_size;
					temp2.vy = -3;
					temp2.y = canvas.height + temp2.radius;
					temp2.x = (canvas.width / 2) + grid_size;
				}
				else if(ball_type < 4){
					temp1.vx = 3;
					temp1.x = 0 - temp1.radius;
					temp1.y = (canvas.height / 2) - grid_size;
					temp2.vx = -3;
					temp2.x = canvas.width + temp2.radius;
					temp2.y = (canvas.height / 2) + grid_size;
				}
				else if(ball_type < 5){
					temp1.vy = 3;
					temp1.y = 0 - temp1.radius;
					temp1.x = (canvas.width / 2) + grid_size;
					temp2.vy = -3;
					temp2.y = canvas.height + temp2.radius;
					temp2.x = (canvas.width / 2) - grid_size;
				}
				else if(ball_type < 6){
					temp1.vx = 3;
					temp1.x = 0 - temp1.radius;
					temp1.y = (canvas.height / 2);
					temp2.vx = -3;
					temp2.x = canvas.width + temp2.radius;
					temp2.y = (canvas.height / 2);
				}
				else{
					temp1.vy = 3;
					temp1.y = 0 - temp1.radius;
					temp1.x = (canvas.width / 2);
					temp2.vy = -3;
					temp2.y = canvas.height + temp2.radius;
					temp2.x = (canvas.width / 2);
				}
				temp1.used = true;
				temp2.used = true;
				black_ball.unshift(temp1);
				if(temp1.vx == 0 && temp1. vy == 0){
					recycle(0);
				}
				black_ball.unshift(temp2);
				if(temp2.vx == 0 && temp2. vy == 0){
					recycle(0);
				}
				//console.info(temp1.vx + ' ' + temp1.vy +' ' +temp2.vx + ' ' + temp2.vy);
				used_black += 2;
			}
		}
		else if(level == 3){
			if(used_black + 2 < levelUsedMax[level]){
				var temp1 = black_ball.pop();
				var temp2 = black_ball.pop();
				var ball_type = 4 * Math.random();
				var lane = 2 * Math.random();
				if(ball_type < 1){
					temp1.vx = 3;
					temp1.x = 0 - temp1.radius;
					temp2.vx = 4;
					temp2.x = 0 - 4*temp2.radius;
					if(lane < 1){
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2);
					}
					else{
						temp1.y = (canvas.height / 2) + grid_size;
						temp2.y = (canvas.height / 2);
					}
				}
				else if(ball_type < 2){
					temp1.vx = -3;
					temp1.x = canvas.width + temp1.radius;
					temp2.vx = -4;
					temp2.x = canvas.width + 4*temp2.radius;
					if(lane < 1){
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2);
					}
					else{
						temp1.y = (canvas.height / 2) + grid_size;
						temp2.y = (canvas.height / 2);
					}
				}
				else if(ball_type < 3){
					temp1.vy = 3;
					temp1.y = 0 - temp1.radius;
					temp2.vy = 4;
					temp2.y = 0 - 4*temp2.radius;
					if(lane < 1){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2);
					}
					else{
						temp1.x = (canvas.width / 2) + grid_size;
						temp2.x = (canvas.width / 2);
					}
				}
				else{
					temp1.vy = -3;
					temp1.y = canvas.height + temp1.radius;
					temp2.vy = -4;
					temp2.y = canvas.height + 4*temp2.radius;
					if(lane < 1){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2);
					}
					else{
						temp1.x = (canvas.width / 2) + grid_size;
						temp2.x = (canvas.width / 2);
					}
				}
				temp1.used = true;
				temp2.used = true;
				black_ball.unshift(temp1);
				black_ball.unshift(temp2);
				used_black += 2;
			}
		}
		else{
			if(used_black + 2 < levelUsedMax[level]){
				var temp1 = black_ball.pop();
				var temp2 = black_ball.pop();
				var ball_type = 4 * Math.random();
				var lane = 3 * Math.random();
				
				if(ball_type < 1){
					temp1.vx = 3;
					temp1.x = 0 - temp1.radius;
					temp2.vx = 3;
					temp2.x = 0 - temp2.radius;
					if(lane < 1){
						temp1.y = (canvas.height / 2) + grid_size;
						temp2.y = (canvas.height / 2);
					}
					else if(lane < 2){
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2) + grid_size;
					}
					else{
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2);
					}
				}
				else if(ball_type < 2){
					temp1.vx = -3;
					temp1.x = canvas.width + temp1.radius;
					temp2.vx = -3;
					temp2.x = canvas.width + temp2.radius;
					if(lane < 1){
						temp1.y = (canvas.height / 2) + grid_size;
						temp2.y = (canvas.height / 2);
					}
					else if(lane < 2){
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2) + grid_size;
					}
					else{
						temp1.y = (canvas.height / 2) - grid_size;
						temp2.y = (canvas.height / 2);
					}
				}
				else if(ball_type < 3){
					temp1.vy = 3;
					temp1.y = 0 - temp1.radius;
					temp2.vy = 3;
					temp2.y = 0 - temp2.radius;
					if(lane < 1){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2);
					}
					else if(lane < 2){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2) + grid_size;
					}
					else{
						temp1.x = (canvas.width / 2) + grid_size;
						temp2.x = (canvas.width / 2);
					}
				}
				else{
					temp1.vy = -3;
					temp1.y = canvas.height + temp1.radius;
					temp2.vy = -3;
					temp2.y = canvas.height + temp2.radius;
					if(lane < 1){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2);
					}
					else if(lane < 2){
						temp1.x = (canvas.width / 2) - grid_size;
						temp2.x = (canvas.width / 2) + grid_size;
					}
					else{
						temp1.x = (canvas.width / 2) + grid_size;
						temp2.x = (canvas.width / 2);
					}
				}
				temp1.used = true;
				temp2.used = true;
				black_ball.unshift(temp1);
				black_ball.unshift(temp2);
				used_black += 2;
			}
		}
		var interval = Math.random()*(levelIntervalMax[level] - levelIntervalMin[level]) + levelIntervalMin[level];
		timeoutId = window.setTimeout(activate_black_ball, interval);
	}
}

function recycle(index){
  var temp = black_ball[index];
  temp.used = false;
  temp.vx = 0;
  temp.vy = 0;
  used_black--;
  black_ball.splice(index, 1);
  black_ball.push(temp);
}

function drawScore(){
	ctx.fillStyle = 'white';
	ctx.font = "30px Georgia";
	ctx.fillText("Score:", 10, 50);
	ctx.font = "48px serif";
	ctx.fillText(score, 50, 100);
}

function too_close(a, b){
  var dis_square = ((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y));
  var rad_square = (a.radius + b.radius - 1) * (a.radius + b.radius - 1);
  if(dis_square > rad_square){
    return false;
  }
  return true;
}

function drawIntervalBackgound(){
	if(colorStopLast > 0.01){
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[level - 1]);
		lingrad.addColorStop(colorStopLast, levelColor[level]);
		lingrad.addColorStop(1, levelColor[level]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		colorStopLast -= 0.02;
		ctx.save();
		ctx.globalAlpha = 1 - colorStopLast;
		ctx.fillStyle = 'white';
		ctx.font = "40px 'Microsoft JhengHei Light'";
		ctx.fillText("Level " + level, canvas.width / 2, canvas.height / 2 - (2*grid_size));
		ctx.restore();
	}
	else if(colorStopNow > 0.01){
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[level]);
		lingrad.addColorStop(colorStopNow, levelColor[level]);
		lingrad.addColorStop(1, levelColor[(level + 1)% 4]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		colorStopNow -= 0.02;
		ctx.save();
		ctx.globalAlpha = colorStopNow;
		ctx.fillStyle = 'white';
		ctx.font = "40px 'Microsoft JhengHei Light'";
		ctx.fillText("Level " + (level+1), canvas.width / 2, canvas.height / 2 - (2*grid_size));
		ctx.restore();
	}
	else{
		colorStopNow = 1;
		colorStopLast = 1;
		status = "game";
		activate_black_ball();
		level++;
	}
}

function game_update(){
	if(white_ball.move_left > 0){
    if(white_ball.move_left > pace){
      white_ball.x -= pace;
      white_ball.move_left -= pace;
    }
	else{
		white_ball.x -= white_ball.move_left;
		white_ball.move_left = 0;
	}
  }
  else if(white_ball.move_right > 0){
    if(white_ball.move_right > pace){
      white_ball.x += pace;
      white_ball.move_right -= pace;
    }
	else{
		white_ball.x += white_ball.move_right;
		white_ball.move_right = 0;
	}
  }
  else if(white_ball.move_up > 0){
    if(white_ball.move_up > pace){
      white_ball.y -= pace;
      white_ball.move_up -= pace;
    }
	else{
		white_ball.y -= white_ball.move_up;
		white_ball.move_up = 0;
	}
  }
  else if(white_ball.move_down > 0){
    if(white_ball.move_down > pace){
      white_ball.y += pace;
      white_ball.move_down -= pace;
    }
	else{
		white_ball.y += white_ball.move_down;
		white_ball.move_down = 0;
	}
  }
  
	var i = 0
	var ball = black_ball[i];
	while(ball.used){
		ball.x += ball.vx;
		ball.y += ball.vy;

		if ((ball.y > canvas.height && ball.vy > 0.1)||(ball.y < 0  && ball.vy < -0.1)||( ball.x > canvas.width && ball.vx > 0.1)||(ball.x < 0 && ball.vx < -0.1)) {
			recycle(i);
		}
		else{
			i++;
			if(i >= levelUsedMax[level]){
				break;
			}
		}
		ball = black_ball[i];
	}
	if(score % 20 == 19){
		target.color = 'yellow';
	}
	else{
		target.color = 'blue';
	}
  	if(target.eaten == false){
		target.angle += target.speed;
	}
	if(target.eaten == false && too_close(white_ball, target)){
		eat_event();
  }
  
  i = 0;
  while(i < used_black){
    if(too_close(white_ball, black_ball[i])){
      status = "end";
	  colorStopLast = 0;
	  end_animation();
      break;
    }
	i++;
  }
}

function game_draw(){
	ctx.clearRect(0,0, canvas.width, canvas.height);
	if(status == 'game'){
	drawBackground();
	}
	else if(status == 'interval'){
		drawIntervalBackgound();
		//添加等级文字(level + 1)
	}

	drawGrid();
	drawScore();
	white_ball.draw();
		if(target.eaten == false){
		target.draw();
	}
	var i = 0
	var ball = black_ball[i];
	while(ball.used){
		ball.draw();
		i++;
		ball = black_ball[i];
	}
	game_update();
	if(status == "game" || status == "interval"){
		window.requestAnimationFrame(game_draw);
	}
}

function start_draw(){
		ctx.fillStyle = levelColor[0];
		ctx.fillRect(0,0,canvas.width,canvas.height);
		drawGrid();
		white_ball.draw();
		ctx.fillStyle = 'rgba(255,255,255,'+transparent+')';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.drawImage(title,0,50,canvas.width,292);
		ctx.drawImage(instruc,0, 450,canvas.width,108);
}

function start_animation(){
	if(colorStopNow > 0.01){
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[0]);
		lingrad.addColorStop(colorStopNow, levelColor[0]);
		lingrad.addColorStop(1, levelColor[1]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		drawGrid();
		white_ball.draw();
		ctx.fillStyle = 'rgba(255,255,255,'+transparent+')';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		colorStopNow -= 0.02;
		transparent -= 0.01;
		//开始的文字
		ctx.save();
		ctx.globalAlpha = colorStopNow;
		ctx.drawImage(title,0,50,canvas.width,292);
		ctx.drawImage(instruc,0, 450,canvas.width,108);
		ctx.restore();
		window.requestAnimationFrame(start_animation);
	}
	else{
		colorStopNow = 1;
		transparent = 0;
		start_anime_finish = true;
		
	}
}

function restart_animation(){
	if(colorStopNow > 0.01){
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[0]);
		lingrad.addColorStop(colorStopNow, levelColor[0]);
		lingrad.addColorStop(1, levelColor[1]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		drawGrid();
		white_ball.draw();
		ctx.fillStyle = 'rgba(255,255,255,'+transparent+')';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		colorStopNow -= 0.02;
		transparent -= 0.01;
		//重新开始的文字
		ctx.save();
		ctx.fillStyle = 'black';
		ctx.font = "100px 'Tempus Sans ITC'";
		ctx.globalAlpha = colorStopNow;
		ctx.drawImage(game_over,0,0,canvas.width,210);
		ctx.drawImage(your_score,0, 400,canvas.width/1.5,149);
		ctx.fillText(score, 450, 500);
		ctx.drawImage(restart,150, 540,canvas.width/2,54);
		ctx.restore();
		window.requestAnimationFrame(restart_animation);
	}
	else{
		colorStopNow = 1;
		transparent = 0;
		restart_anime_finish = true;
		
	}
}

function end_animation(){
	if(colorStopLast <= 1.01){
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[level - 1]);
		lingrad.addColorStop(colorStopLast, levelColor[level - 1]);
		lingrad.addColorStop(1, levelColor[level% 4]);
		//lingrad.addColorStop(colorStopLast, levelColor[level - 1]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		drawGrid();
		white_ball.draw();
		if(target.eaten == false){
			target.draw();
		}
		var i = 0
		var ball = black_ball[i];
		while(ball.used){
			ball.draw();
			i++;
			ball = black_ball[i];
		}
		ctx.fillStyle = 'rgba(255,255,255,' +transparent +')';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		colorStopLast += 0.01;
		transparent += 0.005;
		//结束的文字
		ctx.save();
		ctx.fillStyle = 'black';
		ctx.font = "100px 'Tempus Sans ITC'";
		ctx.globalAlpha = colorStopLast;
		ctx.drawImage(game_over,0,0,canvas.width,210);
		ctx.drawImage(your_score,0, 400,canvas.width/1.5,149);
		ctx.fillText(score, 450, 500);
		ctx.drawImage(restart,150, 540,canvas.width/2,54);
		ctx.restore();
		window.requestAnimationFrame(end_animation);
	}
	else{
		colorStopLast = 1;
		transparent = 0.5;
	}
}
function win_animation(){
	if(colorStopLast < 1){
		colorStopLast += 0.01;
		transparent += 0.005;
		window.requestAnimationFrame(win_animation);
	}
		var lingrad = ctx.createLinearGradient(0,0,0,canvas.height);
		lingrad.addColorStop(0, levelColor[level - 1]);
		lingrad.addColorStop(colorStopLast, levelColor[level - 1]);
		lingrad.addColorStop(1, levelColor[level% 4]);
		//lingrad.addColorStop(colorStopLast, levelColor[level - 1]);
		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,canvas.width,canvas.height);
		drawGrid();
		white_ball.draw();
		if(target.eaten == false){
			target.draw();
		}
		var i = 0
		var ball = black_ball[i];
		while(ball.used){
			ball.draw();
			i++;
			ball = black_ball[i];
		}
		//结束的文字
		ctx.save();
		ctx.globalAlpha = 1.5*transparent;
		ctx.fillStyle = 'black';
		ctx.font = "100px 'Tempus Sans ITC'";
		ctx.drawImage(you_won, 0, 0, 600, 728);
		ctx.globalAlpha = 2*transparent;
		ctx.fillText("You won!!!", 50, 100);
		ctx.restore();
}

function test_start_anime(){
	if(start_anime_finish == false){
		setTimeout(test_start_anime);
	}
	else{
		activate_black_ball();
		window.requestAnimationFrame(game_draw);
	}
}

function test_restart_anime(){
	if(restart_anime_finish == false){
		setTimeout(test_restart_anime);
	}
	else{
		activate_black_ball();
		window.requestAnimationFrame(game_draw);
	}
}

window.addEventListener('keypress', function(e){
  if(status == "game" || status == "interval"){
	//score = e.keyCode;
	
   //keyCode 37 = Left
   //keyCode 38 = Up
   //keyCode 39 = Right
   //keyCode 40 = Down
    if((e.keyCode == 37 ||e.keyCode == 65 || e.keyCode == 97) && white_ball.x >= (canvas.width / 2) - 1 && white_ball.move_left == 0){
      white_ball.move_left += grid_size;
    }
    else if((e.keyCode == 38 ||e.keyCode == 87 || e.keyCode == 119) && white_ball.y >= (canvas.height / 2) - 1 && white_ball.move_up == 0){
      white_ball.move_up += grid_size;
    }
    else if((e.keyCode == 39 ||e.keyCode == 68 || e.keyCode == 100) && white_ball.x <= (canvas.width / 2) + 1 && white_ball.move_right == 0){
      white_ball.move_right += grid_size;
    }
    else if((e.keyCode == 40 ||e.keyCode == 83 || e.keyCode == 115) && white_ball.y <= (canvas.height / 2) + 1 && white_ball.move_down == 0){
      white_ball.move_down += grid_size;
    }
  }
  
  else if(status == "start" ){
	  //keyCode 32 = Space
	  if(e.keyCode == 32){
		  status = "game";
		  level = 1;
		  score = 0;
		  while(used_black){
			  recycle(used_black - 1);
		  }
		  start_anime_finish = false;
		  colorStopNow = 1;
		  start_animation();
		  test_start_anime();
	  }
  }
  
    else if(status == "end" ){
	  //keyCode 32 = Space
	  if(e.keyCode == 32){
		  status = "game";
		  level = 1;
		  score = 0;
		  while(used_black){
			  recycle(used_black - 1);
		  }
		  restart_anime_finish = false;
		  colorStopNow = 1;
		  restart_animation();
		  test_restart_anime();
	  }
  }
});
