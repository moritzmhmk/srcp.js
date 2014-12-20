$(function() {
	suggestions = {
		"command_input": ["GET","SET","CHECK","WAIT","INIT","TERM","RESET","VERIFY"],
		"bus_input": ["0"],
		"device_group_input": ["DESCRIPTION","FB","GA","GL","GM","LOCK","POWER","SERVER","SESSION","SM","TIME"],
		"content_input": [""]
	}

	suggest = function(text, candidates) {
		text = text.toUpperCase()
		var result = undefined
		for (var i = 0; i < candidates.length; i++) {
			if (candidates[i].indexOf(text) == 0) {
				if(result!==undefined) {
					return undefined
				} else {
					result = candidates[i]
				}
			}
		}
			return result
	}

	$(".cli_input").on("keydown", function(e) {
		var TABKEY = 9
		var ENTER = 13
		var RETURN = 10
		var LEFT = 37
		var BACKSPACE = 8
		var RIGHT = 39

		if(e.keyCode == RETURN || e.keyCode == ENTER) {
			cmd = {
					action:$("#command_input").val(),
					bus:$("#bus_input").val(),
					device_group:$("#device_group_input").val(),
					command:$("#content_input").val()
				}
				log_command(cmd)
			command_session.add_handler_to_queue(log_response)
				command_session.send(cmd)
		}

		if(e.keyCode == LEFT || e.keyCode==BACKSPACE) {
			if(this.selectionStart!==undefined&&this.selectionStart==0&&this.selectionEnd==0) {
				_$prev = $(this).prev()
				_$prev.focus()
				_$prev.val(_$prev.val())
				e.preventDefault()
			}
		}
		if(e.keyCode == RIGHT) {
			if(this.selectionStart!==undefined&&this.selectionStart==$(this).val().length) {
				_$next = $(this).next()
				_$next.focus()
				_$next[0].selectionStart=0
				_$next[0].selectionEnd=0
				e.preventDefault()
			}
		}
		if(e.keyCode == TABKEY) {
			var val = $(this).val()
			var val_after = ""
			if(this.selectionStart!==undefined) {
				val_after = val.substr(this.selectionStart)
				val=val.substr(0,this.selectionStart)
			}
			var words = val.split(" ")
			var last = words.pop()
			var _last = suggest(last, suggestions[$(this).attr('id')])

			console.log(last)

			var new_val = words.join(" ").trim()
			if(new_val!="") {
				new_val+=" "
			}
			if(_last===undefined) {
				new_val+=last.trim()
				e.preventDefault()
			} else {
				new_val+=_last.trim()
			}
			new_val+=val_after

			$(this).val(new_val)
		}
	})
	
	String.prototype.width = function(font) {
	  var f = font || '12px arial',
	      o = $('<div>' + this + '</div>')
	            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
	            .appendTo($('body')),
	      w = o.width();

	  o.remove();

	  return w;
	}

	var _autoresize = function() {
		var l = $(this).val().length
		var w = 0
		if(l<1) {
			l=$(this).attr('placeholder').length
			w = $(this).attr('placeholder').width($(this).css("font"))
		} else {
			w = $(this).val().width($(this).css("font"))
		}
			
		$(this).attr('size', l)
		$(this).css("width", w+15)
		
	}
	$(".autoresize_input").on("keyup change blur", _autoresize)
	$(".autoresize_input").each(_autoresize)
	
})