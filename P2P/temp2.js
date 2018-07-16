window.onload = function () {
    document.getElementById("connect").onclick = function () { clickConnect() };
    document.getElementById("join").onclick = function () { seeAvailablePeer() };
    
    
    var peerClient = undefined;
    var connectionChoice = undefined;
    
    
    // div info
    var info = this.document.getElementById("info");
    
    // name tag for all element of checkbox
    var form_peer_available_class = "peer";
    
    // form to append element of checkbox 
    var form_peer_available = document.getElementById("choice-peer");    
    
    // var response
    var res = document.getElementById("request_connection");
    
    // var form req res
    var formConnectionChoice = document.getElementById("connection_choice_form");
    
    // form that decide if woy want connect or not with peer
    var classItemForm = "accept-connection";
    
    var chatForm = document.getElementById("chat");
    
    // var see_chat_message = document.getElementById("seeChatMessage");
    
    
    var connectionChoice = undefined;
    
    var chat = new Chat();

    
    
    /**
     * Server get-request for generate the random String. When finish it call a callback that create a new Peer 
     */
    function clickConnect() {
        httpGetAsync("http://localhost:9000", createPeerClient);
    }
    
    /**
     * when click on the button i request all peer subscribed. When finisch it call a callback that display 
     * in a form all peer end exclude my personal peer 
     */
    function seeAvailablePeer() {
        httpGetAsync("http://localhost:9000/available-peer/", returnPeerAvailable);
    }
    
    // Callback when receive data
    function dataReceived(data) {
    
        if(peerClient.getConnectTo()==undefined){
            // TODO questo mi sa lo devo cancellare 
            var label = document.createElement('label');
            label.setAttribute("name", "request_connection_label");
            label.htmlFor = "Il peer " + data + " want to connect with you";
            label.appendChild(document.createTextNode("Il peer " + data + " want to connect with you")); 
            res.appendChild(label);
    
            var decideToConnect = ["YES", "NO"];
            for(var i = 0; i < decideToConnect.length; i++){
                addCheckBoxItem(formConnectionChoice, decideToConnect[i], classItemForm, connectionChoice, (value) => connectionChoice = value);
            }
            
    
            // add button to checkbox
            var buttonChoice = document.createElement("input");
            buttonChoice.setAttribute("type", "button");
            buttonChoice.setAttribute("class", "button");
            buttonChoice.setAttribute("name", classItemForm);       
            buttonChoice.setAttribute("value", "Choice Peer to Connect");
            buttonChoice.onclick = function () {
                if(connectionChoice==undefined){
                    alert("Select if you want to connect of peer " + data);
                }else if(connectionChoice=="YES"){
        
                    peerClient.setConnectTo(data);
                    
                    
                    chat.sendMessage(chatForm);
                    chat.onclickButton(sendChatMessage);
                    
                    
        
                    deleteCheckboxItem(classItemForm);

        
                }else if(connectionChoice == "NO"){

                    var conn = peerClient.conn(data);
                    peerClient.closeConnection(conn);

                    // TODO Cancellare il form               
                }
            };        
            formConnectionChoice.appendChild(buttonChoice);
        }else {
            
            
            chat.sendMessage(chatForm);
            chat.onclickButton(sendChatMessage);
            // console.log("MESSAGGIO RICEVUTO : " + data);
        }
    
        console.log("MESSAGGIO RICEVUTO : " + data);
    }
    
    
    // callback from onclick button message
    function sendChatMessage(message) {
        console.log("MESSAGGIO " + message + " AL PEER " + peerClient.getConnectTo());
        send(message,peerClient.getConnectTo());
    }
    
    function callbackCloseConnection(data){
        alert("Il peer " + data + " si è disconnesso");
    }
    
    /**
     * Callback after creation string by Server
     */ 
    function createPeerClient(data) {
        // console.log("STRINGA GENERATA: " + data); // DEBUG
        var input = document.getElementById("username-choice").value;
    
        // TODO cambiare i path 
        peerClient = new PeerClient(input + "-" + data, "localhost", 9000, "/peerjs");
    
        // open connection 
        peerClient.openConnection();
    
        // enable reception of data
        peerClient.enableReceptionData(dataReceived);

        // peerClient.seeError();
    
        // add username
        var user = document.createElement('label');
        user.setAttribute("name", "user");
        user.htmlFor = peerClient.getId();
        user.appendChild(document.createTextNode("USERNAME " + peerClient.getId()));
        info.appendChild(user);
    }
    
    
    
    
    
    // ==============================================================
    // function that require peer available 
    // ==============================================================
    function returnPeerAvailable(peer_a) {        
    
        // console.log("I peer a disposizione sono: " + peer_a); // DEBUG 
        var peer_available = JSON.parse(peer_a);        
    
    
        var ownPeer = peer_available.find(o => o.key === peerClient.getId());
    
        // remove from ARRAY the element selected
        for (var i = 0; i < peer_available.length; i++) {
            if (peer_available[i].key == ownPeer.key) {
                // delete peer_available[i]
                peer_available.splice(i, 1);
            }
        }
    
        if (peer_available.length > 0) {
            formPeerAvailable(form_peer_available, peer_available, form_peer_available_class, peerSelected);
        } else {
            alert("NO PEER AVAILABLE"); // TODO metterle per bene
        }
    
    }
    
    /**
     * This callback return the choise by user when select the peer to connect
     * @param {*} peerSelected 
     */
    function peerSelected(peerSelected){
        if (peerSelected === undefined) {
            alert("KEEP ATTENTION: NO PEER SELECTED");
        } else {
            peerClient.setConnectTo(peerSelected);
            send(peerClient.getId(),peerClient.getConnectTo()); 
        }
    }
    
    // SEND data between peer 
    function send(message, id_another_peer) {  
        var conn = peerClient.conn(id_another_peer); 
        // console.log(conn.peer);
        peerClient.sendData(conn, message);
        console.log("Il peer " + peerClient.getId() + " sta inviando al peer " + id_another_peer);
    }
    
    // ===================
    // GET REQUEST SERVER
    // ===================
    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
        console.log(xmlHttp.responseText)
    }
    
    };
    
    