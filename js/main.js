	var game = new Sudoku();

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

				//game data
				var gametable_ = new Array();

				var level_label = ['beginners', 'easy', 'normal', 'hard'];
				//var generate_label = function () { return 'Start ' + level_label[generatingLevel] };


				//var $this = $(".sudoku");

				var $menubtn =$(".menu-btn");
				var $overlay = $(".overlay");
				var $playRecord = $(".play-record");
				var $pauseBtn = $(".pause-btn");


				var $pausescrean = $(".pause-screen");
				var $screanbtn = $(".screen-btn");


				var $notebtn =$(".notebtn");
				var $erasebtn =$(".erasebtn");

				var $bottomline = $(".menu menu-bottom");


				// Build html structure first
				var $cells = $(".cells");
				var	$clickables = $(".clickables");
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

				var $blockBg = $(".block-bg");
				var	$blockBorder = $(".block-border ");
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


					//console.log(game.table.cells);
					//console.log(load_cookie("gametable"));
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

				function saveInitGame(){
					localStorage.removeItem('sudk_table');    //퍼즐 테이블정보
					localStorage.removeItem('sudk_cells');    //게임 테이블정보
					//localStorage.removeItem('clickables', $clickables.html());
					//localStorage.removeItem('blockBg', $blockBg.html());
					//localStorage.removeItem('blockBorder', $blockBorder.html());
					localStorage.removeItem('sudk_info');  //게임정보 시간, 레벨
				}


				function saveGameData(){
					gametable_ = [];
					for (var i = 0; i < 81; i++) {
						var data = new Object();
				        data.value = game.table.cells[i].value;
				        data.isClue = game.table.cells[i].isClue;
				        //data.isUserInput = game.table.cells[i].isUserInput;
				        gametable_.push(data);
			    	}
					var gametableData = JSON.stringify(gametable_);


					var info = new Object();
					info.time = parseInt($playRecord.data('record'));
					info.lv = playingLevel;
					var infoData = JSON.stringify(info);

					localStorage.setItem('sudk_table', gametableData);    //퍼즐 테이블정보
					localStorage.setItem('sudk_cells', $cells.html());    //게임 테이블정보
					//localStorage.setItem('clickables', $clickables.html());
					//localStorage.setItem('blockBg', $blockBg.html());
					//localStorage.setItem('blockBorder', $blockBorder.html());
		
					localStorage.setItem('sudk_info', infoData);  //게임정보 시간, 레벨

				}


				function loadGameData() {
					$overlay.fadeOut();

					//Reset number pads
					$('.solved-number').removeClass('solved-number');

					gametables_ = JSON.parse(localStorage.getItem('sudk_table'));
					var infoData = JSON.parse(localStorage.getItem('sudk_info'));

					//$gametables = Cookies.get("gametable");
					//console.log("load: "+gametables);

					playingLevel = infoData.lv;  //레벨
					record_ = infoData.time;    //시간


					cells = localStorage.getItem('sudk_cells');
					//clickables =localStorage.getItem('clickables');
					//blockBg =localStorage.getItem('blockBg');
					//blockBorder =localStorage.getItem('blockBorder');


					//Reset cells
					var num_clues = 0;

					$cells.find('.note').remove();
					$cells.html("");
					$cells.html(cells);  //게임테이블 로드


					lvlabel(playingLevel);

					
					$cells.find('td').each(function (index) {
						game.table.cells[index].value = gametables_[index].value;
						game.table.cells[index].isClue = gametables_[index].isClue;
						//game.table.cells[index].isUserInput = gametables_[index].isUserInput;
						
						if (game.table.cells[index].isClue) {
							num_clues++;
							$(this).html(game.table.cells[index].value).addClass('clue number-' + game.table.cells[index].value);
						} else {
							if($(this).find('.input').html()==''){  //값이 없다면 입력
								game.table.cells[index].isUserInput = false;
								console.log(gametables_[index].value);
							}else{
								game.table.cells[index].isUserInput = true;
							}

							$(this).removeClass('select');

						}

					});
					


					current_state = 1;
					game_end = false;
					$('.pause-btn').attr("src", "img/pause.png"); // pause btn set
					$('.new-popup').hide();
					$('.pause-screen').hide();  //screen hide
					$('.numpad-screen').hide(); //screen hide

 
					$playRecord.data('record', record_);
					clearInterval($playRecord.data('timer'));
					//$playRecord.html(' 00:00:00 ');

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

					$cells.find('td.select').removeClass('select');

					$('.pause-btn').attr("src", "img/resume.png");
					$('.pause-screen').show();
					$('.numpad-screen').show();

					

					/*
					for (var i = 0; i < 81; i++) {
						var $c = $cells.find('td').eq(i);
						if($c.find('td.select')){
							$c.removeClass('select');
							console.log(i);
						}
					}
					*/

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
					/*
					if($(".title-popup").css("display") != "none"){
						$(".title-popup").fadeOut(300);
					}
					*/
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
					saveInitGame();
					puzzleGenerator(0);
					titlePopupClose();
				});
				$(".easy-btn").click(function(){ 
					//alert("E");
					saveInitGame();
					puzzleGenerator(1);
					titlePopupClose();
				});
				$(".normal-btn").click(function(){ 
					//alert("N");
					saveInitGame();
					puzzleGenerator(2);
					titlePopupClose();
				});
				$(".hard-btn").click(function(){ 
					//alert("H");
					saveInitGame();
					puzzleGenerator(3);
					titlePopupClose();
				});
				$(".reset-btn").click(function(){ 
					saveInitGame();
					renderGameTable();
				});
				$(".close-btn").click(function(){
					
				});

				$('.menu-popup').click(function(){ 
					$('.menu-popup').fadeOut(300);
				});

				/*
				$(".save").click(function(){
					saveGameData();
				});

				$(".load").click(function(){
					//alert("load");
					loadGameData();
				});
				*/


				
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
					saveGameData();
					
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


				//$bottomline.find('.numpad').on('click', function (e) {   // <- numnber pad
				$('.numpad').on('click', function (e) {   // <- numnber pad
					
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


					//cellcheck();
					saveGameData();
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
					

					//game end
					if ($('.numpad.solved-number').length == 9) {
						clearInterval($playRecord.data('timer'));
						$overlay.find('.record').html($playRecord.html());
						$overlay.find('.message').html('Congratulations!');
						$overlay.find('.record-level').html(level_label[playingLevel]);
						$overlay.fadeIn();

						$('.numpad-screen').show(); //numpad Shutter
						game_end = true; //game end
						saveInitGame(); //gameSave reset
						return;
					}
				}/////cell check

				$(window).focus(function() {

				  	console.log("resume");
				  	if(!game_end){
				  		resume();
				  		current_state= 1;
					}
				});

				$(window).blur(function() {
				  	console.log("pause");
				  	if(!game_end){
				  		pause();
				  		//saveGameData();  //게임저장
				 	 	current_state= -1;
				    }
				});



				//start
				if(localStorage.getItem('sudk_info')!=null){
					//alert("load");

					loadGameData();
					titlePopupClose();
				}else{
					//alert("new");
					saveInitGame();
					puzzleGenerator(0);
					titlePopupClose();
				}


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
