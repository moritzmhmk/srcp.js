var _is_ios7 = function() {
    return  navigator.userAgent.match(/(iPod|iPhone|iPad);.*CPU.*OS 7_\d/i)
}

var resizePage = function() {
    var body = document.body, html = document.documentElement;
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
          html.clientHeight, html.scrollHeight, html.offsetHeight );
                   
    document.getElementById('pageOuter').style.height = height+'px';
    document.getElementById('pageMiddle').style.height = height+'px';
    height=height+1;
    document.getElementById('pageInner').style.height = height+'px';
}



$(function () {
    new Sortable(GL_container, {
        group: "devices",
        draggable: '.device',
        handle: '.drag'
    })

    new Sortable(GA_container, {
        group: "devices",
        draggable: '.device',
        handle: '.drag'
    })

    new Sortable(POWER_container, {
        group: "devices",
        draggable: '.device',
        handle: '.drag'
    })

    //iOS STUFF
    $(window).on("orientationchange", function() {
        if (window.orientation == 0 || window.orientation == 180)
            window.scrollTo(0, 0)
    })
    if (_is_ios7()) {
        $('#header').addClass('ios7')
        $('.container').addClass('ios7')
        
        $(window).resize(resizePage)
        resizePage()
    }

    //slider
    $('input[type="range"]').on("change",function() {
        var percent = $(this).val()/$(this).prop("max")
        var width=$(this).width()
        var pos = percent*(width-18)+9
        pos=Math.min(pos,width)
        color_left = $(this).data("color-left")
        color_left = color_left===undefined?"#007AFF":color_left
        color_right = $(this).data("color-right")
        color_right = color_right===undefined?"#B7B7B8":color_right
        $(this).css({
            backgroundImage:"linear-gradient(to right,"+
                            "rgba(1,1,1,0) 0px, "+color_left+" 0px,"+
                            color_left+" "+pos+"px, "+color_right+" "+pos+"px)"
        })
    }).change()

})