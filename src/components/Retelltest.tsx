import axios from "axios";
import React, { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

function Retelltest() {
  const retellWebClient = new RetellWebClient();
  const [transcripts, setTranscripts] = useState([]);

  const start = async () => {
    try {
      const res = await axios.post(
        "https://danube.closerx.ai/api/ravan-ai-start/",
        {
          schema_name: "Danubeproperty",
          agent_code: 17,
          quick_campaign_id: "quickcamp1175ea81",
          phone: 99911293960,
          name: "Ravan",
          email: "ravan@gmail.com",
          country: "India",
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
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={() => start()}
      >
        Start
      </button>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-md"
        onClick={() => stop()}
      >
        Stop
      </button>
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded-md"
        onClick={() => pause()}
      >
        mute
      </button>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-md"
        onClick={() => resume()}
      >
        unmute
      </button>
    </div>
  );
}

export default Retelltest;
