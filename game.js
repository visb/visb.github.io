(function(undefined){
	'use strict';

	/**
	 * GameBoard Model
	 */
	function GameBoard() {
		/**
		 * Number of frame of the board
		 * @type {Integer}
		 * @public
		 */
		this.size = 8;

		/**
		 * All pieces
		 * @type {Array}
		 * @public
		 */
		this.pieces = [];

		/**
		 * All frames, grouped by row(matrix [@size x @size])
		 * @type {Array}
		 * @public
		 */
		this.frames = [];

		/**
		 * Reference to GameController
		 * @public
		 */
		this.game;

		/**
		 * Board constructor
		 * @return {void}
		 * @public
		 */
		this.init = function() {
			if (typeof this.game === 'undefined') {
				console.error('error');
			}
			initFrames.call(this);
			initPieces.call(this);
		};

		/**
		 * Create the frames of board
		 * @return {void}
		 * @private
		 */
		var initFrames = function() {
			var row, i, j, frame;

			// linhas
			for (i = 0; i < this.size; i++) {
				row = [];

				// colunas
				for (j = 0; j < this.size; j++) {
					// type 0 = white
					frame = {
						type: 0,
						position: {y: i, x: j}
					};

					if (i%2 === j%2) {
						// type 1 = black
						frame.type = 1;
					}
					row.push(frame);
				}

				this.frames.push(row);
			}
		};

		/**
		 * Create the pieces and relates with table and user
		 * @return {void}
		 * @private
		 */
		var initPieces = function() {
			// preset vars
			var piece, player;

			// pieces configurations
			var linesWithPieces = 2,
				piecesByLine = this.size/2;

			// loop vars
			var playerIndex, pieceLine, pieceIndex;

			// players loop vars
			var players = this.game.players,
				playersLength = players.length;

			// each player
			for (playerIndex = 0; playerIndex < playersLength; playerIndex++) {
				player = this.game.players[playerIndex];

				// lines with pieces by each player
				for (pieceLine = 0; pieceLine < linesWithPieces; pieceLine++) {

					// pieces by line
					for (pieceIndex = 0; pieceIndex < piecesByLine; pieceIndex++) {
						piece = new GamePiece;

						piece.board = this;

						// vertical position of piece on table
						piece.position.y = pieceLine;

						// pieces on bottom
						if (playerIndex === 0) {
							piece.position.y = this.size - pieceLine - 1;
							piece.direction = 'btt';
						}

						// horizontal position of piece on table
						piece.position.x = piece.position.y % 2 + (pieceIndex * 2);

						// relates piece with player
						piece.player = player;

						// relates piece with table frame
						this.frames[piece.position.y][piece.position.x].piece = piece;

						// relates piece with user
						player.pieces.push(piece);
					} // endfor: pieces by line
				} // endfor: lines by player
			} // endfor: each player
		}
	}

	/**
	 * GamePiece Model
	 */
	function GamePiece() {
		this.position = {x: 0, y: 0};
		this.player;
		this.board;
		this.crown = false;

		/**
		 * Default move direction
		 * 		ttb = top to bottom
		 * 		btt = bottom to top
		 * @type {String}
		 */
		this.direction = 'ttb';

		this.move = function(x, y) {
			if (!this.testMove(x, y)) {
				return false;
			}

			this.board.frames[this.position.y][this.position.x].piece = undefined;

			this.position.x = x;
			this.position.y = y;
			this.board.frames[this.position.y][this.position.x].piece = this;

			return true;
		};

		this.testMove = function(x, y) {
			if (testSingleMove.call(this, x, y)) {
				return true;
			}

			if (testEat.call(this, x, y)) {
				return true;
			}

			if (this.crown) {
				// @todo
			}

			return false;
		};

		var testSingleMove = function(x, y) {
			var frame = this.board.frames[y][x];

			if (typeof frame.piece !== 'undefined') {
				return false;
			}

			if (frame.type !== 1) {
				return false;
			}

			if (this.direction === 'btt' && this.position.y < y) {
				return false;
			}

			if (this.direction === 'ttb' && this.position.y > y) {
				return false;
			}

			if (this.position.x < x - 1 || this.position.x > x + 1) {
				return false;
			}

			if (this.position.y < y - 1 || this.position.y > y + 1) {
				return false;
			}

			return true;
		};

		var testEat = function(x, y) {
			var futureFrame = this.board.frames[y][x];

			if (typeof futureFrame.piece !== 'undefined') {
				console.log('1');
				return false;
			}

			var middleX = this.position.x - Math.floor((this.position.x - x) / 2);
			var middleY = this.position.y - Math.floor((this.position.y - y) / 2);
			var middleFrame = this.board.frames[middleY][middleX];

			if (this.direction === 'btt' && this.position.y < y) {
				return false;
			}

			if (this.direction === 'ttb' && this.position.y > y) {
				return false;
			}

			if (typeof middleFrame.piece === 'undefined') {
				console.log(middleFrame);
				console.log('2');
				return false;
			}

			if (middleFrame.piece.player === this.player) {
				console.log('3');
				return false;
			}

			middleFrame.piece.ate = true;
			middleFrame.piece = undefined;

			return true;
		};
	}

	/**
	 * GamePlayer Model
	 */
	function GamePlayer () {
		this.pieces = [];
		this.active = false;
	}

	function GameController() {
		this.board;
		this.players = [];

		this.init = function() {
			this.board = new GameBoard;
			this.board.game = this;
			this.board.init();
		}
	}

	function GameRenderer() {

		/**
		 * [canvasWidth description]
		 * @type {Integer}
		 * @private
		 */
		var canvasWidth;

		/**
		 * [canvasHeight description]
		 * @type {Integer}
		 * @private
		 */
		var canvasHeight;

		/**
		 * [frameWidth description]
		 * @type {Integer}
		 * @private
		 */
		var frameWidth;

		/**
		 * [frameHeight description]
		 * @type {Integer}
		 * @private
		 */
		var frameHeight;

		this.getFrameWidth = function() {
			return frameWidth;
		};

		this.getFrameHeight = function() {
			return frameHeight;
		};

		this.init = function() {
			if (typeof this.game === 'undefined') {
				console.error('Undefined game property on GameRenderer');
			}

			// create canvas element if isn't previously setted
			if (typeof this.element === 'undefined') {
				this.element = document.createElement('canvas');
				this.context = undefined;
				document.body.appendChild(this.element);
			}

			// get context 2d of canvas element
			this.context = this.element.getContext('2d');

			// get size info of canvas element
			this.element.width = canvasWidth = this.element.offsetWidth;
			this.element.height = canvasHeight = this.element.offsetHeight;

			// calculates size of each frame
			frameWidth = Math.floor(canvasWidth / this.game.board.size);
			frameHeight = Math.floor(canvasHeight / this.game.board.size);
		};

		this.render = function() {
			renderBoard.call(this);
			renderPieces.call(this);
		};
		
		/**
		 * Render the board
		 * @return {void}
		 */
		var renderBoard = function() {
			// clear canvas
			drawRect.call(this, 0, 0, canvasWidth, canvasHeight, '#fff');

			// preset vars
			var
				// lines of board
				framesLines,

				// number of lines in board
				framesLinesLength,

				// index of lines's loop
				lineIndex,

				// frames of line
				lineFrames,

				// number of frames in line
				lineFramesLength,

				// index of frames's loop
				frameIndex,

				// current frame
				frame;

			framesLines = this.game.board.frames,
			framesLinesLength = framesLines.length;

			// each line
			for (lineIndex = 0; lineIndex < framesLinesLength; lineIndex++) {
				lineFrames = framesLines[lineIndex];
				lineFramesLength =  lineFrames.length;

				// each frame on line
				for (frameIndex = 0; frameIndex < lineFramesLength; frameIndex++) {
					frame = lineFrames[frameIndex];

					// type 1 == dark background
					if (frame.type === 1) {
						renderDarkFrame.call(this, frame);
					}
				}// endfor: each frame on line
			}// endfor: each line
		};

		/**
		 * Render a dark frame on board
		 * @param  {Object} frame
		 * @return {void}
		 */
		var renderDarkFrame = function(frame) {
			var x = frame.position.x * frameWidth,
				y = frame.position.y * frameHeight,
				color = '#666';

			if (frame.wrong) {
				color = '#f00';
			} else if (frame.selected) {
				color = '#000';
			}

			drawRect.call(this, x, y, frameWidth, frameHeight, color);
		};
		
		/**
		 * Render the pieces on board
		 * @return {void}
		 */
		var renderPieces = function() {
			var players = this.game.players,
				playersLength = players.length,
				playerIndex,
				player,

				pieces,
				piecesLength,
				pieceIndex,
				piece;

			for (playerIndex = 0; playerIndex < playersLength; playerIndex++) {
				player = players[playerIndex];
				pieces = player.pieces;
				piecesLength = pieces.length;

				for (pieceIndex = 0; pieceIndex < piecesLength; pieceIndex++) {
					piece = pieces[pieceIndex];
					if (!piece.ate) {
						renderPiece.call(this, piece, playerIndex);
					}
				}
			}
		};

		/**
		 * Render a single piece on board
		 * @param  {Object} piece object
		 * @param  {Integer} color id
		 * @return {void}
		 */
		var renderPiece = function(piece, color) {
			var color = ['#00f', '#0f0'][color],
				x = (piece.position.x * frameWidth) + Math.floor((frameWidth - 20) / 2) + 10,
				y = (piece.position.y * frameHeight) + Math.floor((frameWidth - 20) / 2) + 10,
				radius = Math.floor((frameWidth - 20) / 2);

			if (piece.selected) {
				drawRect.call(
					this,
					piece.position.x * frameWidth,
					piece.position.y * frameHeight,
					frameWidth, frameHeight,
					'#000'
				);
			}

			drawCirc.call(this, x, y, radius, color);

			// strong piece
			if (piece.crown) {
				for (var i = 0; i < 5; i++) {
					this.context.beginPath();
					drawCirc.call(this, x, y - i, radius, color);
				}
			}
		};

		var drawRect = function(x, y, width, height, background) {
			this.context.beginPath();
			this.context.fillStyle = background;
			this.context.fillRect(x, y, width, height);
			this.context.fill();
		};

		var drawCirc = function(x, y, radius, background) {
			this.context.beginPath();

			this.context.fillStyle = background;
			this.context.strokeStyle = '#000';

			this.context.arc(x, y, radius, 0, 2 * Math.PI, true);

			this.context.fill();
			this.context.stroke();
		};

	};

	// go horse method, sorry :(
	function GameUI() {
		var game = new GameController,
			player1 = new GamePlayer,
			player2 = new GamePlayer;

		var playerActive = 1;

		game.players.push(player1);
		game.players.push(player2);

		var changePlayerActive = function() {
			game.players[playerActive].active = false;
			playerActive = playerActive === 0 ? 1 : 0;
			game.players[playerActive].active = true;
			document.getElementById('userActiveIdentifier').style.background = ['#00f', '#0f0'][playerActive];
		}

		changePlayerActive();

		game.players[playerActive].active = true;

		game.init();

		var renderer = new GameRenderer;
		renderer.game = game;
		renderer.init();
		renderer.render();

		var frameSelected;

		// input
		renderer.element.addEventListener('click', function(e){
			var clickX = e.clientX - this.offsetLeft,
				clickY = e.clientY - this.offsetTop,
				frameX = Math.floor(clickX / renderer.getFrameWidth()),
				frameY = Math.floor(clickY / renderer.getFrameHeight()),
				frame = game.board.frames[frameY][frameX];
				console.log(frame);

				if (typeof frame.piece !== 'undefined' && frame.piece.player === game.players[playerActive]) {
					if (frameSelected) {
						frameSelected.selected = false;
					}

					frame.selected = true;
					frameSelected = frame;
					renderer.render();
				} else if (frameSelected) {
					if (frameSelected.piece.move(frame.position.x, frame.position.y)) {
						frameSelected.selected = false;
						frameSelected = undefined;
						renderer.render();
						changePlayerActive();

						if (!game.players[playerActive].pieces.length) {
							changePlayerActive();
							game.players[playerActive].win();
						}
					}
				}

		});
	}

	new GameUI;

})();
