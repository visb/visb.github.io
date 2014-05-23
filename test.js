function testBoardInit() {
	var game = new GameController,
			player1 = new GamePlayer,
			computer = new GamePlayer;

	game.players.push(player1);
	game.players.push(computer);

	game.init();
}

function testGameRenderer() {
	var game = new GameController,
		player1 = new GamePlayer,
		player2 = new GamePlayer;

	player1.id = '1';
	player2.id = '2';
	player1.active = true;
	game.players.push(player1);
	game.players.push(player2);

	game.init();

	var renderer = new GameRenderer;
	renderer.game = game;
	renderer.init();
	renderer.render();
}

function testSingleMove() {
	var game = new GameController,
		player1 = new GamePlayer,
		player2 = new GamePlayer;

	player1.id = '1';
	player2.id = '2';
	player1.active = true;
	game.players.push(player1);
	game.players.push(player2);

	game.init();

	var renderer = new GameRenderer;
	renderer.game = game;
	renderer.init();

	var p = player1.pieces[4];

	game.board.frames[p.position.x+1][p.position.y-1].wrong = true;

	console.log(p.testMove(p.position.x+1, p.position.y-1));
	renderer.render();
}

function testSingleEat() {
	var game = new GameController,
		player1 = new GamePlayer,
		player2 = new GamePlayer;

	player1.id = '1';
	player2.id = '2';
	player1.active = true;
	game.players.push(player1);
	game.players.push(player2);

	game.init();

	var renderer = new GameRenderer;
	renderer.game = game;
	renderer.init();

	var p1 = player1.pieces[4];
	var p2 = player2.pieces[4];

	p2.position.x = 1;
	p2.position.y = 5;

	game.board.frames[4][2].wrong = true;
	game.board.frames[5][1].piece = p2;

	console.log(p1.testMove(2,4));
	console.log(p1);

	// console.log(p.testMove(p.position.x+1, p.position.y-1));
	renderer.render();
}

// testSingleEat();

new GameUI