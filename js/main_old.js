(function ($, window, document, undefined) {


			$.Sudoku = function (game) {

				var generatingLevel = 0;
				var playingLevel = 0;
				var playingNumber = null;
				var noteMode = false;
				var current_the_cell = null;
				var current_cell = null;
				var current_which = null;

				var current_state = 1; //1: resume  -1: pause
				var timer = null;

				var game_end = false;

				var level_label = ['beginners Sudoku', 'easy Sudoku', 'normal Sudoku', 'hard Sudoku', '17-clue Sudoku'];
				var generate_label = function () { return 'Start ' + level_label[generatingLevel] };


				// Build html structure first
				//
				var $this = $('<div class="sudoku">');
				var $generator = $('<button class="btn-generate initial" title="swipe left/right to change level">' + generate_label() + '</button>');
				var $btnEasier = $('<button class="btn-difficulty btn-easier"><i class="fa fa-arrow-left"></i></button>');
				var $btnHarder = $('<button class="btn-difficulty btn-harder"><i class="fa fa-arrow-right"></i></button>');
				var $info = $('<div class="sudoku-info"></div>');
				var $overlay = $('<div class="overlay layer"><div class="message"></div><div class="record"></div><div class="record-level"></div></div>');

				//var $noteMode = $('<div class="note">note</div>');


				var $toptable = $('<table class="toptable"></table>');
				var $toptr = $('<tr></tr>');
				var $toptd1 = $('<td></td>');
				var $toptd2 = $('<td></td>');
				var $toptd3 = $('<td></td>');

				var $menubtn =$('<img class="menu-btn" src="img/menu.png">');
				var $logo =$('<img class="logo" src="img/logo.png">');
				var $lvLabel =$('<div class="lv-label"></div>');
				var $playRecord = $('<div class="play-record">00:00:00</div>');
				var $pauseBtn = $('<img class="pause-btn" src="img/pause.png">');

				$toptd1.append($menubtn);
				$toptd1.append($logo);
				$toptd2.append($lvLabel);
				$toptd3.append($pauseBtn);
				$toptd3.append($playRecord);
				$toptr.append($toptd1);
				$toptr.append($toptd2);
				$toptr.append($toptd3);
				$toptable.append($toptr);

				var $pausescrean = $('<div class="pause-screen layer"></div>');
				var $screanbtn = $('<img class="screen-btn" src="img/resumeL.png">');
				$pausescrean.append($screanbtn);

				var $cells = $('<table class="cells layer">'),
					$clickables = $('<table class="clickables layer">');
				for (var i = 0; i < 9; i++) {
					var $tr = $('<tr>');
					for (var j = 0; j < 9; j++) {
						var id = i * 9 + j;
						var $td = $('<td></td>').data('id', id);
						$tr.append($td);
					}
					$cells.append($tr);
					$clickables.append($tr.clone(true, true));

				}

				var $blockBg = $('<table class="block-bg layer">'),
					$blockBorder = $('<table class="block-border layer">');
				for (var i = 0; i < 3; i++) {
					var $tr = $('<tr>');
					for (var j = 0; j < 3; j++) {
						var id = i * 3 + j;
						var $td = $('<td class="block-' + id + '"></td>').data('id', id);
						$tr.append($td);
					}
					$blockBg.append($tr);
					$blockBorder.append($tr.clone());
				}


				var $bottomline = $('<div class="menu menu-bottom"></div>');

				var $numpadscrean = $('<div class="numpad-screen"></div>');
				$bottomline.append($numpadscrean);


				var $bottomtable = $('<table class="numpad-table"></table>');
				var $bottomtr = $('<tr></tr>');
				for (var i = 1; i <= 9; i++) {
					var $btn = $('<button class="numpad numpad-' + i + '">' + i + '</button>').data('number', i);
					//if (i == 1) $btn.addClass('numpad-selected');
					var $bottomtd = $('<td></td>');
					$bottomtd.append($btn);
					$bottomtr.append($bottomtd);
				}
				$bottomtable.append($bottomtr);
				$bottomline.append($bottomtable);

				//var $funcline = $('<div class="func func-bottom"></div>');
				var $functable = $('<table class="functable"></table>');
				var $functr = $('<tr></tr>');
				var $functd1 = $('<td></td>');
				var $functd2 = $('<td></td>');
				var $functd3 = $('<td></td>');
				var $notebtn =$('<div class="funcbtn"></div>');
				var $noteimg =$('<img class="funcimg noteimg" src="img/noteoff.png">');
				var $notelv =$('<div class="notelv" >노트</div>');
				var $erasebtn =$('<div class="funcbtn"></div>');
				var $eraseimg =$('<img class="funcimg" src="img/erase.png">');
				var $eraselv =$('<div class="eraselv">지우기</div>');
				//var $undobtn =$('<button class="funcbtn undobtn">undo</button>');

				$notebtn.append($noteimg);
				$notebtn.append($notelv);
				$erasebtn.append($eraseimg);
				$erasebtn.append($eraselv);
				//$functd3.append($undob);

				$functd1.append($notebtn);
				$functd2.append($erasebtn);
				//$functd3.append($undobtn);

				$functr.append($functd1);
				$functr.append($functd2);
				//$functr.append($functd3);
				$functable.append($functr);
				$bottomline.append($functable);
				//$funcline.append($functable);
				//Assembly html
				//
				$this.append(
					$('<div class="menu menu-top">'))
					//.append($info)
					.append($toptable)
					.append($('<div class="table-container">')
					.append($blockBg)
					.append($cells)
					.append($blockBorder)
					.append($clickables)
					.append($overlay)
					.append($pausescrean)
					)
				$this.append($bottomline);


				// Define all actions
				//
				function renderGameTable() {
					$overlay.fadeOut();

					//Reset number pads
					$('.solved-number').removeClass('solved-number');

					//$cells = getCookie("cells");
					//console.log($cells);

					//Reset cells
					var num_clues = 0;
					$cells.find('.note').remove();
					$cells.find('td').removeClass().each(function (index) {

						//console.log(game.table.cells[index].value+"-"+game.table.cells[index].isClue);

						if (game.table.cells[index].isClue) {
							num_clues++;
							$(this).html(game.table.cells[index].value).addClass('clue number-' + game.table.cells[index].value);
						} else {
							game.table.cells[index].isUserInput = false;
							$(this).html('<span class="input"></div>');
						}
					});

					//$cells = getCookie("cells");

					//console.log(game.table.cells);
					//save_cookie("cells", game.table.cells , 1);
					//console.log(load_cookie("cells"));
					//$info.html(' ' + num_clues + ' clues ');
					//$info.append($('<span class="btn-link">restart</span>').click(function () { renderGameTable() }));

					//Reset record


					current_state = 1;
					game_end = false;
					$('.pause-btn').attr("src", "img/pause.png"); // pause btn set
					$('.new-popup').hide();
					$('.pause-screen').hide();  //screen hide
					$('.numpad-screen').hide(); //screen hide

 
					$playRecord.data('record', 0);
					clearInterval($playRecord.data('timer'));
					$playRecord.html(' 00:00:00 ');

					timer = function () {
						$playRecord.data('record', $playRecord.data('record') + 1);
						var record = $playRecord.data('record');
						var hour = parseInt(record / 3600);
						var min = parseInt((record / 60)) % 60;
						var sec = record % 60;
						if (hour < 10) hour = '0' + hour;
						if (min < 10) min = '0' + min;
						if (sec < 10) sec = '0' + sec;
						$playRecord.html(' ' + hour + ':' + min + ':' + sec + ' ');
					}
					$playRecord.data('timer', setInterval(timer, 1000));

					$('.number-' + playingNumber).addClass('active-number');
					for (var i = 1; i <= 9; i++) {
						if ($('.number-' + i).length == 9)
							$('.numpad-' + i + ', .number-' + i).addClass('solved-number');
					}

				}

				function pause(){
					$('.pause-btn').attr("src", "img/resume.png");
					$('.pause-screen').show();
					$('.numpad-screen').show();
					clearInterval($playRecord.data('timer'));
				}

				function resume(){
					$('.pause-btn').attr("src", "img/pause.png");
					$('.pause-screen').hide();
					$('.numpad-screen').hide();
					$playRecord.data('timer', setInterval(timer, 1000));

				}

				//for debugging, uncomment below and you can use this in console
				//window.renderGameTable = renderGameTable;

				function puzzleGenerator(l){

					$(this).removeClass('initial');
					playingLevel = l;
					if (l >= Sudoku.Difficulty.length) {
						console.time('Load sudoku 17');
						window._sudoku17 = window._sudoku17 || [];
						if (window._sudoku17.length > 0) {
							var i = Math.floor(Math.random() * window._sudoku17.length);
							var line = window._sudoku17[i];
							game.load(line);
							renderGameTable();
							//console.timeEnd('Load sudoku 17');
							return;
						}

						$.ajax('sudoku17.txt').then(function (lines) {
							window._sudoku17 = lines.split('\n');
							var i = Math.floor(Math.random() * window._sudoku17.length);
							var line = window._sudoku17[i];
							game.load(line);
							renderGameTable();
							//console.timeEnd('Load sudoku 17');
						})
						return;
					}
					//console.timeEnd('Generate sudoku');
					lvlabel(l);
					game.generate(l);
					renderGameTable();
					//console.timeEnd('Generate sudoku');

				}

				function titlePopupClose(){
					if($(".title-popup").css("display") != "none"){
						$(".title-popup").fadeOut(300);
					}
				}

				function lvlabel(l){
					var label = "";
					switch(l){
						case 0:
							label="초심자";
							break;
						case 1:
							label="쉬움";
							break;
						case 2:
							label="중간";
							break;
						case 3:
							label="어려움";
							break;
					}
					$(".lv-label").html('Lv.' + label );
				}

				$menubtn.click(function(){ 
					if($(".menu-popup").css("display") == "none"){
						//$(".menu-popup").show();
					    $(".menu-popup").fadeIn(300);
					} else {
					    $(".menu-popup").fadeOut(300);
					    //$(".menu-popup").hide();
					}
					//alert("NNN");
				});
				$(".beginner-btn").click(function(){
					//alert("B");
					puzzleGenerator(0);
					titlePopupClose();
				});
				$(".easy-btn").click(function(){ 
					//alert("E");
					puzzleGenerator(1);
					titlePopupClose();
				});
				$(".normal-btn").click(function(){ 
					//alert("N");
					puzzleGenerator(2);
					titlePopupClose();
				});
				$(".hard-btn").click(function(){ 
					//alert("H");
					puzzleGenerator(3);
					titlePopupClose();
				});
				$(".reset-btn").click(function(){ 
					renderGameTable();
				});
				$(".close-btn").click(function(){
					
				});

				$('.menu-popup').click(function(){ 
					$('.menu-popup').fadeOut(300);
				});


				$pauseBtn.click(function(){   //toggle
					//alert("ok");
					if(!game_end){
						if(current_state==1){
							pause();
						}else{
							resume();
						}

						current_state=current_state*-1;

					}
					
				});

				$screanbtn.click(function(){
					if(current_state!=1){
						resume();
					}

					current_state=1;
				});


				$notebtn.click(function () {
					//alert("note");
					if (noteMode == false) {
						$('body').toggleClass('in-ctrl');   //<- note mode
						$('.noteimg').attr('src',"img/noteon.png");   //<- note mode
						noteMode = true;
					} else {
						$('body').removeClass('in-ctrl');   //<- normal mode
						$('.noteimg').attr('src',"img/noteoff.png");   //<- note mode
						noteMode = false;
					}
				});

				$erasebtn.click(function () {

					if(current_cell==null){
						return;
					}

					current_the_cell.value = 0;
					current_cell.find('.input').html('');
					current_the_cell.isUserInput = false;


					current_cell.find('.note').remove();
					current_cell.removeClass();

					cellcheck();
					
					if(current_cell!=null){
						current_cell.addClass('select');
					}

				});


				$clickables.find('td').on('mousedown', function (e) {
					e.preventDefault();
					var id = $(this).data('id');
					var the_cell = game.table.cells[id];
					var $cell = $cells.find('td').eq(id);

					for (var i = 0; i < 81; i++) {
						var c = game.table.cells[i];
						var $c = $cells.find('td').eq(i);
						if (!c.isClue) {
							//var $c = $cells.find('td').eq(i);
							$c.removeClass('select');
						}

						$c.removeClass('active-number');  //yellow
					}

					//current_the_cell = the_cell;
					//current_cell = $cell;

					if(!the_cell.isClue){

						$cell.addClass('select');
					}

					//Ignore if the cell is a clue
					if (the_cell.isClue) {

						current_the_cell = null;
						current_cell = null;
						current_which = null;

						return false;
					}else{
						current_the_cell = the_cell;
						current_cell = $cell;
						current_which = e.which;
					}

					return false;
				}).on('contextmenu', function () { return false; })


				$bottomline.find('.numpad').on('click', function (e) {   // <- numnber pad
					//$('.numpad-selected').removeClass('numpad-selected');
					//$(this).addClass('numpad-selected');
					$('.active-number').removeClass('active-number');
					$('.number-' + $(this).data('number')).addClass('active-number');

					var Pnumber = $(this).data('number');

					
					if(current_cell!=null){

						//if (current_which == 3 || (e.which == 1 && current_the_cell.isUserInput)) {
							//current_cell.removeClass();
							//alert("a");
							//current_the_cell.isUserInput = false;
							//current_the_cell.value = 0;
							//current_cell.find('.input').html('');

						//Remove or put a note
						if ((current_which == 2 || (current_which == 1 && $('body').is('.in-ctrl')))) {
							if(current_the_cell.isUserInput){
								current_cell.removeClass();
								current_cell.addClass('select');

								current_the_cell.value = 0;
								current_cell.find('.input').html('');
								current_the_cell.isUserInput = false;
							}


							if (current_cell.find('.note-' + Pnumber).length == 0){
								//alert("note put");
								current_cell.append('<span class="note note-' + Pnumber + '">' + Pnumber + '</span>');
							}
							else{
								//alert("note remove");
								current_cell.find('.note-' + Pnumber).remove();
							}

						//Put Number
						} else if (current_which == 1) {

							//alert("put");

							current_cell.removeClass();
							current_cell.addClass('select');

							current_the_cell.value = 0;
							current_cell.find('.input').html('');

							current_the_cell.isUserInput = true;
							current_the_cell.value = Pnumber;

							if(current_cell.find('.note').length){
								current_cell.find('.note').remove();
							}

							
							if (current_the_cell.isError()) {
								//current_cell.addClass('error');
							} else {

								//Remove guesses
								
								var rel = current_the_cell.related;
								/*
								for (var i = 0; i < rel.length; i++) {
									$cells.find('td').eq(rel[i].id).find('.note-' + Pnumber).remove();
								}
								*/
								current_cell.find('.note').remove();

								current_cell.addClass('active-number solving number-' + Pnumber);
								if ($('.number-' + Pnumber).length == 9) {
									$('.numpad-' + Pnumber + ', .number-' + Pnumber).addClass('solved-number');
								}
								
							}
							
							current_cell.find('.input').html(Pnumber);
						}

					}


					cellcheck();

					if(current_cell!=null){
						current_cell.addClass('select');
					}

				});

				function cellcheck() {
					//Check errors and correct colors of cells
				
					for (var i = 0; i < 81; i++) {
						var c = game.table.cells[i];
						if (c.isUserInput) {
							var $c = $cells.find('td').eq(i);

							if (c.isError() && !$c.is('.error')) {
								$c.removeClass();
								$c.addClass('error');
							} else if (!c.isError() && $c.is('.error')) {
								$c.removeClass();
								var number = parseInt($c.find('.input').html());
								for (var i = 1; i <= 9; i++) {
									if (number == i)
										$c.addClass('active-number');
									$c.addClass('solving number-' + number);
								}
							}
						}
					}
					
				
					//Update number button's color
					
					for (var i = 1; i <= 9; i++) {
						if ($('.number-' + i).length == 9)
							$('.numpad-' + i + ', .number-' + i).addClass('solved-number');
						else
							$('.numpad-' + i + ', .number-' + i).removeClass('solved-number');
					}
					

					if ($('.numpad.solved-number').length == 9) {
						clearInterval($playRecord.data('timer'));
						$overlay.find('.record').html($playRecord.html());
						$overlay.find('.message').html('Congratulations!');
						$overlay.find('.record-level').html(level_label[playingLevel]);
						$overlay.fadeIn();

						$('.numpad-screen').show(); //numpad Shutter
						game_end = true; //game end
					}
				}/////cell check

				$(window).focus(function() {
				  //console.log("on");
				});

				$(window).blur(function() {
				  	//console.log("out");
				  	if(!game_end){
				  		pause();
				 	 	current_state=-1;
				    }
				});


/*
				$(window).on('keydown', function (e) {

					if(e.keyCode == 17){
						$('body').toggleClass('in-ctrl');
						$('.noteimg').attr('src',"img/noteon.png");   //<- note mode
						noteMode = true;
					}

				}).on('keyup', function (e) {
					if (e.keyCode == 17) { //To note(mark) a guessing number.
						$('body').toggleClass('in-ctrl');
						$('.noteimg').attr('src',"img/noteoff.png");   //<- note mode
						noteMode = false;
					}
				});
*/

				return $this;
			}
		})($, window, document);

		var game = new Sudoku();
		var $sudoku = $.Sudoku(game);
		$('#GameView').append($sudoku);
		$('#contents').toggle(!isEmbed(getUrlParams(location.search)));

		function getUrlParams(search) {
			return search.substr(1).split('&')
				.map(function (part) {
					return part.split('=')
				})
				.reduce(function (result, item) {
					if (item[0]) result[item[0]] = decodeURIComponent(item[1]);
					return result;
				}, {});
		}

		function isEmbed(urlParams) {
			return urlParams.hasOwnProperty('embed')
		}