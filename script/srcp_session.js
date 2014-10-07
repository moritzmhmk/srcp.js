var SRCPSession = function(type) {
	var self = this
	this.session = new Websock()
	this.session_id = -1
	this.session_type = type

	this.msg_handler_queue = []

	this.handshake_successful_handler_queue = []

	this.session.on('message', function() {
		console.log("MESSAGE EVENT for session "+self.session_id+" ("+self.session_type+")")
		var msg=""
		while(self.session.rQlen()) {
			var chr = self.session.rQshift8()
			if(chr==13)// CR (\r)
				continue
			if(chr==10) {// NL (\n)
	    		self.parse_msg(msg)
				msg=""
			}
			msg += String.fromCharCode(chr)
		}
	})
	this.session.on('open', function() {
	    console.log("OPEN EVENT for session "+self.session_id+" ("+self.session_type+")")
	    self.add_handler_to_queue(self.handshake_handler.bind(self))
	})
	this.session.on('close', function(e) {
		console.log("CLOSE EVENT for session "+self.session_id+" ("+self.session_type+")")
	    console.log(e)
	})
	this.session.on('error', function(e) {
		console.log("ERROR EVENT for session "+self.session_id+" ("+self.session_type+")")
	    console.log(e)
	})

	this.session.open("ws://localhost:4304")
}

SRCPSession.prototype.add_handler_to_queue = function(handler) {
	this.msg_handler_queue.push(handler)
}

SRCPSession.prototype.add_handshake_successful_handler_to_queue = function(handler) {
	this.handshake_successful_handler_queue.push(handler)
}

SRCPSession.prototype.send = function(cmd) {
	raw_cmd = cmd.action + " " + cmd.bus + " " + cmd.device_group + " " + cmd.command

	this.send_raw(raw_cmd)
}

SRCPSession.prototype.send_raw = function(raw_cmd) {
	this.session.send_string(raw_cmd+"\n")
}

SRCPSession.prototype.handshake_handler = function(msg) {
	msg.raw.split(";").some(function(sub_msg) {
		sub_msg = sub_msg.trim().split(" ")
		console.log(sub_msg)
		if( (sub_msg[0]=="SRCP" || sub_msg[0]=="SRCPOTHER") &&
			(sub_msg[1]=="0.8.3" || sub_msg[1]=="0.8.4" || sub_msg[1]=="0.8.5") )
		{
			this.add_handler_to_queue(this.handshake_handler.bind(this))//this.msg_handler_queue.push(this.handshake_handler)
	    	this.log_cmd({action:"SET", device_group:"CONNECTIONMODE", command:"SRCP "+this.session_type})
	    	this.send_raw("SET CONNECTIONMODE SRCP "+this.session_type)
	    	return true;
	    }
	}.bind(this))
    if(msg.status_code=="202") {
		this.add_handler_to_queue(this.handshake_handler.bind(this))//this.msg_handler_queue.push(this.handshake_handler)
    	this.send_raw("GO")
    }
    if(msg.status_code=="200") {
    	this.session_id = msg.content[1]//documentation is ambiguous - either "200 OK <ID>" or "200 OK GO <ID>"
    	console.log("Got Session ID: "+this.session_id,this)
    	
    	
		while(this.handshake_successful_handler_queue.length > 0) {
			handler = this.handshake_successful_handler_queue.shift()
			console.log(handler)
			handler(this.session_id)
		}
    }
}

SRCPSession.prototype.info_handler = function(msg) {
	console.log("session "+this.session_id+"("+this.session_type+") received INFO message:",msg.content)
}

SRCPSession.prototype.parse_msg = function(raw_msg) {
	var raw_msg = raw_msg.replace(/ +/g, " ")
	var msg_arr = raw_msg.split(" ")

	msg = {
		raw: raw_msg,
		timestamp:msg_arr[0],
		status_code:msg_arr[1],
		status_text:msg_arr[2],
		content:msg_arr.slice(3)
	}

	console.log("parsed msg for session "+this.session_id+"("+this.session_type+")",msg)

	if(msg.status_text=="INFO") {
		msg.bus = msg_arr[3]
		msg.device_group = msg_arr[4]
		msg.content = msg_arr.slice(5)
		this.info_handler(msg)
	}

	this.log_msg(msg)

	msg_handler = this.msg_handler_queue.shift()
	//console.log(msg_handler)
	//if(msg_handler !== undefined)
	//	msg_handler.call(this,msg)
	if(msg_handler !== undefined)
		msg_handler(msg)
}

SRCPSession.prototype.log_msg = function(msg) {

}

SRCPSession.prototype.log_cmd = function(cmd) {

}