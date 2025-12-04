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
  Volume2,
  VolumeX,
} from "lucide-react";
import logo from "../assets/logo.png";
import {
  RoomAudioRenderer,
  useConnectionState,
  useRoomContext,
} from "@livekit/components-react";
import { DataPacket_Kind, RemoteParticipant, RoomEvent } from "livekit-client";
import axios from "axios";
import CountryCode from "./CountryCode";
import CryptoJS from "crypto-js";

const SobhaAgent = () => {
  const decoder = new TextDecoder();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countryCode, setCountryCode] = useState("+971");
  const [expanded, setExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [speech, setSpeech] = useState("Talk to Me");
  const [error, setError] = useState("");
  const room = useRoomContext();
  const status = useConnectionState(room);
  const serverUrl = "wss://retell-ai-4ihahnq7.livekit.cloud";
  const [muted, setMuted] = useState(false);
  const [transcripts, setTranscripts] = useState("");
  const [desableSubmit, setDesableSubmit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [pulseEffects] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const baseUrl = "https://sobha.closerx.ai";

  const handleFormShow = () => localStorage.getItem("formshow") === "true";
  const [showform, setShowform] = useState(handleFormShow());

  const refreshFormShow = () => setShowform(handleFormShow());

  const transcriptEmitter = new EventEmitter();

  // LiveKit transcript listener
  room.on(
    RoomEvent.DataReceived,
    (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind
    ) => {
      let decodedData = decoder.decode(payload);
      let event = JSON.parse(decodedData);
      transcriptEmitter.emit("dataReceived", event);
    }
  );

  transcriptEmitter.on("dataReceived", (event) => {
    if (event.event_type === "update") {
      const alltrans = event.transcript;
      let Trans = "";
      for (let i = 0; i < alltrans.length; i++) {
        Trans = alltrans[i].content;
      }
      setTranscripts(Trans);
    }
  });

  // Permission check
  useEffect(() => {
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((p) => {
        localStorage.setItem("microphonePermission", p.state);
        p.onchange = () =>
          localStorage.setItem("microphonePermission", p.state);
      });
  }, []);

  // Visibility mute
  useEffect(() => {
    const handleVisibilityChange = () => {
      setMuted(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Auto scroll transcript
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Glow & recording state
  useEffect(() => {
    setIsGlowing(status === "connected");
    setIsRecording(status === "connected");
  }, [status]);

  // Speech status text
  useEffect(() => {
    if (status === "disconnected") setSpeech("Talk to Me");
    else if (status === "connecting") setSpeech("Connecting...");
    else if (status === "connected") setSpeech("Listening...");
  }, [status]);

  const toggleExpand = () => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );
    setExpanded(true);
    setIsMinimized(false);
    if (
      !expanded &&
      status === "disconnected" &&
      priorCallIdList.length === 0
    ) {
      localStorage.setItem("formshow", "true");
      refreshFormShow();
    }
    if (muted) setMuted(false);
  };

  const toggleMute = () => setMuted(!muted);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const handleClose = async () => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );
    const data = {
      schema_name: "136203f1-dac6-454d-b920-78472183d8d6",
      prior_call_ids: priorCallIdList.length > 0 ? priorCallIdList : [],
    };

    setExpanded(false);
    await axios.post("https://sobha.closerx.ai/api/ravan-ai-end/", data);
    localStorage.removeItem("formshow");
    localStorage.removeItem("priorCallIdList");
    room.disconnect();
    setTranscripts("");
    setSpeech("Talk to Me");
  };

  const encryptData = (data: any) => {
    const key = CryptoJS.SHA256("GOURAV");
    return CryptoJS.AES.encrypt(JSON.stringify(data), key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  };

  const decryptData = (ciphertext: string) => {
    const key = CryptoJS.SHA256("GOURAV");
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDesableSubmit(true);
    if (localStorage.getItem("microphonePermission") === "denied") {
      setError("Microphone permission denied. Please allow access.");
      setDesableSubmit(false);
      return;
    }

    const payload = {
      schema_name: "136203f1-dac6-454d-b920-78472183d8d6",
      agent_code: 1,
      quick_campaign_id: "quickcamp5ca0514e",
      phone: countryCode + formData.phone,
      first_name: formData.name,
      last_name: formData.lastname,
      email: formData.email,
      country: `${localStorage.getItem("countryName") || ""} ${
        localStorage.getItem("city") || ""
      }`,
    };

    try {
      const res = await axios.post(`${baseUrl}/api/ravan-ai-start/`, {
        encryptedPayload: encryptData(payload),
      });

      const decrypted = decryptData(res.data.response);
      const accessToken = decrypted.access_token;
      const newCallId = decrypted.call_id;

      if (newCallId) {
        const list = JSON.parse(
          localStorage.getItem("priorCallIdList") || "[]"
        );
        list.push(newCallId);
        localStorage.setItem("priorCallIdList", JSON.stringify(list));
      }

      await room.connect(serverUrl, accessToken);
      setMuted(false);
      localStorage.setItem("formshow", "false");
      refreshFormShow();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = stream.getAudioTracks();
      await room.localParticipant.publishTrack(audioTrack);
      setTranscripts("");
    } catch (err) {
      setError("Unable to connect. Please try again.");
    } finally {
      setDesableSubmit(false);
    }
  };

  // Reconnect logic on mount/expand
  useEffect(() => {
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );
    if (priorCallIdList.length > 0 && expanded && status === "disconnected") {
      // Auto-reconnect logic (same as original)
      const payload = {
        schema_name: "136203f1-dac6-454d-b920-78472183d8d6",
        agent_code: 1,
        quick_campaign_id: "quickcamp5ca0514e",
        prior_call_id: priorCallIdList[priorCallIdList.length - 1],
      };
      axios
        .post(`${baseUrl}/api/ravan-ai-start/`, {
          encryptedPayload: encryptData(payload),
        })
        .then((res) => {
          const decrypted = decryptData(res.data.response);
          room.connect(serverUrl, decrypted.access_token);
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
              room.localParticipant.publishTrack(stream.getAudioTracks()[0]);
            });
        });
    }
  }, [expanded]);

  const handleCountryCode = (code: string) => setCountryCode(code);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Expanded View */}
      {expanded ? (
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden border-2 transition-all duration-300 ${
            isGlowing
              ? "border-[#E5D4A8] shadow-[0_0_30px_rgba(201,169,98,0.5)]"
              : "border-[#C9A962]"
          } ${isMinimized ? "h-16" : "w-96"}`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C9A962] to-[#E5D4A8] p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://pbs.twimg.com/profile_images/1849809621902311424/ZHnkaAtf_400x400.jpg"
                alt="Logo"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-[#1A1A1A] font-bold text-lg">
                Sobha AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#1A1A1A] hover:bg-[#FAF8F5]/20 p-2 rounded-full transition"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={toggleMinimize}
                className="text-[#1A1A1A] hover:bg-[#FAF8F5]/20 p-2 rounded-full transition"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={handleClose}
                className="text-[#1A1A1A] hover:bg-[#FAF8F5]/20 p-2 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-4 bg-[#FAF8F5]">
              {/* Form or Chat */}
              {showform ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    {
                      icon: <User size={20} />,
                      key: "name",
                      placeholder: "First name",
                    },
                    {
                      icon: <User size={20} />,
                      key: "lastname",
                      placeholder: "Last name",
                    },
                    {
                      icon: <Mail size={20} />,
                      key: "email",
                      type: "email",
                      placeholder: "Email address",
                    },
                    {
                      icon: <Phone size={20} />,
                      key: "phone",
                      type: "tel",
                      placeholder: "Phone number",
                      component: <CountryCode data={handleCountryCode} />,
                    },
                  ].map((field) => (
                    <div key={field.key} className="relative">
                      <div className="absolute left-3 top-3 text-[#6B6B6B]">
                        {field.icon}
                      </div>
                      <div className="flex">
                        {field.component}
                        <input
                          type={field.type || "text"}
                          required
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (field.key === "phone")
                              val = val.replace(/\D/g, "");
                            setFormData((prev) => ({
                              ...prev,
                              [field.key]: val,
                            }));
                          }}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white border focus:outline-none focus:ring-2 focus:ring-[#C9A962] transition ${
                            field.component ? "rounded-l-none" : ""
                          }`}
                          placeholder={field.placeholder}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={desableSubmit || status === "connecting"}
                    className="w-full bg-gradient-to-r from-[#C9A962] to-[#E5D4A8] text-[#1A1A1A] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {desableSubmit || status === "connecting" ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Connecting...
                      </>
                    ) : (
                      "Connect to AI Assistant"
                    )}
                  </button>
                  {error && (
                    <p className="text-red-500 text-center text-sm">{error}</p>
                  )}
                </form>
              ) : (
                <>
                  {/* Mic Button */}
                  <div className="flex justify-center my-6">
                    <div className="relative">
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 rounded-full border-4 border-[#E5D4A8]/50 animate-ping"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-[#E5D4A8]/30 animate-ping delay-300"></div>
                        </>
                      )}
                      <button
                        className={`relative w-24 h-24 rounded-full bg-white shadow-xl border-4 flex items-center justify-center transition-all ${
                          isGlowing
                            ? "border-[#E5D4A8] shadow-[0_0_30px_rgba(201,169,98,0.5)] scale-110"
                            : "border-[#C9A962]"
                        }`}
                      >
                        <img
                          src="https://pbs.twimg.com/profile_images/1849809621902311424/ZHnkaAtf_400x400.jpg"
                          alt="AI"
                          className="w-14 h-14 rounded-full"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center text-[#9A7B3D] font-medium mb-3">
                    {speech}
                  </div>

                  {/* Transcript */}
                  <div
                    ref={containerRef}
                    className="bg-white rounded-xl p-4 h-32 overflow-y-auto border border-[#E5D4A8] shadow-inner"
                  >
                    {transcripts || (
                      <span className="text-[#6B6B6B] italic">
                        Conversation will appear here...
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Floating Button */
        <div className="flex flex-col items-center">
          <button
            onClick={toggleExpand}
            className="relative w-20 h-20 bg-white rounded-full shadow-2xl border-4 border-[#E5D4A8] hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-full bg-[#E5D4A8]/40 animate-ping"></div>
            <img
              src="https://pbs.twimg.com/profile_images/1849809621902311424/ZHnkaAtf_400x400.jpg"
              alt="Talk"
              className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
            />
          </button>

          <span className="mt-3 px-6 py-2 bg-gradient-to-r from-[#C9A962] to-[#E5D4A8] text-[#1A1A1A] font-bold rounded-full shadow-lg text-sm">
            TALK TO ISHA
          </span>
        </div>
      )}

      <RoomAudioRenderer muted={muted} />
    </div>
  );
};

export default SobhaAgent;
