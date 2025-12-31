import React, { useState, useEffect, useRef, useMemo } from "react";
import EventEmitter from "eventemitter3";
import {
  Mic,
  Send,
  X,
  Minimize2,
  Phone,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  RoomAudioRenderer,
  useConnectionState,
  useRoomContext,
  useIsMuted,
  useTracks,
  TrackReference,
} from "@livekit/components-react";
import {
  DataPacket_Kind,
  RemoteParticipant,
  RoomEvent,
  Track,
} from "livekit-client";
import axios from "axios";
import CountryCode from "./CountryCode";
import CryptoJS from "crypto-js";

// Header Component




// Main Component
const RetellaiAgent = () => {
  const decoder = new TextDecoder();
  const containerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const room = useRoomContext();
  const status = useConnectionState(room);
  const serverUrl = "wss://abcd-sw47y5hk.livekit.cloud";
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const [muted, setMuted] = useState(false);
  const [transcripts, setTranscripts] = useState("");
  
  
  const baseUrl = "http://localhost:8000/api/create-room/";

 


  const transcriptEmitter = new EventEmitter();

  // Original LiveKit Room event listener
  room.on(
    RoomEvent.DataReceived,
    (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      // Decode and parse the payload
      let decodedData = decoder.decode(payload);
      let event = JSON.parse(decodedData);

      // Emit a custom event with EventEmitter3
      transcriptEmitter.emit("dataReceived", event, participant, kind, topic);
    }
  );

  // Listen for the custom 'dataReceived' event with EventEmitter3
  transcriptEmitter.on("dataReceived", (event, participant, kind, topic) => {
    if (event.event_type === "update") {
      const alltrans = event.transcript;
      let Trans = "";

      for (let index = 0; index < alltrans.length; index++) {
        const currentTranscript = alltrans[index];
        Trans = currentTranscript.content;

        if (currentTranscript) {
          setTranscripts(Trans); // Update state with the latest transcript
        }
      }
    }
  });

  useEffect(() => {
    return () => {
      transcriptEmitter.removeAllListeners("dataReceived");
    };
  }, []);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setMuted(true);
      } else if (document.visibilityState === "visible") {
        setMuted(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // for first time
  const toggleExpand = async () => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );
    setExpanded(true);
    if (
      !expanded &&
      status === "disconnected" &&
      priorCallIdList.length === 0
    ) {
      handleCountryCode;
      localStorage.setItem("formshow", "true");
    } else if (muted) {
      setMuted(false);
    }
  };

  const handleMicClick = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsGlowing(true);
    setTimeout(() => {
      setSpeech("Hi there! How can I assist you today?");
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsGlowing(false);
  };

  const handleClose = async () => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );

    const data =
      priorCallIdList.length > 0
        ? {
            schema_name: "Danubeproperty",
            prior_call_ids: priorCallIdList,
          }
        : {
            prior_call_ids: [],
            schema_name: "Danubeproperty",
          };
    setExpanded(false);

    const endcall = await axios.post(
      "https://danubenew.closerx.ai/api/ravan-ai-end/",
      data
    );

    if (endcall.status === 200) {
      stopRecording();
      setSpeech("");
      localStorage.removeItem("formshow");
      localStorage.removeItem("priorCallIdList");
      room.disconnect();
    }
  };



  const handleSubmit = async () => {
    const microphonePermission = localStorage.getItem("microphonePermission");
    console.log("microphonePermission", microphonePermission);

    try {
      const res = await axios.post(`${baseUrl}`, {
        "room_name": "consultation_123",
        "user_identity": "patient_456",
        "user_name": "John Doe",
        "token_ttl": 3600,
        "empty_timeout": 300,
        "max_participants": 10,
        "dispatch_agent": false,
        "agent_name": "dental_assistant"
    });
      console.log("Create room response:", res.data);

      const decryptedPayload = res.data.response;

      const accessToken = decryptedPayload.access_token;

      await room.connect(serverUrl, accessToken);
      setMuted(false);
      localStorage.setItem("formshow", "false");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = stream.getAudioTracks();
      await room.localParticipant.publishTrack(audioTrack);
      audioTrackRef.current = audioTrack;
      setTranscripts("");
    } catch (err) {
      console.error("Form error:", err);
    } finally {
      console.log("Request completed");
    }
  };




  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts]);

  useEffect(() => {
    if (isRecording) {
      const smallPulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, small: !prev.small }));
      }, 1000);

      const mediumPulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, medium: !prev.medium }));
      }, 1500);

      const largePulse = setInterval(() => {
        setPulseEffects((prev) => ({ ...prev, large: !prev.large }));
      }, 2000);

      return () => {
        clearInterval(smallPulse);
        clearInterval(mediumPulse);
        clearInterval(largePulse);
      };
    }
  }, [isRecording]);

  

  return (
    <div
      className="fixed bottom-[74px] right-6 z-50 flex flex-col items-end"
      style={{
        zIndex: 999,
      }}
    >
      {expanded ? (
        <div
          className="bg-gray-900/50 backdrop-blur-sm w-[309px] rounded-2xl shadow-2xl overflow-hidden border"
            
        >
          <div className="pt-10 flex flex-col items-center justify-center relative h-full w-full">
            <div className=" black/30 w-full h-full flex items-center justify-center ">
              {/* Cosmic background effects */}

              {/* Main content container */}
              <div className="relative  flex flex-col items-center justify-center h-full w-full">
                <button onClick={()=>handleClose()} className="absolute top-2 right-2 text-gray-400 hover:text-gray-200">  
                      close 
                    </button>

                {/* Microphone button with enhanced effects */}
                <div className="relative group">
                  <button
                    onClick={handleMicClick}
                    className={`relative z-10 bg-black/80 rounded-full w-36 h-36 flex items-center justify-center border-2
              ${
                isGlowing
                  ? "border-yellow-300 shadow-[0_0_30px_10px_rgba(250,204,21,0.3)]"
                  : "border-yellow-400 shadow-lg"
              } transition-all duration-500 ${
                      isRecording ? "scale-110" : "hover:scale-105"
                    } backdrop-blur-sm
              group-hover:shadow-[0_0_50px_15px_rgba(250,204,21,0.2)]`}
                  >
                    {/* Button internal gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-yellow-900/20 rounded-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/5 via-transparent to-transparent rounded-full"></div>

                    {/* Microphone icon with animation */}
                    <div className="relative">
                      <img
                        src={logo}
                        alt=""
                        className={`w-16 h-16 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]
                  ${
                    isRecording
                      ? "animate-[pulse_1.5s_ease-in-out_infinite]"
                      : ""
                  }
                  transition-transform duration-300 group-hover:scale-110`}
                      />

                      {/* Ripple effect when recording */}
                      {isRecording && (
                        <div className="absolute -inset-4">
                          <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-full animate-[ripple_2s_ease-out_infinite]"></div>
                          <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-full animate-[ripple_2s_ease-out_infinite_0.5s]"></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Status indicator */}
                {/* {isRecording && (
                  <div className="mt-8 px-4 py-2 bg-black/30 rounded-full border border-yellow-400/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-yellow-400 text-sm font-medium">
                        Recording...
                      </span>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
              <div className="relative p-4 w-full ">
                <div className="absolute inset-0 "></div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    
                    {isRecording && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                        <span className="text-red-400 text-xs">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div
                    ref={containerRef}
                    className=" bg-white backdrop-blur-sm rounded-xl p-4 h-16 text-white shadow-inner border border-gray-800 overflow-y-auto scrollbar-hide ring-yellow-400/80"
                  >
                    <div className="relative">
                      <span className="text-black">{transcripts}</span>
                    </div>
                    
                  </div>
                </div>
              </div>
              <button onClick={()=>handleSubmit()} className="absolute top-2 right-2 text-gray-400 hover:text-gray-200">  
                      start 
                    </button>

                    
                    </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1 justify-center">
            <button
              onClick={toggleExpand}
              className="bg-black rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-2 border-yellow-400 hover:bg-gray-900 transition-all hover:scale-110 hover:shadow-yellow-400/50"
            >
              <div className="relative">
                <div className="absolute inset-0 -m-1 bg-yellow-400/40 rounded-full animate-ping"></div>
                <div className="absolute inset-0 -m-3 bg-yellow-400/20 rounded-full animate-pulse"></div>
                <span className="text-yellow-400 font-bold text-3xl relative z-10 drop-shadow-xl tracking-tighter">
                  <img src={logo} alt="logo" className="w-[54px] h-[54px]" />
                </span>
              </div>
            </button>
            <button
              onClick={toggleExpand}
              className="inline-block px-4 py-1 bg-black text-[#FFD700] border-2 border-[#FFD700] rounded-full font-inter font-bold text-xs no-underline text-center transition-all duration-300  hover:bg-black"
            >
              TALK TO ME
            </button>
          </div>
        </>
      )}

      <RoomAudioRenderer muted={muted} />
    </div>
  );
};

export default RetellaiAgent;
