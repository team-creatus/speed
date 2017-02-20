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

});
