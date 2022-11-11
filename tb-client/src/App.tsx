import React, { useState, useEffect } from "react";
import { useInitializeSocket } from "./hooks/useInitializeSocket";
import { socket } from "./utils/socketConfig";

import AES from "crypto-js/aes";
import ENC_UTF_8 from "crypto-js/enc-utf8";
const secretKey = "mySecretKey";

function App() {
  const [lastPong, setLastPong] = useState<string>("");
  const [cleintId, setClientId] = useState(-1);
  const [data, setData] = useState({
    message: "",
    client: "",
  });

  const isSocketConnected = useInitializeSocket();

  useEffect(() => {
    socket.on("id", (d) => setClientId(d));

    socket.on("pong", (d) => {
      console.log("pong d", d);
      var bytes = AES.decrypt(d.message, secretKey);
      var decryptedMessage = JSON.parse(bytes.toString(ENC_UTF_8));
      setLastPong(
        JSON.stringify({
          ...d,
          message: decryptedMessage,
        })
      );
    });
  }, []);

  const sendPing = () => {
    if (data.client) {
      console.log("enter a correct client id");
    }
    socket.emit("ping", {
      ...data,
      message: AES.encrypt(JSON.stringify(data.message), secretKey).toString(),
      timestamp: new Date(),
    });
  };

  return (
    <div>
      <p>Client: {cleintId}</p>
      <p>Connected: {"" + isSocketConnected}</p>
      <p>Last pong: {lastPong || ":"}</p>
      <input
        placeholder="client"
        type="number"
        onChange={(e) => setData((d) => ({ ...d, client: e.target.value }))}
        value={data.client}
      />
      <br />
      <label>message</label>
      <br />
      <input
        placeholder="message"
        onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
        value={data.message}
      />
      <button onClick={sendPing}>Send ping</button>
    </div>
  );
}

export default App;
