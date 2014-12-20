$(function() {
  //tabbar
  $("body > .container").css("zIndex",0);
	$($("body > .container")[0]).css("zIndex",1);
	$(".tabbar:not(.nojs) > span").click(function() {
	  var buttons = $(".tabbar:not(.nojs) > span");
	  var i = buttons.index(this);
	  var containers = $("body > .container");

	  buttons.removeClass("active");
	  $(this).addClass("active");
	  containers.css("zIndex",0);
	  $(containers[i]).css("zIndex",1);
	})

  //tabs
  $(".tab_selector").on("click", function(e) {
    var $tab = $(e.target);
    $(this).children().removeClass("active");
    $tab.addClass("active");
    var i = $(this).children().index($tab);
    var $container = $(this).closest(".container");

    $container.hide();//fixes redrawing bug
    $container.children(".tab").hide();
    $($container.children(".tab").get(i)).show();
    $container.show();//fixes redrawing bug
  })
  $(".tab_selector > :first-child").click();

  //edit button
  $(".edit-button").click(function(e) {
    if($("body").hasClass("edit")) {
      $("body").removeClass("edit");
      $(".edit-button").text("Edit");
    } else {
      $("body").addClass("edit");
      $(".edit-button").text("Done");
    }
  })

  //deletable items
  $(".item.deletable").each(function(_, item) {
    $(item).prepend('<span class="delete">Delete</span>');
  })
	$(".delete").click(function() {
    var $parent = $(this).parent();
    if($parent.hasClass("pre-delete")) {
      $parent.trigger("item-deleted");
      $parent.remove();
      return false;
    }
    $parent.addClass("pre-delete");
    $parent.on("click", function() {
      this.off("click");
      $parent.removeClass("pre-delete");
    }.bind($parent));
    return false;
  })

  //draggable items
  $(".group.sortable .item").each(function(_, item) {
    $(item).append('<div class="drag">');
  })

  //mobile support
  $(window).on("orientationchange", function() {
    if (window.orientation == 0 || window.orientation == 180)
        window.scrollTo(0, 0)
  })
  var is_ios7 = navigator.userAgent.match(/(iPod|iPhone|iPad);.*CPU.*OS 7_\d/i);
  var is_ios8 = navigator.userAgent.match(/(iPod|iPhone|iPad);.*CPU.*OS 8_\d/i);
  if(is_ios7||is_ios8)
    $("body").addClass("iOS7")

})