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

$(function() {
       $(".delete_circle").on("click",function(e) {
              $device = $(this).closest(".device")
              $device.css({"left":-$(".delete").width()})
              $device.on("click", function(e) {
                     $device = $(this).closest(".device")
                     $device.css({"left":"0px"})
                     $device.off("click")
              })
              return false
       })
       $(".delete").on("click",function(e) {
              $device = $(this).closest(".device")
              $device.slideUp('fast', function(){ $(this).remove() })
       })
})
//switching between normal and edit mode
editMode=function() {
       $edit = $("#edit")
       if($edit.text()=="Edit") {
              $(".addDevice").show()
              
              $(".device").css("padding-left","40px")
              $(".delete_circle").show()
              $(".delete").show()
              $(".delete").css({"right":-$(".delete").width()})

              $(".device").css("padding-right","40px")
              $(".drag").show()

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

              $(".device").css({"left":"0px"})
              $(".device").css("padding-left","5px")
              $(".delete_circle").hide()
              $(".delete").hide()
              

              $(".device").css("padding-right","5px")
              $(".drag").hide()
              
              $(".edit").removeAttr('contenteditable').blur()

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
              console.log("[WARNING] device of type "+data.device_group+" with address "+data.addr+" already exists on bus "+data.bus)
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
              created.device.insertBefore( $( "#GL_container .addDevice" ) )
}

//adding new GA
var addGA = function(data) {
	data["device_group"]="GA"

       created = createDevice(data)
       if(created.new)
              created.device.insertBefore( $( "#GA_container .addDevice" ) )
}

//adding new POWER
var addPOWER = function(data) {
	data["device_group"]="POWER"

       created = createDevice(data)
       if(created.new)
              created.device.insertBefore( $( "#POWER_container .addDevice" ) )
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
              //console.log(_f,!_old)
              GL_changed($GL)
       })

       //device events for
       ////////////GA
       $(".GA .toggle").on("change", function(e) {
              $GA = $(this).closest(".GA")
              addr=$GA.data("addr")
              port=$GA.find(".toggle").prop('checked')?1:0
              $GA.data("port",port)

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
              onoff=$POWER.find(".toggle").prop('checked')?"ON":"OFF"
              $POWER.data("onoff",onoff)


              //console.log(onoff)
              if(command_session.session_id==-1)
                     return
              command_session.add_handler_to_queue(function(msg) {
                     console.log("Power changed: ",msg)
       })
              command_session.send({action:"SET", bus:bus, device_group:"POWER", command:onoff})
       })
})