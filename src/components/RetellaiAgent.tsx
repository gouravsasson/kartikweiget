import React, { useState, useEffect, useRef, useMemo } from "react";
import { Mic, Send, X, Minimize2, Phone, Mail, User } from "lucide-react";
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
    <div className="pt-10 flex flex-col items-center justify-center relative overflow-hidden w-full">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent"></div>
      <div className="absolute w-full h-64 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute w-52 h-52  left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute w-40 h-40  left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400/25 rounded-full blur-md animate-pulse"></div>

      {/* Decorative elements */}
      {/* <div className="absolute w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-300"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-700"></div>
              <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-500"></div>
              <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-yellow-300 rounded-full animate-ping delay-200"></div>
            </div> */}

      {/* Microphone button with pulse animations */}
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
        {isGlowing && (
          <div className="absolute inset-0 -m-5 bg-yellow-400 opacity-50 rounded-full animate-ping"></div>
        )}
        {isGlowing && (
          <div className="absolute inset-0 -m-10 bg-yellow-400 opacity-30 rounded-full animate-pulse"></div>
        )}
        <button
          // onClick={handleMicClick}
          className={`relative z-10 bg-black rounded-full w-36 h-36 flex items-center justify-center border-2 ${
            isGlowing
              ? "border-yellow-300 shadow-xl shadow-yellow-400/60"
              : "border-yellow-400 shadow-lg"
          } shadow-yellow-400/30 transition-all duration-500 ${
            isRecording ? "scale-110" : "hover:scale-105"
          } backdrop-blur-sm`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-yellow-900/20 rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/5 via-transparent to-transparent rounded-full"></div>
          <div className="flex items-center justify-center">
            <span
              className={`text-yellow-400 font-bold text-6xl drop-shadow-xl tracking-tighter ${
                isRecording ? "animate-pulse" : ""
              }`}
            >
              <img src={logo} alt="logo" className="w-20 h-20" />
            </span>
          </div>
        </button>
      </div>

      {/* <p className="text-yellow-400 text-sm mt-5 font-medium drop-shadow-md bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm border border-yellow-400/20">
              {speech}
            </p> */}
    </div>
  );
};

// User Form Input
const UserForm = ({
  formData,
  setFormData,
  onSubmit,
  error,
  state,
  handleCountryCode,
}) => (
  <form onSubmit={onSubmit}>
    <div className="flex flex-col gap-4 m-4">
      {[
        {
          icon: <User className="h-5 w-5 text-gray-400" />,
          value: formData.name,
          type: "text",
          placeholder: "Your name",
          key: "name",
          component: "",
        },
        {
          icon: <Mail className="h-5 w-5 text-gray-400" />,
          value: formData.email,
          type: "email",
          placeholder: "Email address",
          key: "email",
          component: "",
        },
        {
          icon: <Phone className="h-5 w-5 text-gray-400" />,
          value: formData.phone,
          type: "tel",
          placeholder: "Phone number",
          key: "phone",
          component: <CountryCode data={handleCountryCode} />,
        },
      ].map((field, index) => (
        <div className="relative" key={index}>
          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
            {field.icon}
          </div>

          <div className="flex items-center">
            {field.component}
            <input
              type={field.type}
              value={field.value}
              onChange={(e) =>
                setFormData({ ...formData, [field.key]: e.target.value })
              }
              className={`block w-full pl-12 pr-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
                field.component && " rounded-l-none !pl-2"
              }`}
              placeholder={field.placeholder}
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-xl hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors"
      >
        {state === "connecting"
          ? "...Connecting to Ai Assistant"
          : "Connect to Ai Assistant"}
      </button>

      {error && (
        <div className="text-red-500 text-center text-sm mt-2">{error}</div>
      )}
    </div>
  </form>
);

// Main Component
const RetellaiAgent = () => {
  const decoder = new TextDecoder();
  const containerRef = useRef(null);
  const [countryCode, setCountryCode] = useState("+1");
  const [expanded, setExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [speech, setSpeech] = useState("");
  const [error, setError] = useState("");
  const room = useRoomContext();
  const [token, setToken] = useState("");
  const status = useConnectionState(room);
  const serverUrl = "wss://retell-ai-4ihahnq7.livekit.cloud";
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const [muted, setMuted] = useState(false);
  const [transcripts, setTranscripts] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [pulseEffects, setPulseEffects] = useState({
    small: false,
    medium: false,
    large: false,
  });

  const handleFormShow = () => {
    return localStorage.getItem("formshow") === "true";
  };
  const [showform, setShowform] = useState(handleFormShow());

  const refreshFormShow = () => {
    setShowform(handleFormShow());
  };

  room.on(
    RoomEvent.DataReceived,
    (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      let decodedData = decoder.decode(payload);
      let event = JSON.parse(decodedData);
      if (event.event_type === "update") {
        const alltrans = event.transcript;

        let Trans = "";

        for (let index = 0; index < alltrans.length; index++) {
          const currentTranscript = alltrans[index];

          Trans = currentTranscript.content;

          if (currentTranscript) {
            setTranscripts(Trans);
          }
        }
      }
    }
  );

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
      localStorage.setItem("formshow", "true");
      refreshFormShow();
      // localStorage.setItem("formshow", "false");
      // setTimeout(() => {
      //   setShowform(true);
      // }, 40000);
      // setIsConnecting(true);
      // try {
      //   const res = await axios.post(
      //     "https://danube.closerx.ai/api/create-greeting-web-call/",
      //     {
      //       schema_name: "Danubeproperty",
      //       agent_code: 15,
      //       quick_campaign_id: "quickcamp0c6c67bd",
      //     }
      //   );
      //   const accessToken = res.data.response.access_token;
      //   setToken(accessToken);
      //   await room.connect(serverUrl, accessToken);
      //   const stream = await navigator.mediaDevices.getUserMedia({
      //     audio: true,
      //   });
      //   const [audioTrack] = stream.getAudioTracks();
      //   await room.localParticipant.publishTrack(audioTrack);
      //   audioTrackRef.current = audioTrack;
      // } catch (err) {
      //   console.error(err);
      //   setError("Failed to connect. Try again.");
      // } finally {
      //   setIsConnecting(false);
      // }
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
    const endcall = await axios.post(
      "https://danube.closerx.ai/api/end-web-call/",
      data
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
          phone: countryCode + formData.phone,
          name: formData.name,
          email: formData.email,
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
      setMuted(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const [audioTrack] = stream.getAudioTracks();
      await room.localParticipant.publishTrack(audioTrack);
      audioTrackRef.current = audioTrack;
      setTranscripts("");
      localStorage.setItem("formshow", "false");
      refreshFormShow();
    } catch (err) {
      console.error("Form error:", err);
      setError("Unable to continue conversation.");
    }
  };
  const oneref = useRef(false);

  useEffect(() => {
    const formshow = localStorage.getItem("formshow") === "true";
    if (formshow) {
      refreshFormShow();
    }
    const priorCallIdList = JSON.parse(
      localStorage.getItem("priorCallIdList") || "[]"
    );

    const initiateCall = async () => {
      try {
        if (priorCallIdList.length > 0 && !oneref.current) {
          oneref.current = true;
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

    console.log("expanded", expanded);
    console.log("muted", muted);

    if (expanded && muted) {
      setMuted(false);
    } else if (!expanded && !muted) {
      setMuted(true);
    }
  }, []);

  const handleMinimize = () => {
    setExpanded(false);
    setMuted(true);
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

  const handleCountryCode = (data) => {
    setCountryCode(data);
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
                state={room.state}
                handleCountryCode={handleCountryCode}
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
                    ref={containerRef}
                    className=" bg-white backdrop-blur-sm rounded-xl p-4 h-16 text-white shadow-inner border border-gray-800 overflow-y-auto scrollbar-hide ring-yellow-400/80"
                  >
                    <div className="relative">
                      <span className="text-black">{transcripts}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              className="inline-block px-4 py-1 bg-black text-[#FFD700] border-2 border-[#FFD700] rounded-full font-inter font-bold text-sm no-underline text-center transition-all duration-300  hover:bg-black"
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
