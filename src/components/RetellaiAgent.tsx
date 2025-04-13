import React, { useState, useEffect, useRef, useMemo } from "react";
import { Mic, Send, X, Minimize2, Phone, Mail, User } from "lucide-react";
import logo from "../assets/logo.png";
import {
  RoomAudioRenderer,
  useConnectionState,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";

import { DataPacket_Kind, RemoteParticipant, RoomEvent } from "livekit-client";
import axios from "axios";

// Header Component
const Header = ({ onMinimize, onClose }) => (
  <div className="relative p-4 flex justify-between bg-black items-center">
    <div className="flex items-center">
      <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center mr-2 border border-yellow-400">
        <img src={logo} alt="logo" className="w-6 h-6" />
      </div>
      <span className="text-white font-bold text-lg">Voice Assistant</span>
    </div>
    <div className="flex space-x-2">
      <button
        className="text-gray-300 hover:text-yellow-400"
        onClick={onMinimize}
      >
        <Minimize2 size={18} />
      </button>
      <button className="text-gray-300 hover:text-yellow-400" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  </div>
);

// Mic Button with Pulse Effects
const MicButton = ({ isRecording, isGlowing, onClick }) => {
  return (
    <div className="relative">
      {isGlowing && (
        <>
          <div className="absolute inset-0 -m-3 bg-yellow-400 opacity-30 rounded-full animate-ping" />
          <div className="absolute inset-0 -m-6 bg-yellow-500 opacity-20 rounded-full animate-pulse" />
          <div className="absolute inset-0 -m-12 bg-yellow-600 opacity-10 rounded-full animate-pulse" />
        </>
      )}
      <button
        onClick={onClick}
        className={`relative z-10 bg-black rounded-full w-36 h-36 flex items-center justify-center border-2 ${
          isGlowing
            ? "border-yellow-300 shadow-yellow-400/60"
            : "border-yellow-400"
        }`}
      >
        <img src={logo} alt="logo" className="w-20 h-20" />
      </button>
    </div>
  );
};

// User Form Input
const UserForm = ({ formData, setFormData, onSubmit, error }) => (
  <form onSubmit={onSubmit}>
    <div className="flex flex-col gap-4 m-4">
      {[
        {
          icon: <User className="h-5 w-5 text-gray-400" />,
          value: formData.name,
          type: "text",
          placeholder: "Your name",
          key: "name",
        },
        {
          icon: <Mail className="h-5 w-5 text-gray-400" />,
          value: formData.email,
          type: "email",
          placeholder: "Email address",
          key: "email",
        },
        {
          icon: <Phone className="h-5 w-5 text-gray-400" />,
          value: formData.phone,
          type: "tel",
          placeholder: "Phone number",
          key: "phone",
        },
      ].map((field, index) => (
        <div className="relative" key={index}>
          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
            {field.icon}
          </div>
          <input
            type={field.type}
            value={field.value}
            onChange={(e) =>
              setFormData({ ...formData, [field.key]: e.target.value })
            }
            className="block w-full pl-12 pr-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            placeholder={field.placeholder}
          />
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-xl hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors"
      >
        Continue Conversation
      </button>

      {error && (
        <div className="text-red-500 text-center text-sm mt-2">{error}</div>
      )}
    </div>
  </form>
);

// Main Component
const RetellaiAgent = () => {
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [speech, setSpeech] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const room = useRoomContext();
  const [token, setToken] = useState("");
  const status = useConnectionState(room);
  const serverUrl = "wss://retell-ai-4ihahnq7.livekit.cloud";
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const [priorCallId, setPriorCallId] = useState("");
  const [muted, setMuted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const handleFormShow = () => {
    const formshow = localStorage.getItem("formshow");
    if (formshow === "true") {
      return false;
    } else {
      return true;
    }
  };
  const showform = handleFormShow();
  console.log("showform", showform);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("gg", document.visibilityState);
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
    if (
      !expanded &&
      status === "disconnected" &&
      !isConnecting &&
      !priorCallId
    ) {
      setExpanded(!expanded);
      setIsConnecting(true);
      try {
        const res = await axios.post(
          "https://danube.closerx.ai/api/create-greeting-web-call/",
          {
            schema_name: "Danubeproperty",
            agent_code: 15,
            quick_campaign_id: "quickcamp0c6c67bd",
          }
        );
        const accessToken = res.data.response.access_token;
        setToken(accessToken);
        await room.connect(serverUrl, accessToken);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const [audioTrack] = stream.getAudioTracks();
        await room.localParticipant.publishTrack(audioTrack);
        audioTrackRef.current = audioTrack;
      } catch (err) {
        console.error(err);
        setError("Failed to connect. Try again.");
      } finally {
        setIsConnecting(false);
      }
    }
    if (muted) {
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
    const endcall = await axios.post(
      "https://danube.closerx.ai/api/end-web-call/",
      {
        schema_name: "Danubeproperty",
        prior_call_ids: priorCallIdList,
      }
    );
    if (endcall.status === 200) {
      stopRecording();
      setSpeech("");
      setExpanded(false);
      localStorage.clear();
      room.disconnect();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await room.disconnect();

    try {
      const res = await axios.post(
        "https://danube.closerx.ai/api/create-web-call/",
        {
          schema_name: "Danubeproperty",
          agent_code: 14,
          quick_campaign_id: "quickcamp33bfe31d",
          ...formData,
        }
      );

      const accessToken = res.data.response.access_token;
      const newCallId = res.data.response.call_id;
      localStorage.setItem("formshow", "true");

      if (newCallId) {
        const priorCallIdList = JSON.parse(
          localStorage.getItem("priorCallIdList") || "[]"
        );
        priorCallIdList.push(newCallId);
        localStorage.setItem(
          "priorCallIdList",
          JSON.stringify(priorCallIdList)
        );
      }

      setToken(accessToken);

      await room.connect(serverUrl, accessToken);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = stream.getAudioTracks();
      await room.localParticipant.publishTrack(audioTrack);
      audioTrackRef.current = audioTrack;
    } catch (err) {
      console.error("Form error:", err);
      setError("Unable to continue conversation.");
    }
  };
  useEffect(() => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );
    const initiateCall = async () => {
      console.log("initiateCall");
      try {
        if (priorCallIdList.length > 0) {
          const res = await axios.post(
            "https://danube.closerx.ai/api/create-web-call/",
            {
              schema_name: "Danubeproperty",
              agent_code: 14,
              quick_campaign_id: "quickcamp33bfe31d",
              prior_call_id: priorCallIdList[priorCallIdList.length - 1],
              // ...formData,
            }
          );

          const accessToken = res.data.response.access_token;
          const newCallId = res.data.response.call_id;

          if (newCallId) {
            const priorCallIdList = JSON.parse(
              localStorage.getItem("priorCallIdList") || "[]"
            );
            priorCallIdList.push(newCallId);
            localStorage.setItem(
              "priorCallIdList",
              JSON.stringify(priorCallIdList)
            );
          }

          setToken(accessToken);

          await room.connect(serverUrl, accessToken);
          setMuted(true);

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const [audioTrack] = stream.getAudioTracks();
          await room.localParticipant.publishTrack(audioTrack);
          audioTrackRef.current = audioTrack;
        }
      } catch (err) {
        console.error("Form error:", err);
        setError("Unable to continue conversation.");
      }
    };
    initiateCall();
  }, []);

  const handleMinimize = () => {
    setExpanded(false);
    setMuted(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {expanded ? (
        <div
          className={`bg-gray-900/50 backdrop-blur-sm w-[309px] rounded-2xl shadow-2xl overflow-hidden border ${
            isGlowing
              ? "border-yellow-300 shadow-yellow-400/40"
              : "border-yellow-400"
          } transition-all duration-500`}
        >
          <Header onMinimize={handleMinimize} onClose={handleClose} />
          <div className="pt-10 flex flex-col items-center justify-center relative overflow-hidden w-full">
            <MicButton
              isRecording={isRecording}
              isGlowing={isGlowing}
              onClick={handleMicClick}
            />
            <p className="text-yellow-400 text-sm mt-5 font-medium">{speech}</p>
            {showform ? (
              <UserForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                error={error}
              />
            ) : (
              <div className="relative p-4 w-full ">
                <div className="absolute inset-0 "></div>
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    {/* <div className="text-yellow-400 text-sm font-medium">
                  Real-time transcription
                </div> */}
                    {isRecording && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                        <span className="text-red-400 text-xs">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div
                    // ref={containerRef}
                    className=" bg-white backdrop-blur-sm rounded-xl p-4 h-16 text-white shadow-inner border border-gray-800 overflow-y-auto scrollbar-hide ring-yellow-400/80"
                  >
                    <div className="relative">
                      {/* <span className="text-black">{transcripts}</span> */}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 justify-center">
          <button
            onClick={toggleExpand}
            className="bg-black rounded-full w-20 h-20 flex items-center justify-center shadow-2xl border-2 border-yellow-400 hover:scale-110"
          >
            <img src={logo} alt="logo" className="w-[54px] h-[54px]" />
          </button>
          <button
            onClick={toggleExpand}
            className="px-4 py-1 bg-black text-yellow-400 border-2 border-yellow-400 rounded-full text-sm font-bold"
          >
            TALK TO ME
          </button>
        </div>
      )}

      <RoomAudioRenderer muted={muted} />
    </div>
  );
};

export default RetellaiAgent;
