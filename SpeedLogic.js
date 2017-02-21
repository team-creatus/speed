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
    console.dir(message);
  }
}

/**
 * マスターDTOを返却
 */
exports.getMasterDto = function() {
  return _master_dto;
}

/**
 * マスターDTOを設定
 */
exports.setMasterDto = function(roomId, speedDto) {
  module.exports.getMasterDto().set(roomId, speedDto);
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
  for (var i = 0; i < 26; i++) {
    cards[i] = i + 1;
  }
  return cards;
}

/**
 *  カードシャッフル
 *  @param cards カード
 */
function shuffle(cards) {

  var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

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

  // 排他チェック
  if (!checkExclusion(speedDto)) {
    // チェックエラーの場合speedDtoを返却して処理終了
    console.log('排他チェックエラー');
    return speedDto;
  }

  // 排他ロック
  speedDto = lockExclusion(speedDto);

  // 台札重ねられるかチェック
  // if (!checkPut(speedDto)) {

  //   console.log('checkPut error');
  //   // エラーの場合、speedDtoを返却して処理終了
  //   return getResultDto();
  // }

  // console.log('putMain 途中経過');
  // console.dir(speedDto);

  // カードを台札に重ねる
  // setMasterDto(putLeadCard(getMasterDto(roomId)));

  // 場札更新
  // if (updateFieldCard(speedDto)) {
  //   // trueが返却された場合どちらかの手札がなくなり処理終了
  //   return getResultDto(speedDto);
  // } else {
    // マスタdtoに設定
  //   module.exports.setMasterDto(speedDto.roomId, speedDto);
  // }

  // プレイヤ双方の台札設定可否
  // while (!checkGame(getMasterDto(roomId))) {
  //   // プレイヤ双方がカードを台札に置くことができない場合
  //   if (!updateLeadCard(getMasterDto)) {
  //     // ゲーム続行不可能の場合、ゲーム終了のメッセージを送信する
  //     return getResultDto(INFO_MSG_GAME_END, INFO_MSG_GAME_END);
  //   }
  // }

  // 排他ロックを解除
  speedDto = unLockExclusion(speedDto);

  // スピードDTOをマスターDTOに設定
  module.exports.setMasterDto(speedDto.roomId, speedDto);
  console.dir(module.exports.getMasterDto());

  // speedDtoを返却して処理終了
  // return getResultDto(MSG_CHANGE_FIELD_CARDS, MSG_CHANGE_FIELD_CARDS);

}

/**
 * put処理ステータスチェック
 * @param speedDto
 * @return true: 正常 / false: エラー
 */
function checkExclusion(speedDto) {

  // 重ね札位置にひもづく処理ステータスを判定
  if (speedDto.cardPosition === 1) {
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
  if (speedDto.cardPosition === 1) {
    speedDto.processStatus1 = 1;
    console.log('プレイヤ1の処理ステータスを1にする');
    console.log('プレイヤ1処理ステータス: ' + speedDto.processStatus1);
  } else {
    speedDto.processStatus2 = 1;
    console.log('プレイヤ2の処理ステータスを1にする');
    console.log('プレイヤ2処理ステータス: ' +  speedDto.processStatus2);
  }

  return speedDto;
}

/**
 * カードput可否判定処理
 * @param speedDto
 * @return true: 正常 / false: エラー
 */
function checkPut(speedDto) {

  // 重ね札位置にひもづく台札を判定
  if (speedDto.cardPosition === 1) {
    // 台札と重ね札の差の絶対値が1の場合または12の場合、正常
    if (Math.abs(speedDto.daiFuda1 - speedDto.submitCard) === 1 || Math.abs(speedDto.daiFuda1 - speedDto.submitCard) === 12) {
      return true;
    }
  } else {
    if (Math.abs(speedDto.daiFuda2 - speedDto.submitCard) || Math.abs(speedDto.daiFuda2 - speedDto.submitCard) === 12) {
      return true;
    }
  }
  return false;
}


/**
 * @param mes1 プレイヤー1メッセージ
 * @param mes2 プレイヤー2メッセージ
 * @return dto ユーザーに返却するDto
 */
function getResultDto(roomId, mes1, mes2) {
  var speedDto = _master_dto.get(roomId);
  dto.player1Message = mes1;
  dto.player2Message = mes2;
  return speedDto;
}

/**
 * 台札にカードを置く
 * @param speedDto
 */
function putLeadCard(speedDto) {

  // 重ね札位置にひもづく台札を判定
  if (speedDto.cardPosition === 1) {
    speedDto.daiFuda1 = speedDto.submitCard;
  } else {
    speedDto.daiFuda2 = speedDto.submitCard;
  }
}

/**
 * 場札の更新
 * プレイヤーの手札を場札に追加する
 * @param speedDto
 * @return true: ゲーム終了 / false: ゲーム未終了
 */
function updateFieldCard(speedDto) {

  // それぞれのプレイヤーの場札の枚数が4より小の場合
  while (speedDto.player1fieldCardList.length !== 4) {
    // プレイヤー1の手札が0の場合、ゲーム終了
    if (speedDto.player1cardList.length === 0) {
      return true;
    }
    // プレイヤー1の場札に手札を追加
    speedDto.player1fieldCardList.push(player1cardList[0]);
    // プレイヤー1の手札から追加した要素を削除
    speedDto.player1cardList.shift();
  }
  while (speedDto.player2fieldCardList.length !== 4) {
    // プレイヤー2の手札が0の場合、ゲーム終了
    if (speedDto.player2cardList.length === 0) {
      return true;
    }
    // プレイヤー2の場札に手札を追加
    speedDto.player2fieldCardList.push(player2cardList[0]);
    // プレイヤー2の手札から追加した要素を削除
    speedDto.player2cardList.shift();
  }
  // 処理終了時の双方の手札の枚数を判定
  return speedDto.player1cardList.length === 0 || speedDto.player2cardList.length === 0 ? false : true;
}

/**
 * プレイヤー双方が台札にカードを置ける状態を判定
 * @return true: ゲーム続行 / false: 台札更新が必要
 */
function checkGame(speedDto) {
  var p1len = player1fieldCardList.length;
  var p2len = player2fieldCardList.length;
  var state = false;
  for (var i = 0; i < p1len; i++) {
    if (Math.abs(daiFuda1 - player1fieldCardList[i]) === 1) {
      state = true;
    }
  }
  for (i = 0; i < p2len; i++) {
    if (Math.abs(daiFuda2 - player2fieldCardList[i]) === 1) {
      state = true;
    }
  }
  return state;
}

/**
 * プレイヤー１の手札を台札１に置く、プレイヤー２の手札を台札２に置く
 * @return true: 更新正常 / 更新異常（プレイヤー双方の手札が無くなった場合）
 */
function updateLeadCard() {

  // プレイヤー1の手札を台札1に置く
  speedDto.daiFuda1 = speedDto.player1cardList[0];
  // プレイヤー2の手札を台札2に置く
  speedDto.daiFuda2 = speedDto.player2cardList[0];
  // 台札に置いたカードを削除
  speedDto.player1cardList.shift();
  // 台札に置いたカードを削除
  speedDto.player2cardList.shift();
  // 両プレイヤーの手札がなくなった場合
  if (speedDto.player1cardList.length === 0 && speedDto.player2cardList.length === 0) {
    return false;
  }
  return true;
}

/**
 * 排他ロックを解除する
 * マスターDTOの台札番号に紐づく処理ステータスを未処理に更新する
 * @param speedDto
 */
function unLockExclusion(speedDto) {

  console.log('排他ロックを解除');
  console.log('実行前');
  console.log('プレイヤ1処理ステータス: ' + speedDto.processStatus1);
  console.log('プレイヤ2処理ステータス: ' + speedDto.processStatus2);

  if (speedDto.cardPosition === 1) {
    speedDto.processStatus1 = 0;
  } else {
    speedDto.processStatus2 = 0;
  }
  console.log('実行後');
  console.log('プレイヤ1処理ステータス: ' + speedDto.processStatus1);
  console.log('プレイヤ2処理ステータス: ' + speedDto.processStatus2);

  return speedDto;
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
  dto.daiFuda1 = selectRandomCard(dto.player1cardList, 1);
  dto.daiFuda2 = selectRandomCard(dto.player2cardList, 2);

  // 生成したspeedDtoをマスターDTOに設定
  _master_dto.set(roomId, dto);
  console.dir('#################### MASTER DTO ####################');
  console.dir(_master_dto);
  console.dir('#################### MASTER DTO ####################');
  return dto;
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

  if (user==1) {
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
