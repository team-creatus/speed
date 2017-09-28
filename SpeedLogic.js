/**
 *  スピードアプリケーション ロジック
 */

//マスターDTO
var _master_dto = new Map();

var logging = true;

/** 台札入れ替えメッセージ */
var INFO_MSG_CHANGE_FIELD_CARDS = '台札の入れ替えをしました';
/** ゲーム終了メッセージ */
var INFO_MSG_GAME_END = 'ゲーム終了';

// 部屋IDリスト
var roomIdList = [];

function log(message) {
  if (logging) {
    console.log(message);
  }
}

/**
 * マスターDTOを返却
 */
var getMasterDto = function() {
  return _master_dto;
}

/**
 * マスターDTOを設定
 */
var setMasterDto = function(roomId, speedDto) {
  getMasterDto().set(roomId, speedDto);
}

// 部屋IDをランダムに生成
exports.createRoomId = function() {
  // 乱数を生成
  var roomId = Math.floor(Math.random() * 100);

  // 重複しないIDが生成されるまで繰り返し
  while (roomIdList.indexOf(roomId) != -1) {
    roomId = Math.floor(Math.random() * 100);
  }

  // 部屋IDリストに追加
  roomIdList.push(roomId);

  return roomId;
};

/**
 *  カード初期化
 */
function cardInit() {

  var cards = newCards();
  var shuffleCards = shuffle(cards);
  return shuffleCards;
}


/**
 *  カード生成
 */
function newCards() {
  var cards = [];
  //for (var i = 0; i < 26; i++) {
  for (var i = 0; i < 13; i++) {
    cards[i] = i + 1;
  }
  return cards;
}

/**
 *  カードシャッフル
 *  @param cards カード
 */
function shuffle(cards) {

  var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];

  var n = array.length, t, i;

  while (n) {
    i = Math.floor(Math.random() * n--);
    t = array[n];
    array[n] = array[i];
    array[i] = t;
  }

  var randomCards = [];

  for (i = 0; i < array.length; i++) {
    randomCards[i] = cards[array[i]];
    randomCards[i] = array[i];
  }

  //log(randomCards);
  return randomCards;
}

/**
 * putサービスメイン処理
 * @param speedDto
 * @return speedDto
 */
exports.putMain = function(speedDto) {

  speedDto.player1Message = '';
  speedDto.player2Message = '';

  // カード更新判定フラグ
  speedDto.checkGameResult = true;
  
  // 排他チェック
  if (!checkExclusion(speedDto)) {
    // チェックエラーの場合speedDtoを返却して処理終了
    return speedDto;
  }

  // 排他ロック
  lockExclusion(speedDto);

  // 台札重ねられるかチェック
  if (!checkPut(_master_dto.get(speedDto.roomId))) {

    console.log('台札エラー');
    // var result =  getResultDto(speedDto.roomId, "", "");
    // 排他ロックを解除
    unLockExclusion(_master_dto.get(speedDto.roomId));
    // エラーの場合、speedDtoを返却して処理終了
    // return result;
    return speedDto;
  }

  speedDto.player1Message = 'put!';
  speedDto.player2Message = 'put!';

  // カードを台札に重ねる
  putLeadCard(_master_dto.get(speedDto.roomId));

  // 場札更新
  if (updateFieldCard(_master_dto.get(speedDto.roomId))) {
    // trueが返却された場合どちらかの場札がなくなり処理終了
    return getResultDto(speedDto.roomId, INFO_MSG_GAME_END, INFO_MSG_GAME_END);
  }


  // プレイヤ双方の台札設定可否
  while (!checkGame(speedDto)) {
    // プレイヤ双方がカードを台札に置くことができない場合
	// カード更新判定フラグにfalseを設定
	speedDto.checkGameResult = false;
    if (!updateLeadCard(speedDto)) {
      // ゲーム続行不可能の場合、ゲーム終了のメッセージを送信する
      // 排他ロックを解除
      unLockExclusion(_master_dto.get(speedDto.roomId));
      // カード更新判定フラグにtrueを設定
      speedDto.checkGameResult = true;
      return getResultDto(speedDto.roomId, INFO_MSG_GAME_END, INFO_MSG_GAME_END);
    }
  }

  // 排他ロックを解除
  unLockExclusion(_master_dto.get(speedDto.roomId));

  // speedDtoを返却して処理終了
  return getResultDto(speedDto.roomId, '', '');
}

/**
 * put処理ステータスチェック
 * @param speedDto
 * @return true: 正常 / false: エラー
 */
function checkExclusion(speedDto) {

  // 重ね札位置にひもづく処理ステータスを判定
  if (speedDto.cardPosition === '1') {
    if (speedDto.processStatus1 === 1) {
      return false;
    }
  } else {
    if (speedDto.processStatus2 === 1) {
      return false;
    }
  }
  return true;
}

/**
 * put処理の排他ロック
 * @param speedDto
 */
function lockExclusion(speedDto) {

  // 重ね札位置にひもづく処理ステータスを処理中に更新
  if (speedDto.cardPosition === '1') {

    speedDto.processStatus1 = 1;
  } else {

    speedDto.processStatus2 = 1;
  }

  // ステータスを更新したdtoをマスターdtoに設定
  setMasterDto(speedDto.roomId, speedDto);
}

/**
 * カードput可否判定処理
 * @param speedDto
 * @return true: 正常 / false: エラー
 */
function checkPut(speedDto) {

  console.log('checkput');
  var submitCard = speedDto.submitCard > 13 ? speedDto.submitCard - 13 : speedDto.submitCard;
  var daiFuda1 = speedDto.daiFuda1[1] > 13 ? speedDto.daiFuda1[1] - 13 : speedDto.daiFuda1[1];
  var daiFuda2 = speedDto.daiFuda2[1] > 13 ? speedDto.daiFuda2[1] - 13 : speedDto.daiFuda2[1];
  var errorCode = '';

  // 重ね札位置にひもづく台札を判定
  if (speedDto.cardPosition === '1') {
    // 台札と重ね札の差の絶対値が1の場合または12の場合、正常
    if (Math.abs(daiFuda1 - submitCard) === 1 || Math.abs(daiFuda1 - submitCard) === 12) {

      return true;
    } else {

      // 処理結果コードにputエラーを設定
      this.player1ResultCode = 'put_error';
    }
  } else {

    if (Math.abs(daiFuda2 - submitCard) === 1 || Math.abs(daiFuda2 - submitCard) === 12) {

      return true;
    } else {

      // 処理結果コードにputエラーを設定
      this.player2ResultCode = 'put_error';
    }
  }
  return false;
}


/**
 * @param mes1 プレイヤー1メッセージ
 * @param mes2 プレイヤー2メッセージ
 * @return dto ユーザーに返却するDto
 */
var getResultDto = function(roomId, mes1, mes2) {
  var speedDto = _master_dto.get(roomId);
  return speedDto;
}

/**
 * 台札にカードを置く
 * @param speedDto
 */
function putLeadCard(speedDto) {

  // 重ね札位置にひもづく台札を判定
  if (speedDto.cardPosition === '1') {

    speedDto.daiFuda1 = [speedDto.playerNo, [speedDto.submitCard]];
  } else {

    speedDto.daiFuda2 = [speedDto.playerNo, [speedDto.submitCard]];
  }
  // マスターDTO更新
  setMasterDto(speedDto.roomId, speedDto);
}

/**
 * 場札の更新
 * プレイヤーの手札を場札に追加する
 * @param speedDto
 * @return true: ゲーム終了 / false: ゲーム未終了
 */
function updateFieldCard(speedDto) {

  var submitCard = speedDto.submitCard;
  if (speedDto.playerNo === 1) {

    for (var i = 0; i < speedDto.player1fieldCardList.length; i++) {
      // 置いたカードと同じ場札を削除
      if (speedDto.player1fieldCardList[i][0] === submitCard) {

        // 手札がない場合、put処理に成功した場札を削除
        if (speedDto.player1cardList.length === 0) {
          speedDto.player1fieldCardList[i] = [0];

          // 場札の枚数を数える
          var ownFieldCard = 0;
          for (var i = 0; i < speedDto.player1fieldCardList.length; i++) {
            if (speedDto.player1fieldCardList[i][0] !== 0) {
              ownFieldCard++;
            }
          }

          console.log('ownfieldcard:' + ownFieldCard);

          // 場札の枚数が0になった場合、処理を終了
          if (ownFieldCard === 0) {
            // プレイヤー1メッセージ
            speedDto.player1Message = "あなたの勝ち";
            // プレイヤー2メッセージ
            speedDto.player2Message = "あなたの負け";
            return true;
          }
          break;
        }

        // 削除するカードを手札の先頭のカードで上書きする
        speedDto.player1fieldCardList[i][0] = speedDto.player1cardList[0];
        // 追加した手札を削除
        speedDto.player1cardList.shift();
        break;
      }
    }

  } else {

    for (var i = 0; i < speedDto.player2fieldCardList.length; i++) {
      // 置いたカードと同じ場札を削除
      if (speedDto.player2fieldCardList[i][0] === submitCard) {

        // 手札がない場合、put処理に成功した場札を削除
        if (speedDto.player2cardList.length === 0) {
          speedDto.player2fieldCardList[i] = [0];

          // 場札の枚数を数える
          var oppFieldCard = 0;
          for (var i = 0; i < speedDto.player2fieldCardList.length; i++) {
            if (speedDto.player2fieldCardList[i][0] !== 0) {
              oppFieldCard++;
            }
          }

          console.log('oppfieldcard:' + oppFieldCard);

          // 場札の枚数が0になった場合、処理を終了
          if (oppFieldCard === 0) {
            // プレイヤー1メッセージ
            speedDto.player1Message = "あなたの負け";
            // プレイヤー2メッセージ
            speedDto.player2Message = "あなたの勝ち";
            return true;
          }
          break;
        }

        // 削除するカードを手札の先頭のカードで上書きする
        speedDto.player2fieldCardList[i][0] = speedDto.player2cardList[0];
        // 追加した手札を削除
        speedDto.player2cardList.shift();
        break;
      }
    }
  }

  // 結果をマスタDTOに設定
  setMasterDto(speedDto.roomId, speedDto);
  return false;
}

/**
 * プレイヤー双方が台札にカードを置ける状態を判定
 * @return true: ゲーム続行 / false: 台札更新が必要
 */
function checkGame(speedDto) {

  console.log('checkgame');
  var daifuda1 = speedDto.daiFuda1[1];
  var daifuda2 = speedDto.daiFuda2[1];

  if (daifuda1 > 13) {
	  daifuda1 = daifuda1 - 13;
  }
  if (daifuda2 > 13) {
	  daifuda2 = daifuda2 - 13;
  }

  var checkCard;

  for (var i = 0; i < 4; i++) {

	checkCard = speedDto.player1fieldCardList[i];
	if (speedDto.player1fieldCardList[i][0] === 0) {
		continue;
	}

	if (checkCard > 13) {
		checkCard = checkCard - 13;
	}

	if(Math.abs(daifuda1 - checkCard) === 1 ||
		Math.abs(daifuda1 - checkCard) === 12 ||
		Math.abs(daifuda2 - checkCard) === 1 ||
		Math.abs(daifuda2 - checkCard) === 12){
		return true;
	}
  }

  for (var i = 0; i < 4; i++) {

		checkCard = speedDto.player2fieldCardList[i];
		if (speedDto.player2fieldCardList[i][0] === 0) {
			continue;
		}

		if (checkCard > 13) {
			checkCard = checkCard - 13;
		}

		if(Math.abs(daifuda1 - checkCard) === 1 ||
			Math.abs(daifuda1 - checkCard) === 12 ||
			Math.abs(daifuda2 - checkCard) === 1 ||
			Math.abs(daifuda2 - checkCard) === 12){
			return true;
		}
  }

  speedDto.player1Message = 'カードが置けないため台札を更新';
  speedDto.player2Message = 'カードが置けないため台札を更新';
  return false;
}

/**
 * プレイヤー１の手札を台札１に置く、プレイヤー２の手札を台札２に置く
 * @return true: 更新正常 / 更新異常（プレイヤー双方の手札が無くなった場合）
 */
function updateLeadCard(speedDto) {

  /**
   *  カードの枚数を数える
   *  @param 手札
   *  @return 手札の枚数
   */
  var countCard = function(fieldCardList) {
    var cardCount = 0;
    for (var i = 0; i < fieldCardList.length; i++) {
      if (fieldCardList[i][0] !== 0) {
        cardCount++;
      }
    }
    return cardCount;
  }


  // プレイヤー1の手札の枚数が0ではない場合
  if (speedDto.player1cardList.length !== 0) {
    // プレイヤー1の手札を台札1に置く
    speedDto.daiFuda1 = ['1', [speedDto.player1cardList[0]]];
    // 台札に置いたカードを削除
    speedDto.player1cardList.shift();

  // プレイヤー1の手札の枚数が0の場合かつプレイヤー1の場札の枚数が0ではない場合
  } else if (countCard(speedDto.player1fieldCardList) !== 0) {
    // 場札の中から[0]以外の値を走査
    for (var i = 0; i < speedDto.player1fieldCardList.length; i++) {
      if (speedDto.player1fieldCardList[i][0] !== 0) {
        speedDto.daiFuda1 = ['1', [speedDto.player1fieldCardList[i]]];
        // 台札に置いたカードを削除
        speedDto.player1fieldCardList[i] = [0];
        break;
      }
    }
  }


  // プレイヤー2の手札の枚数が0ではない場合
  if (speedDto.player2cardList.length !== 0) {
    // プレイヤー2の手札を台札2に置く
    speedDto.daiFuda2 = ['2', [speedDto.player2cardList[0]]];
    // 台札に置いたカードを削除
    speedDto.player2cardList.shift();

  // プレイヤー2の手札の枚数が0の場合かつプレイヤー2の場札の枚数が0ではない場合
  } else if (countCard(speedDto.player2fieldCardList) !== 0) {
    // 場札の中から[0]以外の値を走査
    for (var i = 0; i < speedDto.player2fieldCardList.length; i++) {
      if (speedDto.player2fieldCardList[i][0] !== 0) {
        speedDto.daiFuda2 = ['2', [speedDto.player2fieldCardList[i]]];
        // 台札に置いたカードを削除
        speedDto.player2fieldCardList[i] = [0];
        break;
      }
    }
  }


  // 両プレイヤーの場札がなくなった場合
  if (countCard(speedDto.player1fieldCardList) === 0
    && countCard(speedDto.player2fieldCardList) === 0) {
    // プレイヤー1メッセージ
    speedDto.player1Message = "引き分け";
    // プレイヤー2メッセージ
    speedDto.player2Message = "引き分け";
    // マスターDTOに設定
    setMasterDto(speedDto.roomId, speedDto);

    return false;

  } else if (countCard(speedDto.player1fieldCardList) === 0) {
  // プレイヤー1の場札がなくなった場合
    // プレイヤー1メッセージ
    speedDto.player1Message = "あなたの勝ち";
    // プレイヤー2メッセージ
    speedDto.player2Message = "あなたの負け";
    // マスターDTOに設定
    setMasterDto(speedDto.roomId, speedDto);

    return false;

  } else if (countCard(speedDto.player2fieldCardList) === 0) {
  // プレイヤー2の場札がなくなった場合
    // プレイヤー1メッセージ
    speedDto.player1Message = "あなたの負け";
    // プレイヤー2メッセージ
    speedDto.player2Message = "あなたの勝ち";
    // マスターDTOに設定
    setMasterDto(speedDto.roomId, speedDto);

    return false;
  }

  // マスターDTOに設定
  setMasterDto(speedDto.roomId, speedDto);
  return true;
}

/**
 * 排他ロックを解除する
 * マスターDTOの台札番号に紐づく処理ステータスを未処理に更新する
 * @param speedDto
 */
function unLockExclusion(speedDto) {

  if (speedDto.cardPosition === '1') {
    speedDto.processStatus1 = '';
  } else {
    speedDto.processStatus2 = '';
  }

  // マスターdtoを設定
  setMasterDto(speedDto.roomId, speedDto);
}

/**
 * Dto生成処理
 * @param roomId 部屋ID
 * @param nameList ユーザ名リスト
 */
exports.createSpeedDto = function(roomId,nameList) {

  var dto = new speedDto();

  // 部屋IDを設定
  dto.roomId = roomId;

  // プレイヤー名を設定
  dto.player1Name = nameList[0];
  dto.player2Name = nameList[1];

  // 台札にカードが置ける状態になるまでループ
  while (true) {

    // カードリストを生成
    for(var i = 0; i < 2; i ++) {
      var name = nameList[i];
      var cardList = cardInit();

      // プレイヤー1,2にカードを設定
      if (i === 0) {
        dto.player1cardList = cardList;
      } else {
        dto.player2cardList = cardList;
      }
    }

    // プレイヤー1,2の場札を選定
    dto.player1fieldCardList = createFieldCardList(dto.player1cardList, 1);
    dto.player2fieldCardList = createFieldCardList(dto.player2cardList, 2);

    // 台札1,2の選定
    dto.daiFuda1 = ['1', selectRandomCard(dto.player1cardList, 1)];
    dto.daiFuda2 = ['2', selectRandomCard(dto.player2cardList, 2)];

    // 生成したspeedDtoをマスターDTOに設定
    _master_dto.set(roomId, dto);
    console.log('#################### MASTER DTO ####################');
    console.log(dto);
    console.log('#################### MASTER DTO ####################');

    // 台札にカードが置けるかをチェック
    if (checkGame(dto)) {
      console.log('checkGame:true');
      return dto;
    }

    console.log('checkGame:false');
    speedDto.player1Message = '';
    speedDto.player2Message = '';
  }
};

/*
 *
 * 場札選択処理
 *
 */
function createFieldCardList(cardList, user) {
  var fieldCardList = [];
  if (user === 1) {
    fieldCardList[0] = cardList.slice(21,22);
    cardList.splice(21,1);
    fieldCardList[1] = cardList.slice(3,4);
    cardList.splice(3,1);
    fieldCardList[2] = cardList.slice(19,20);
    cardList.splice(19,1);
    fieldCardList[3] = cardList.slice(10,11);
    cardList.splice(10,1);
  } else {
    fieldCardList[0] = cardList.slice(13,14);
    cardList.splice(13,1);
    fieldCardList[1] = cardList.slice(2,3);
    cardList.splice(2,1);
    fieldCardList[2] = cardList.slice(14,15);
    cardList.splice(14,1);
    fieldCardList[3] = cardList.slice(5,6);
    cardList.splice(5,1);
  }

  log("場札");
  log(fieldCardList);
  return fieldCardList;
}

/**
 * カードリストのランダム選定処理
 */
function selectRandomCard(cardList, user) {

  var selectCard = "";

  if (user === 1) {
    // カードリストから一枚選定
    selectCard = cardList.slice(15,16);
    cardList.splice(15,1);

  } else{
    // カードリストから一枚選定
    selectCard = cardList.slice(4,5);
    cardList.splice(4,1);
  }


  log("台札");
  log(selectCard);
  return selectCard;
}

/**
 * スリープ処理
 */
exports.sleep = function(time) {
  var time1 = new Date().getTime();
  var time2 = new Date().getTime();

  while ((time2 -  time1) < time) {
    time2 = new Date().getTime();
  }
};

/**
 * 共通Dto
 */
function speedDto() {

  // 部屋ID
  this.roomId = "";

  // プレイヤー1手札
  this.player1cardList = [];

  // プレイヤー2手札
  this.player2cardList = [];

  // プレイヤー1場札
  this.player1fieldCardList = [];

  // プレイヤー2場札
  this.player2fieldCardList = [];

  // プレイヤーNo
  this.playerNo = "";

  // プレイヤー1名前
  this.player1Name = "";

  // プレイヤー2名前
  this.player2Name = "";

  // 台札1
  this.daiFuda1 = "";

  // 台札2
  this.daiFuda2 = "";

  // 重ね札
  this.submitCard = "";

  // 重ね札位置
  this.cardPosition = "";

  // 処理ステータス1
  this.processStatus1 = "";

  // 処理ステータス2
  this.processStatus2 = "";

  // プレイヤー1処理コード
  this.player1ResultCode = "";

  // プレイヤー2処理コード
  this.player2ResultCode = "";

  // プレイヤー1メッセージ
  this.player1Message = "";

  // プレイヤー2メッセージ
  this.player2Message = "";
}
