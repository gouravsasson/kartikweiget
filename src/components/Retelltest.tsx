import axios from "axios";
import React, { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

function Retelltest() {
  const retellWebClient = new RetellWebClient();
  const [transcripts, setTranscripts] = useState([]);

  const start = async () => {
    try {
      const res = await axios.post(
        "https://danube.closerx.ai/api/create-web-call/",
        {
          schema_name: "Danubeproperty",
          agent_code: 17,
          quick_campaign_id: "quickcamp1175ea81",
          phone: 99911293960,
          name: "Ravan",
          email: "ravan@gmail.com",
        }
      );

      const accessToken = res.data.response.access_token;
      const newCallId = res.data.response.call_id;

      retellWebClient.startCall({
        accessToken: accessToken,
      });
    } catch (err) {
      console.error("Form error:", err);
    }
  };

  const stop = () => {
    retellWebClient.stopCall();
  };

  const pause = () => {
    retellWebClient.mute();
  };

  const resume = () => {
    retellWebClient.unmute();
  };

  retellWebClient.on("update", (update) => {
    console.log(update);
  });
  return (
    <div>
      <button onClick={() => start()}>Start</button>
      <button onClick={() => stop()}>Stop</button>
      <button onClick={() => pause()}>mute</button>
      <button onClick={() => resume()}>unmute</button>
    </div>
  );
}

export default Retelltest;
