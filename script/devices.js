var find_device_group = function(elem) {
       $device = elem.closest(".device")
       device_group=""
       if($device.attr("class").indexOf("GL")>0)
              device_group="GL"
       if($device.attr("class").indexOf("GA")>0)
              device_group="GA"
       if($device.attr("class").indexOf("POWER")>0)
              device_group="POWER"
       return device_group
}

//bus -> [ID] -> device_groups -> [DG] -> devices -> [ADDR] => $device
var buses = {}

var updateDevice = function($device) {
       data = $device.data()

       $device.find(".icon").attr("src","device_icons/"+data.device_group+"_"+data.type+".png")
       $device.find(".name").text(data.name)

       if(data.device_group=="GL") {
              $device.find(".prot").text(data.prot)
              $device.find(".addr").text(data.addr)

              $device.find(".speed").val(data.v)
              $device.find(".speed").prop("max",data.v_max)
              $device.find(".speed").trigger("update")

              if(data.drivemode==0) {
                     $device.find(".bwd").addClass("active")
                     $device.find(".fwd").removeClass("active")
                     $device.find(".stop").removeClass("active")
              }
              if(data.drivemode==1) {
                     $device.find(".bwd").removeClass("active")
                     $device.find(".fwd").addClass("active")
                     $device.find(".stop").removeClass("active")
              }
              if(data.drivemode==2) {
                     $device.find(".bwd").removeClass("active")
                     $device.find(".fwd").removeClass("active")
                     $device.find(".stop").addClass("active")
              }
              
              
              
              for(var i=1; i<=9; i++) {
                     state = data["f"+i]
                     if(state!==undefined&&state==1)
                            $device.find(".f"+i).css("color", "#000")
                     else
                            $device.find(".f"+i).css("color", "#ccc")
              }
       }
       if(data.device_group=="GA") {
              $device.find(".prot").text(data.prot)
              $device.find(".addr").text(data.addr)
              
              if(data.port==1)
                     $device.find(".toggle").prop('checked',true)
              else
                     $device.find(".toggle").removeAttr('checked')
       }
       if(data.device_group=="POWER") {
              $device.find(".bus").text(data.bus)
              if(data.onoff=="ON")
                     $device.find(".toggle").prop('checked',true)
              else
                     $device.find(".toggle").removeAttr('checked')
       }
}
var createDevice = function(data) {
       var $device = $("#prototypes ."+data.device_group).clone(true)
       $device.data(data)

       
       updateDevice($device)


       if(buses[data.bus]===undefined) {
              buses[data.bus]={ device_groups:{} }
       }
       bus = buses[data.bus]

       if(bus.device_groups[data.device_group]===undefined) {
              bus.device_groups[data.device_group]={ devices:{} }
       }
       devices = bus.device_groups[data.device_group].devices
       
       if(devices[data.addr]==undefined) {
              devices[data.addr]=$device
       
       } else {
              console.warn("device of type "+data.device_group+" with address "+data.addr+" already exists on bus "+data.bus)
              //TODO find better way?
              return {device:devices[data.addr], new:false}
       }
       
       return {device:$device, new:true}
}
//adding new GL
var addGL = function(data) {
       data["device_group"]="GL"

       created = createDevice(data)
       if(created.new)
              created.device.appendTo( $( "#GL_container .group" ) )
}

//adding new GA
var addGA = function(data) {
	data["device_group"]="GA"

       created = createDevice(data)
       if(created.new)
              created.device.appendTo( $( "#GA_container .group" ) )
}

//adding new POWER
var addPOWER = function(data) {
	data["device_group"]="POWER"

       created = createDevice(data)
       if(created.new)
              created.device.appendTo( $( "#POWER_container .group" ) )
}

var TERM = function(data) {
    if(data["device_group"] == "GL")
        cmd = data["addr"];
    else if(data["device_group"] == "GA")
        cmd = data["addr"];
    else if(data["device_group"] == "POWER")
        cmd = data["addr"];
    else
        return;

    if(command_session.session_id==-1)
        return;

    command_session.add_handler_to_queue(function(msg) {})
    command_session.send({action:"TERM", bus:data["bus"], device_group:data["device_group"], command:cmd})

    bus = buses[data.bus];
    devices = bus.device_groups[data.device_group].devices;
    devices[data.addr] = undefined;
}

$(function() {
    $(".device").on("item-deleted", function() {
        console.debug("delete event: ",this);
        TERM($(this).data());
    });

    $("#add_GL_button").click(function() {
        var bus = $("#add_GL_bus").val();
        var addr = $("#add_GL_addr").val();
        var prot = $("#add_GL_prot").val();
        var cmd = [addr, prot].join(" ");

        if(command_session.session_id==-1) {
            $("#add_device_msg").text("Error while adding Locomotive: No connection to server.");
            return;
        }

        command_session.add_handler_to_queue(function(msg) {
            $("#add_GL_button").removeClass("waiting");
            if(msg.status_code == "200")
                $("#add_device_msg").text("Successfully added Locomotive.");
            else
                $("#add_device_msg").text("Error while adding Locomotive: "+msg.raw);
        })
        $("#add_GL_button").addClass("waiting");
        command_session.send({action:"INIT", bus:bus, device_group:"GL", command:cmd})
    })
    $("#add_GA_button").click(function() {
        var bus = $("#add_GA_bus").val();
        var addr = $("#add_GA_addr").val();
        var prot = $("#add_GA_prot").val();
        var cmd = [addr, prot].join(" ");

        if(command_session.session_id==-1) {
            $("#add_device_msg").text("Error while adding Accessory: No connection to server.");
            return;
        }

        command_session.add_handler_to_queue(function(msg) {
            $("#add_GA_button").removeClass("waiting");
            if(msg.status_code == "200")
                $("#add_device_msg").text("Successfully added Accessory.");
            else
                $("#add_device_msg").text("Error while adding Accessory: "+msg.raw);
        })
        $("#add_GA_button").addClass("waiting");
        command_session.send({action:"INIT", bus:bus, device_group:"GA", command:cmd})
    })
    $("#add_POWER_button").click(function() {
        var bus = $("#add_POWER_bus").val();

        if(command_session.session_id==-1) {
            $("#add_device_msg").text("Error while adding Power: No connection to server.");
            return;
        }

        command_session.add_handler_to_queue(function(msg) {
            $("#add_POWER_button").removeClass("waiting");
            if(msg.status_code == "200")
                $("#add_device_msg").text("Successfully added Power.");
            else
                $("#add_device_msg").text("Error while adding Power: "+msg.raw);
        })
        $("#add_POWER_button").addClass("waiting");
        command_session.send({action:"INIT", bus:bus, device_group:"POWER", command:""})
    })

       //device events for
       ////////////GL
       GL_changed = function($GL) {
              bus=$GL.data("bus")
              addr=$GL.data("addr")
              drivemode=$GL.data("drivemode")
              v=$GL.data("v")
              vmax=$GL.data("vmax")

              $functions = $GL.find(".function")
              f = new Array($functions.length)
              $functions.each(function() {
                     _f = $(this).text().trim()
                     f[_f.substr(1)]=$GL.data(_f)?1:0
              })
              cmd = [addr, drivemode, v, vmax, f.join(" ").trim()].join(" ")
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.debug("GL changed: ",msg)
              })
              command_session.send({action:"SET", bus:bus, device_group:"GL", command:cmd})
       }

       $(".GL .bwd").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 0)
              $(this).addClass("active")
              $GL.find(".fwd").removeClass("active")
              $GL.find(".stop").removeClass("active")
              GL_changed($GL)
       })

       $(".GL .fwd").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 1)
              $(this).addClass("active")
              $GL.find(".bwd").removeClass("active")
              $GL.find(".stop").removeClass("active")
              GL_changed($GL)
       })

       $(".GL .stop").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 2)
              $GL.find(".fwd").removeClass("active")
              $GL.find(".bwd").removeClass("active")
              $GL.find(".stop").addClass("active")
              GL_changed($GL)
       })

       $(".GL .speed").on("change", function() {
              $GL = $(this).closest(".GL")
              
              clearTimeout($GL.data("_speed_change_timeout"))

              $GL.data("v", $(this).val())
              $GL.data("vmax", $(this).prop("max"))

              $GL.data("_speed_change_timeout",
                     setTimeout($.proxy(function() {
                            GL_changed(this)
                     },$GL),250)
              )

              
       })

       $(".GL .function").on("click", function() {
              $GL = $(this).closest(".GL")
              _f = $(this).text().trim()
              _old = $GL.data(_f)
              $GL.data(_f, !_old)
              if(!_old) {
                     $(this).css("color", "#000")
              } else {
                     $(this).css("color", "#ccc")
              }
              GL_changed($GL)
       })

       //device events for
       ////////////GA
       $(".GA .toggle").on("change", function(e) {
              $GA = $(this).closest(".GA")
              bus=$GA.data("bus")
              addr=$GA.data("addr")
              port=$GA.find(".toggle").prop('checked')?1:0
              $GA.data("port",port)

              cmd = [addr, port, 1, 200].join(" ")
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.debug("GA changed: ",msg)
              })
              command_session.send({action:"SET", bus:bus, device_group:"GA", command:cmd})
       })

       //device events for
       ////////////POWER
       $(".POWER .toggle").on("change", function(e) {
              $POWER = $(this).closest(".POWER")
              bus=$POWER.data("bus")
              onoff=$POWER.find(".toggle").prop('checked')?"ON":"OFF"
              $POWER.data("onoff",onoff)

              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.debug("Power changed: ",msg)
       })
              command_session.send({action:"SET", bus:bus, device_group:"POWER", command:onoff})
       })
})