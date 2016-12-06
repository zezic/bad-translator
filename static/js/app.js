var languages = [];

$(document).ready(function() {

  $.ajax({
    dataType: "json",
    url: "/api/languages",
    data: {},
    success: function(message) {
      languages = message;
    }
  });

  $("button").on("click", function() {
    var text_in = $("#in").val();
    var self = $(this);

    self.addClass("disabled");

    $.ajax({
      dataType: "json",
      url: "/api/translate",
      data: {"text": text_in},
      success: function(message) {
        $("#out").val(message.text);
        $(".chain").html();
        for (var idx in message.chain) {
          var code = message.chain[idx];
          var name = languages.filter(function(obj) {
            return obj.code == code;
          })[0].name;
          $(".chain").append($("<span class='piece' title='" + name + "'>" + message.chain[idx] + "</span>"));
        }
        self.removeClass("disabled");
      }
    });

    setTimeout(function() {
      self.removeClass("disabled");
    }, 3000);
  });

  $(".icon-lightbulb").on("click", function() {
    $("body").addClass("animation");
    $("body").toggleClass("theme-light");
    setTimeout(function() {
      $("body").removeClass("animation");
    }, 500);
    localStorage.setItem("theme-light", $("body").hasClass("theme-light"));
    Cookies.set('theme-light', $("body").hasClass("theme-light"));
  });

  $(".like").on("click", function() {
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

});
