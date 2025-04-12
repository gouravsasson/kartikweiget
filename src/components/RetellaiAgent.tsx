import React, { useState, useEffect, useRef } from "react";
import { Mic, Send, X, Minimize2, Phone, User, Mail } from "lucide-react";
import logo from "../assets/logo.png";
import {
  RoomContext,
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
} from "@livekit/components-react";
import { Room } from "livekit-client";
import axios from "axios";

const RetellaiAgent = () => {
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [speech, setSpeech] = useState("");
  const [pulseEffects, setPulseEffects] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [room] = useState(() => new Room({}));
  const status = useConnectionState(room);
  console.log(status);

  const [token, setToken] = useState("");
  console.log(token);
  const serverUrl = "wss://retell-ai-4ihahnq7.livekit.cloud";

  const toggleExpand = async () => {
    if (!expanded && status === "disconnected") {
      try {
        const getToken = await axios.post(
          "https://danube.closerx.ai/api/create-web-call/",
          {
            schema_name: "Danubeproperty",
            agent_code: 14,
            quick_campaign_id: "quickcamp33bfe31d",
            // prior_call_id: "1",
          }
        );
        setToken(getToken.data.response.access_token);
        await room.connect(serverUrl, getToken.data.response.access_token);
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const [audioTrack] = audioStream.getAudioTracks();
        await room.localParticipant.publishTrack(audioTrack);
      } catch (err) {
        console.error("Connection error:", err);
      }
    }
    setExpanded(!expanded);
  };

  const handleMicClick = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setIsGlowing(true);
    setPulseEffects({ small: true, medium: true, large: true });

    // Simulated transcription
    setTimeout(() => {
      setSpeech("Hi there! How can I assist you today?");
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsGlowing(false);
    setPulseEffects({ small: false, medium: false, large: false });
  };

  const handleClose = () => {
    setExpanded(false);
    setSpeech("");
    stopRecording();
    room.disconnect();
  };

  return (
    <LiveKitRoom token={token} serverUrl={serverUrl} connect={false}>
      <RoomContext.Provider value={room}>
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
          style={{ zIndex: 999 }}
        >
          {expanded ? (
            <div
              className={`bg-gray-900/50 backdrop-blur-sm w-[309px] rounded-2xl shadow-2xl overflow-hidden border ${
                isGlowing
                  ? "border-yellow-300 shadow-yellow-400/40"
                  : "border-yellow-400"
              } transition-all duration-500`}
            >
              {/* Header */}
              <div className="relative p-4 flex justify-between bg-black items-center">
                <div className="relative flex items-center">
                  <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center mr-2 border border-yellow-400">
                    <img src={logo} alt="logo" className="w-6 h-6" />
                  </div>
                  <span className="text-white font-bold text-lg">
                    Voice Assistant
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-300 hover:text-yellow-400"
                    onClick={() => setExpanded(false)}
                  >
                    <Minimize2 size={18} />
                  </button>
                  <button
                    className="text-gray-300 hover:text-yellow-400"
                    onClick={handleClose}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Mic Button */}
              <div className="pt-10 flex flex-col items-center justify-center relative overflow-hidden w-full">
                <div className="relative">
                  {isRecording && pulseEffects.small && (
                    <div className="absolute inset-0 -m-3 bg-yellow-400 opacity-30 rounded-full animate-ping"></div>
                  )}
                  {isRecording && pulseEffects.medium && (
                    <div className="absolute inset-0 -m-6 bg-yellow-500 opacity-20 rounded-full animate-pulse"></div>
                  )}
                  {isRecording && pulseEffects.large && (
                    <div className="absolute inset-0 -m-12 bg-yellow-600 opacity-10 rounded-full animate-pulse"></div>
                  )}
                  <button
                    onClick={handleMicClick}
                    className={`relative z-10 bg-black rounded-full w-36 h-36 flex items-center justify-center border-2 ${
                      isGlowing
                        ? "border-yellow-300 shadow-yellow-400/60"
                        : "border-yellow-400"
                    }`}
                  >
                    <img src={logo} alt="logo" className="w-20 h-20" />
                  </button>
                </div>
                <p className="text-yellow-400 text-sm mt-5 font-medium">
                  {speech}
                </p>

                {/* Form */}
                <div className="flex flex-col gap-4 m-4 w-full">
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl focus:ring-2 focus:ring-yellow-400"
                      placeholder="Phone number"
                    />
                  </div>
                  <button className="w-full bg-yellow-400 text-black font-semibold py-4 rounded-xl hover:bg-yellow-500">
                    Continue Conversation
                  </button>
                </div>
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
          <RoomAudioRenderer />
        </div>
      </RoomContext.Provider>
    </LiveKitRoom>
  );
};

export default RetellaiAgent;
