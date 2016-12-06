$(document).ready(function() {

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
    var tr_id = self.data("id");

    $.ajax({
      dataType: "json",
      url: "/api/like/" + tr_id,
      method: "POST",
      data: {},
      success: function(message) {
        self.text(message.likes);
        if (message.and_you) {
          self.addClass("icon-heart");
          self.removeClass("icon-heart-empty");
        } else {
          self.addClass("icon-heart-empty");
          self.removeClass("icon-heart");
        }
        // $("#out").val(message.text);
        // self.removeClass("disabled");
      }
    });

  });

});
