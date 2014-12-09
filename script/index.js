INFOSession = function() {}
INFOSession.prototype = new SRCPSession("INFO")
COMMANDSession = function() {}
COMMANDSession.prototype = new SRCPSession("COMMAND")

INFOSession.prototype.info_handler = function(msg) {
  switch(msg.device_group) {
    case "DESCRIPTION":
      if(msg.status_code==100) {
        if(buses[msg.bus]===undefined) {
          buses[msg.bus]={ device_groups:{} }
        }
        bus = buses[msg.bus]

        msg.content.some(function(device_group) {
          if(bus.device_groups[device_group]===undefined) {
            bus.device_groups[device_group]={ devices:{} }
          }
        })
      }
      break
    case "GM":
      $("#generic_messages").append(msg.content[1]+"-->"+msg.content[0]+" ["+msg.content[2]+"]: "+msg.content.slice(3).join(" ")+"\n")
      break
    case "GA":
      if(msg.status_code==100) {
        if(msg.content[2]==0)//if value==0 TODO
          return
        bus = buses[msg.bus]
        if(bus===undefined)
          return
        device_group=bus.device_groups[msg.device_group]
        if(device_group===undefined)
          return
        
        device = device_group.devices[msg.content[0]]

        data = {
          addr:msg.content[0],
          port:msg.content[1]
        }
        
        device.data(data)
        updateDevice(device)
      }
      if(msg.status_code==101) {
        addGA({
          bus:msg.bus,
          addr:msg.content[0],
          prot:msg.content[1],
          name:"New Accessory",
          type:"turnout_right"
        })
      }
      break
    case "GL":
      if(msg.status_code==100) {
        bus = buses[msg.bus]
        if(bus===undefined)
          return
        device_group=bus.device_groups[msg.device_group]
        if(device_group===undefined)
          return
        
        device = device_group.devices[msg.content[0]]

        data = {
          addr:msg.content[0],
          drivemode:msg.content[1],
          v:msg.content[2],
          v_max:msg.content[3]
        }
        for(var i=1; i<msg.content.length-3; i++) {
          data["f"+i]=parseInt(msg.content[i+3])
        }

        device.data(data)
        updateDevice(device)
      }
      if(msg.status_code==101) {
        var _prot = msg.content[1]
        if(msg.content[2]!==undefined)
          _prot += " "+msg.content[2]
        addGL({
          bus:msg.bus,
          addr:msg.content[0],
          prot:_prot,
          name:"New Loco",
          type:"steam",
          v:0,
          v_max:100,
          drivemode:1
        })
      }
      break
    case "POWER":
      if(msg.status_code==100) {
        bus = buses[msg.bus]
        if(bus===undefined)
          return
        device_group=bus.device_groups[msg.device_group]
        if(device_group===undefined)
          return
        
        device = device_group.devices[undefined]//POWER has no address -> undefinded ;-)

        data = {
          onoff:msg.content[0]
        }
        
        device.data(data)
        updateDevice(device)
      }
      if(msg.status_code==101) {
        addPOWER({
          bus:msg.bus,
          onoff:"OFF"
        })
      }
      break
    default:
      console.log("INFO handler cant handle device_group: "+msg.device_group)
  }
}


var log_response = function(msg) {
  var _msg = ""
  _msg += "<span class='timestamp'>"+msg.timestamp+"</span> "
  _msg += "<span class='status'>" + msg.status_code + " " + msg.status_text + "</span> "
  if(msg.bus!==undefined)
    _msg += "<span class='bus'>"+msg.bus + "</span> "
  if(msg.device_group!==undefined)
    _msg += "<span class='device_group'>"+msg.device_group + "</span> "
  _msg += "<span class='content'>"+msg.content.join(" ")+"</span>"
_msg += "<br>"
  $("#log").append(_msg)
  $("#log_container").scrollTop($('#log').height())
}

var log_command = function(cmd) {
  var _cmd = ""
  _cmd += "<span class='action'>" + cmd.action + "</span> "
  if(cmd.bus!==undefined)
    _cmd += "<span class='bus'>"+cmd.bus + "</span> "
  if(cmd.device_group!==undefined)
    _cmd += "<span class='device_group'>"+cmd.device_group + "</span> "
  _cmd += "<span class='content'>"+cmd.command+"</span>"
  _cmd += "<br>"
  $("#log").append(_cmd)
  $("#log_container").scrollTop($('#log').height())
}

//INFOSession.prototype.log_msg = log_response
//INFOSession.prototype.log_cmd = log_command
COMMANDSession.prototype.log_msg = log_response
COMMANDSession.prototype.log_cmd = log_command

var open_event = function() {
  $("#server_settings").hide()
  $("#server_close_msg").text("")
}

var close_event = function(e) {
  $("#server_settings").show()
  if(e.type=="close")
    $("#server_close_msg").text("Connection closed!")
  else
    $("#server_close_msg").text("Error: "+e.type)
}

INFOSession.prototype.open_event = open_event
INFOSession.prototype.close_event = close_event
COMMANDSession.prototype.open_event = open_event
COMMANDSession.prototype.close_event = close_event

var info_session = new INFOSession()
var command_session = new COMMANDSession()

var open_sessions = function() {
  info_session.open($("#host").val(), $("#port").val())
  command_session.open($("#host").val(), $("#port").val())
}

$(function() {
  //open_sessions()//try with standard values
  $("#open_sessions").on("click", open_sessions)
})