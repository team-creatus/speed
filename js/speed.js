"use strict";

function load() {
  var containerA = document.getElementById("container-a")
  var cardGame = document.getElementById("card-game");

  $("#login").click(function(event) {
    $.blockUI({message: "<h1><img src=\"img/loading.gif\" /></h1><br /><div align=\"center\"><h1 id=\"find-msg\">対戦相手を探しています</div></h1>" });
    $.ajax({
      url: "http://localhost:3000",
      type: "GET",
      success: function(data) {
        $.unblockUI();
        var flg = confirm("対戦相手が見つかりました。戦いますか。");
        if (flg) {
          removeLoading();
          tog(containerA);
          tog(cardGame);
          document.body.style.backgroundImage = "url(img/grass-pattern-set/grass01.jpg)";
        } else {
          event.stop();
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        $.unblockUI();
        alert("failed");
        console.log("XMLHttpRequest:" + XMLHttpRequest);
        console.log("textStatus:" + textStatus);
        console.log("errorThrow:" + errorThrown);
        event.preventDefault();
      },

      complete: function(data) {
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", load, false);

function tog(attr) {
  if (attr.style.display === "none") {        /* 要素が隠れていたら表示 */
    attr.style.display = "block";
  } else {                                    /* 要素が表示されていたら隠す */
    attr.style.display = "none";
  }
}

function dispLoading(msg) {
  var dispMsg = "";

  if (msg != "") {
    dispMsg = "<div class=\"loadingMsg\">" + msg + "</div>";
  }

  if ($("#loading").size() == 0) {
    $("body").append("<div align=\"center\" id=\"loading\">" + dispMsg + "</div>");
  }
}

function removeLoading() {
  $("#loading").remove();
}
