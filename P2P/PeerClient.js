/**
 * Class that create a peer. The param are: 
 * @param {string} id the id of my peer
 * @param {string} host the path of server
 * @param {int} port the number of port
 * @param {path} pht the app name of the server. It is useful for establish the connection
 */
class PeerClient {   

    constructor(id, h, p, pth){
        this._id = id;
        this._host = h;
        this._port = p;
        this._path = pth;
        this._peerToConnect = undefined;
 
        this._peer = new Peer(this._id, {
            host: this._host, // 'localhost',
            port: this._port, //  9000,
            path: this._path // '/peerjs'
        });

    }

    /**
     * Return the id of my peer
     */
    getId() {
        return this._id;
    }

    

    /**
     * Return the peer connected with me
     */
    getConnectTo() {
        return this._peerToConnect;
    }

    
    /**
     * This metohd is used for setting the peer with i want connect. It used when I receive the request of 
     * connection by a specific peer. 
     * @param {peer} peerToConnect 
     */
    setConnectTo(peerToConnect){
        this._peerToConnect = peerToConnect;
    }

    
    /**
     * Make the peer avilable for the connection 
     */
    openConnection() {
        this._peer.on('open', function(id_peer) {
        // DEBUG  console.log('My peer ID is: ' + id_peer);
        });
    }

    
    /**
     * Closes the data connection gracefully, cleaning up underlying DataChannels and PeerConnections.
     * REF:https://stackoverflow.com/questions/25797345/peerjs-manually-close-the-connection-between-peers 
     * @param {object} conn i
     */
    closeConnection(conn) {
        conn.on('open', function(){            
            conn.close();
            alert("CONNESSIONE CHIUSA"); // TODO mettere un qualche messaggio
          });
    }
    
    /**
     * See the error of peer .     * .
     */
    seeError(){
        this._peer.on('error', function(err){
            alert(err.message);
        });
    }

    
    /**
     * This method is used for create a connection
     * @param {object} id_another_peer is the id of peer that I want to connect
     */
    conn(id_another_peer) {
        return this._peer.connect(id_another_peer);
    }

    

   
    /**
     * Sharing data among peer. The first param is the value that return from the previusly method (conn)
     * @param {object} conn     this is the connection
     * @param {object} data     this is the data to send
     */
    sendData(conn, data) {
        conn.on('open', function(){
            conn.send(data);
          });
    }
    
    /**
     * This method is used for receive data.
     * @param {method} callback return the data that arrived from sender
     */
    enableReceptionData(callback) {
        this._peer.on('connection', function(conn) {
            conn.on('data', function(data){
                callback(data);                
            });
        });
    }


}