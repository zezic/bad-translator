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
    $("body").toggleClass("theme-light");
    localStorage.setItem("theme-light", $("body").hasClass("theme-light"));
    Cookies.set('theme-light', $("body").hasClass("theme-light"));
  });

});
