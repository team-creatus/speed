$(function() {
    /* 画像ファイルのプリロード */
    jQuery.preloadImage = function() {
      var i;
      for (i = 0; i < arguments.length; i++) {
        jQuery("<img>").attr("src", arguments[i]);
      }
    }

    $.preloadImage(
      "img/trump/gif/c01.gif",
      "img/trump/gif/c02.gif",
      "img/trump/gif/c03.gif",
      "img/trump/gif/c04.gif",
      "img/trump/gif/c05.gif",
      "img/trump/gif/c06.gif",
      "img/trump/gif/c07.gif",
      "img/trump/gif/c08.gif",
      "img/trump/gif/c09.gif",
      "img/trump/gif/c10.gif",
      "img/trump/gif/c11.gif",
      "img/trump/gif/c12.gif",
      "img/trump/gif/c13.gif",
      "img/trump/gif/d01.gif",
      "img/trump/gif/d02.gif",
      "img/trump/gif/d03.gif",
      "img/trump/gif/d04.gif",
      "img/trump/gif/d05.gif",
      "img/trump/gif/d06.gif",
      "img/trump/gif/d07.gif",
      "img/trump/gif/d08.gif",
      "img/trump/gif/d09.gif",
      "img/trump/gif/d10.gif",
      "img/trump/gif/d11.gif",
      "img/trump/gif/d12.gif",
      "img/trump/gif/d13.gif",
      "img/trump/gif/h01.gif",
      "img/trump/gif/h02.gif",
      "img/trump/gif/h03.gif",
      "img/trump/gif/h04.gif",
      "img/trump/gif/h05.gif",
      "img/trump/gif/h06.gif",
      "img/trump/gif/h07.gif",
      "img/trump/gif/h08.gif",
      "img/trump/gif/h09.gif",
      "img/trump/gif/h10.gif",
      "img/trump/gif/h11.gif",
      "img/trump/gif/h12.gif",
      "img/trump/gif/h13.gif",
      "img/trump/gif/s01.gif",
      "img/trump/gif/s02.gif",
      "img/trump/gif/s03.gif",
      "img/trump/gif/s04.gif",
      "img/trump/gif/s05.gif",
      "img/trump/gif/s06.gif",
      "img/trump/gif/s07.gif",
      "img/trump/gif/s08.gif",
      "img/trump/gif/s09.gif",
      "img/trump/gif/s10.gif",
      "img/trump/gif/s11.gif",
      "img/trump/gif/s12.gif",
      "img/trump/gif/s13.gif",
      "img/trump/gif/x01.gif",
      "img/trump/gif/x02.gif",
      "img/trump/gif/z01.gif",
      "img/trump/gif/z02.gif"
    );

    /**
     * ドロップ時の処理
     */
    var droppableEnable = () => {
      /* revert(ドラッグされた要素をもとの位置に戻す)*/
      var flg = true;
      $(".field").droppable({
          /* 要素が完全にドロップ領域に入らないと受け入れない */
          tolerance: "fit",
          /* ドロップ時に実行 */
          drop: function(e, ui) {

            /* ドラッグ要素のクラス(手札の位置)を取得 */
            var clazz = ui.draggable.attr("class");

            /* 取得したクラスを生成した手札のカードに付与 */
            $(".card-field").append($(getCard(clazz)));

            /* 不要なクラスを削除(ui-draggable-dragging => ドラッグ状態を表すクラス") */
            $(".card").removeClass("ui-draggable-dragging");

            /* 場札の子要素を削除(古いカードを削除) */
            $(".field").empty();

            /* 場札をドラッグしたカード画像に書き換える. */
            $(".field").append("<img src=\"" + $(ui.draggable).attr("src") + "\" class=\"droped\">");

            /* ドラッグした要素を削除 */
            $(ui.draggable).remove();

            /* ドロップが成立した場合 revertをfalseにして、元の位置に戻らないようにする。 */
            flg = false;

            /* 追加した要素(新しく手札に追加したカードにdraggableを適用 */
            draggableEnable();
          },
          /* ドロップが成立しなかった場合 */
          deactivate: function(e, ui) {
            ui.draggable.draggable({ revert: flg });
            /* revertをtrueにする。（ドラッグした要素を元の位置に戻す。） */
            flg = true;
          }
      });
    }

    /**
     * .cardを持つ要素にdraggableを適用させる。
     */
    var draggableEnable = () => {
      $(".card").draggable({
          /* ドラッグしている要素を最前面にする。 */
          stack: ".card",

          /* ドロップ領域にスナップさせる。 */
          snap: ".field",
          /* 内側にスナップ */
          snapMode: "inner",
          /* スナップする領域の範囲 値が大きいほど遠い位置からスナップする. */
          snapTolerance: 70,

          /* ドロップ可能領域ではない場合、元の位置に戻る */
          revert: true,

          /* 元の位置に戻る速度 ミリ秒 */
          revertDuration: 100,

          /* ドラッグ中に実行する */
          drag: function() {},
      });
    }

        /**
         * 初期処理
         */
        (function() {

            var createHand = (n) => {
              /* 手札の生成 */
              var cardNum = getCardCharacters() + getCardNumbers();
              return "<img src=\"img/trump/gif/"
              + cardNum +
              ".gif\" class=\"card card-" + (n + 1) + "\">";
            }

            const HAND = 4;
            for (var i = 0; i < HAND; i=(i+1)|0) {
              $(".card-field").append(createHand(i));
            }
            /* 生成した要素にdraggableを適用 */
            draggableEnable();
            /* ドロップ領域を使用可能にする。 */
            droppableEnable();
        })();

        /**
         * カードの画像ファイル名をランダムに返す。
         * @param 追加するクラス
         * @return カード画像のファイルパスを指定したimgタグ
         */
        function getCard(clazz) {
          var cardNum = getCardCharacters() + getCardNumbers();
          return "<img src=\"img/trump/gif/"
          + cardNum +
          ".gif\" class=\"" + clazz + "\">"
        }

        function getCardCharacters() {
          var y = Math.floor(Math.random() * 100 % 4),
              cardChar;
          console.log(y);
          switch (y) {
            case 0:
            return "c"
            break;
            case 1:
            return "d"
            break;
            case 2:
            return "h"
            break;
            case 3:
            return "s"
            break;
            default:
            alert("error");
            return null;
            break;
          }
        }

        function getCardNumbers() {
          var x = Math.floor(Math.random() * (13) + 1);
          return ("0" + x).slice(-2);
        }

    });
