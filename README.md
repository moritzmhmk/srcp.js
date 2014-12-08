#srcp.js
web client for the srcp (Simple Railroad Command Protocol)

#About
**srcp.js** uses [websockify](https://github.com/kanaka/websockify) to send commands via web sockets to a srcp server.

The web interface is designed to work on a desktop computer as well as on a mobile device (tablet or smartphone).

It can even be added to the home screen on iOS (this will give it its own icon and make it use the entire screen without address bar etc.).

#Demo
[demo](http://cdn.rawgit.com/moritzmhmk/srcp.js/master/index.html)

#Usage
##Prerequisites
###1. SRCP-server
The srcp-server needs to be running on some device in your local network

*lets assume its running on 192.168.0.123:4303*

###2. websockify
Websockify can be running on the same or some other device in your local network with the following startup parameters 

```./run 0.0.0.0:4304 192.168.0.123:4303```

or

```./run 0.0.0.0:4304 localhost:4303```

if websockify is running on the same machine as the SRCP-Server



*lets assume websockify is running on 192.168.0.123:4304*

###3. srcp.js
You need to set the websocket-server to the address and port websockify is listening on (in our example *192.168.0.123:4304*)

##Adding devices
Devices that are initialized on the srcp server (sending a *101 INFO* message) will automatically be added to the web interface. 

...

**further documentation will be written in the near future**

#Credits
This project uses code from the following projects:

* [websockify](https://github.com/kanaka/websockify)
* [jquery](https://jquery.org/)
* [~~timruffles html5 dnd for iOS~~](https://github.com/timruffles/ios-html5-drag-drop-shim)
* [Sortable](https://github.com/RubaXa/Sortable)

*The licenses can be found in the individual files*

#License
All Code written by me* is licensed under "The MIT License" (see ./LICENSE)

All Images created by me* are licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/)

*All work for which it is not declared otherwise (see [Credits](#Credits) and comments in individual files) is created by me.

If there is a missing attribution please let me know and I will fix asap.
