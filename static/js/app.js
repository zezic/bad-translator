var languages = [];
var updates_socket;

function with_code(obj, code) {
  return obj.code == code;
}

function do_translation() {
  var text_in = $("#in").val();
  var button = $("button.translate");
  if (button.hasClass("disabled")) {
    return false;
  }
  button.addClass("disabled");

  $.ajax({
    dataType: "json",
    url: "/api/translate",
    data: {"text": text_in},
    success: function(message) {
      $("#out").val(message.text);
      $(".chain").html("");
      for (var idx in message.chain) {
        var code = message.chain[idx];
        var name = languages.filter(with_code(obj, code))[0].name;
        $(".chain").append($("<span class='piece'>" + message.chain[idx] + "<div class='tip'><span>" + name + "</span></div></span>"));
      }
      button.removeClass("disabled");
    }
  });

  setTimeout(function() {
    button.removeClass("disabled");
  }, 3000);
}

$(document).ready(function() {

  new Clipboard('.icon-docs');

  $('body').keydown(function (e) {
    if (e.ctrlKey && e.keyCode == 13) {
      do_translation();
    }
  });

  $(".translations").on("click", ".icon-docs", function() {
    var self = $(this);
    self.addClass("animate");
    setTimeout(function() {
      self.removeClass("animate");
    }, 500);
  });

  $.ajax({
    dataType: "json",
    url: "/api/languages",
    data: {},
    success: function(message) {
      languages = message;
    }
  });

  $("button.translate").on("click", do_translation);

  $(".icon-lightbulb").on("click", function() {
    $("body").addClass("animation");
    $("body").toggleClass("theme-light");
    setTimeout(function() {
      $("body").removeClass("animation");
    }, 500);
    localStorage.setItem("theme-light", $("body").hasClass("theme-light"));
    Cookies.set('theme-light', $("body").hasClass("theme-light"));
  });

  $(".translations").on("click", ".like", function() {
    var self = $(this);
    var like = $(this).find(".icon");
    var display = $(this).find(".display");
    var tr_id = self.data("id");

    $.ajax({
      dataType: "json",
      url: "/api/like/" + tr_id,
      method: "POST",
      data: {},
      success: function(message) {
        if (message.likes == 0) {
          display.text("");
        } else {
          display.text(message.likes);
        }
        if (message.and_you) {
          like.addClass("icon-heart");
          like.removeClass("icon-heart-empty");
        } else {
          like.addClass("icon-heart-empty");
          like.removeClass("icon-heart");
        }
        // $("#out").val(message.text);
        // self.removeClass("disabled");
      }
    });

  });

  updates_socket = io.connect('http://' + document.domain + ':' + location.port + "/updates");

  if ($(".tab.active").index() == 0) {
    updates_socket.on('translation', function(msg) {
      var row = $(".tr_source").clone().removeClass("tr_source hidden").addClass("shrinked");
      row.find(".in").text(msg.in);
      row.find(".out").text(msg.out);
      row.find("[data-id]").attr("data-id", msg.id);
      row.find("[data-clipboard-text]").attr("data-clipboard-text", msg.in + " --> " + msg.out);
      for (var idx in msg.chain) {
        var code = msg.chain[idx];
        row.find(".pieces").append($("<span class='piece'>" + code + "</div></span>"));
        row.find(".pieces").append(" ");
      }
      row.prependTo($(".translations"));
      row.slideDown();
    });
  }

  updates_socket.on('like', function(msg) {
    if ($(".like[data-id='" + msg.id + "']").length > 0) {
      var like = $(".like[data-id='" + msg.id + "']");
      if (msg.likes == 0) {
        like.find(".display").text("");
        like.find(".icon").addClass("icon-heart-empty");
        like.find(".icon").removeClass("icon-heart");
      } else {
        like.find(".display").text(msg.likes);
      }
    }
  });

});
