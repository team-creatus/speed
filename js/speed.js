'use strict';

jQuery(function($) {
  var containerA = document.getElementById('container-a')
  var cardGame = document.getElementById('card-game');

  $("#login").click(function() {
    $.blockUI({message: '<h1><img src="img/loading.gif" /></h1><br /><div align="center"><h1 id="find-msg">対戦相手を探しています</div></h1>' });
    //dispLoading('対戦相手を探しています。');
    //   tog(containerA);
    //   tog(cardGame);
    //   document.body.style.backgroundImage = 'url(img/grass-pattern-set/grass01.jpg)';
    $.ajax({
      url: 'http://localhost:3000',
      type: 'GET',
      //dataType: 'script',
      success: function(data) {
        $.unblockUI();
        var flg = confirm('対戦相手が見つかりました。戦いますか。');
        if (flg) {
          removeLoading();
        }
          tog(containerA);
          tog(cardGame);
          document.body.style.backgroundImage = 'url(img/grass-pattern-set/grass01.jpg)';
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        alert('failed');
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
      },
      complete: function(data) {
        // hiding loading image
      }
    });
  });
});

function tog(attr) {
  if (attr.style.display === 'none') {        /* 要素が隠れていたら表示 */
    attr.style.display = 'block';
  } else {                                    /* 要素が表示されていたら隠す */
    attr.style.display = 'none';
  }
}

// show loadin img
function dispLoading(msg) {
  var dispMsg = '';

  if (msg != '') {
    dispMsg = '<div class="loadingMsg">' + msg + '</div>';
  }

  if ($('#loading').size() == 0) {
    $('body').append('<div align="center" id="loading">' + dispMsg + '</div>');
  }
}

function removeLoading() {
  $('#loading').remove();
}

function load() {
  var login = document.getElementById('login');
  var containerA = document.getElementById('container-a')
  var cardGame = document.getElementById('card-game');
  var searchUser = document.getElementById('search-user');
  // var fixed = document.getElementById('fixed');
  // fixed.addEventListener('click', function() {
  //   tog(containerA);
  //   tog(cardGame);
  //   document.body.style.backgroundImage = 'url(img/grass-pattern-set/grass01.jpg)';
  // }, false);
  //login.addEventListener('click', function() {
  //tog(containerA);
  //}, false);

  function tog(attr) {
    if (attr.style.display === 'none') {        /* 要素が隠れていたら表示 */
      attr.style.display = 'block';
    } else {                                    /* 要素が表示されていたら隠す */
      attr.style.display = 'none';
    }
  }
}

document.addEventListener("DOMContentLoaded", load, false);
