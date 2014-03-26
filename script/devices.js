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

//fix for jquery with html5 drag n drop
jQuery.event.props.push( "dataTransfer" )

var drag_and_drop_placeholder_height=30
var drag_and_drop_dropped = false
//switching between normal and edit mode
editMode=function() {
       $edit = $("#edit")
       if($edit.text()=="Edit") {
              $(".addDevice").show()


              //$(".device").not(".addDevice").prop("draggable",true)
              $(".drag").show()
              $(".device").css("padding-left","10%")
              $(".drag").on("dragstart", function(e) {
                     drag_and_drop_dropped=false
                     $device = $(this).closest(".device")
                     e.dataTransfer.setData("text/plain", JSON.stringify($device.data()))
                     $device.css("opacity",0.5)
                     drag_and_drop_placeholder_height=$device.outerHeight()

                     e.dataTransfer.setDragImage($device.get( 0 ),0, drag_and_drop_placeholder_height/2);

                     $(".device").children().not($(this)).css("pointer-events","none")
              })

              $(".device").on("dragenter", function(e) {
                     $(this).css("border-top",drag_and_drop_placeholder_height+"px solid #bbb")
              })

              $(".device").on("dragleave", function(e) {
                     $(this).css("border-top","0px")
              })

              $(".device").on("dragover", function(e) {
                     e.preventDefault()
                     e.dataTransfer.dropEffect = 'move'
              })

              $(".device").on("dragend", function(e) {
                     $(".device").children().css("pointer-events","auto")
                     $(".device").css("border-top","0px")

                     $(this).css("opacity",1.0)
                     if(drag_and_drop_dropped)//if(e.dataTransfer.dropEffect=="move")
                            $(this).remove()
                     console.log("dragend",e)
              })

              $(".device").on("drop", function(e) {
                     drag_and_drop_dropped=true
                     e.preventDefault()
                     $(".device").children().css("pointer-events","auto")
                     $(".device").css("border-top","0px")

                     $device = $(this).closest(".device")
                     //console.log("device", $device)

                     data = JSON.parse(e.dataTransfer.getData("text/plain"))
                     //console.log("data", data)

                     $draged_device = createDevice(data)
                     //console.log("draged_device", $draged_device)

                     $draged_device.insertBefore($device)
                     //console.log("drop",e)
              })


              $(".edit").prop('contenteditable',true)

              //$("input.edit").removeAttr("readonly")
              $(".device .icon").on("click", function(e) {
                     $this = $(this)
                     type = prompt("device type")
                     device_group = find_device_group($this)
                     $this.prop("src","images/device_icons/"+device_group+"_"+type+".png")
              })
              $edit.text("Done")
       } else {
              $(".addDevice").hide()

              //$(".device").removeAttr("draggable")
              $(".drag").hide()
              $(".device").css("padding-left","0")

              $(".drag").off("dragstart")
              $(".device").off("dragenter")
              $(".device").off("dragleave")
              $(".device").off("dragover")
              $(".device").off("dragend")
              $(".device").off("drop")

              $(".edit").removeAttr('contenteditable').blur()

              //$("input.edit").prop("readonly",true)
              $(".device .icon").off("click")
              $edit.text("Edit")
       }
}

//bus -> [ID] -> device_groups -> [DG] -> devices -> [ADDR] => $device
var buses = {}

var updateDevice = function($device) {
       data = $device.data()

       $device.find(".icon").attr("src","images/device_icons/"+data.device_group+"_"+data.type+".png")
       $device.find(".name").text(data.name)

       if(data.device_group=="GL") {
              $device.find(".prot").text(data.prot)
              $device.find(".addr").text(data.addr)

              $device.find(".speed").val(data.v)
              $device.find(".speed").prop("max",data.v_max)

              if(data.drivemode==0) {
                     $device.find(".bwd").css("color","#000")
                     $device.find(".fwd").css("color", "#ccc")
              } else {
                     $device.find(".bwd").css("color","#ccc")
                     $device.find(".fwd").css("color", "#000")
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
              //TODO set toggle state
              if(data.port==1)
                     $device.find(".toggle").prop('checked',true)
              else
                     $device.find(".toggle").removeAttr('checked')
       }
       if(data.device_group=="POWER") {
              $device.find(".bus").text(data.bus)
              //TODO set toggle state
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
       
       if(devices[data.addr]!==undefined) {
              console.log("[WARNING] device of type "+data.device_group+" with address "+data.addr+" already exists on bus "+data.bus)
              //TODO
       }
       devices[data.addr]=$device


       return $device
}
//adding new GL
var addGL = function(data) {
       data["device_group"]="GL"
	$GL = createDevice(data)

	$GL.insertBefore( $( "#GL_container .addDevice" ) )
}

//adding new GA
var addGA = function(data) {
	data["device_group"]="GA"
       $GA = createDevice(data)

	$GA.insertBefore( $( "#GA_container .addDevice" ) )
}

//adding new POWER
var addPOWER = function(data) {
	data["device_group"]="POWER"
       $POWER = createDevice(data)

	$POWER.insertBefore( $( "#POWER_container .addDevice" ) )
}



$(function() {
       //showing container via navbar (on small screens - e.g. mobile phones)
       var showContainer=function() {
              $this = $(this).closest("span")
              name = $this.data("name")
              

              $this.parent().children("span").each(function() {
                     $_this = $(this)
                     _name = $_this.data("name")
                     $_img = $_this.children("img")
                     $_img.attr("src","images/"+_name+".png")
              })

              $img = $this.children("img")
              $img.attr("src","images/"+name+"_active.png")

              $(".container").hide()
              $("#"+name+"_container").show()
       }

       $("#navbar span").on("click", showContainer)

       //add device button events
       $addGL = $("#GL_container .addDevice .add")
       $addGL.on("click", function() {
              addGL({
                     addr:"addr",
                     prot:"prot",
                     name:"Name",
                     type:"steam",
                     v:0,
                     v_max:100
              })
       })
       $addGA = $("#GA_container .addDevice .add")
       $addGA.on("click", function() {
              addGA({
                     addr:"addr",
                     prot:"prot",
                     name:"Name",
                     type:"turnout_right"
              })
       })
       $addPOWER = $("#POWER_container .addDevice .add")
       $addPOWER.on("click", function() {
              addPOWER({
                     bus:"bus",
                     name:"Name"
              })
       })

       //device events for
       ////////////GL
       GL_changed = function($GL) {
              addr=$GL.data("addr")
              drivemode=$GL.data("drivemode")
              v=$GL.data("v")
              vmax=$GL.data("vmax")

              $functions = $GL.find(".function")
              f = new Array($functions.length)
              $functions.each(function() {
                     _f = $(this).text()
                     f[_f.substr(1)]=$GL.data(_f)?1:0
              })
              console.log(f)
              cmd = [addr, drivemode, v, vmax, f.join(" ").trim()].join(" ")
              console.log(cmd)
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.log("GL changed: ",msg)
              })
              command_session.send({action:"SET", bus:1, device_group:"GL", command:cmd})
       }

       $(".GL .bwd").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 0)
              $(this).css("color","#000")
              $GL.find(".fwd").css("color", "#ccc")
              GL_changed($GL)
       })

       $(".GL .fwd").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 1)
              $(this).css("color","#000")
              $GL.find(".bwd").css("color", "#ccc")
              GL_changed($GL)
       })

       $(".GL .stop").on("click", function() {
              $GL = $(this).closest(".GL")
              $GL.data("drivemode", 2)
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
              _f = $(this).text()
              _old = $GL.data(_f)
              $GL.data(_f, !_old)
              if(!_old) {
                     $(this).css("color", "#000")
              } else {
                     $(this).css("color", "#ccc")
              }
              //console.log(_f,!_old)
              GL_changed($GL)
       })

       //device events for
       ////////////GA
       $(".GA .toggle").on("change", function(e) {
              $GA = $(this).closest(".GA")
              addr=$GA.data("addr")
              port=$GA.find(".toggle").prop('checked')?1:0

              cmd = [addr, port, 1, 200].join(" ")
              console.log(cmd)
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.log("GA changed: ",msg)
       })
              command_session.send({action:"SET", bus:1, device_group:"GA", command:cmd})
       })

       //device events for
       ////////////POWER
       $(".POWER .toggle").on("change", function(e) {
              $POWER = $(this).closest(".POWER")
              bus=$POWER.data("bus")
              cmd=$POWER.find(".toggle").prop('checked')?"ON":"OFF"

              console.log(cmd)
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.log("Power changed: ",msg)
       })
              command_session.send({action:"SET", bus:bus, device_group:"POWER", command:cmd})
       })
})