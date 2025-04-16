import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import { LiveKitRoom } from "@livekit/components-react";
import Forkartik from "./components/Forkartik";
import { Room } from "livekit-client";
import Retelltest from "./components/Retelltest";
import { useState } from "react";
function App() {
  const [room] = useState(() => new Room({}));

  // const { type } = useWidgetContext();
  // console.log("type", type);
  const [type, setType] = useState("retell");

  return (
    <>
      <LiveKitRoom token="" serverUrl="" room={room} connect={false}>
        {type === "ravan" && <RetellaiAgent />}
        {type === "thunder" && <Forkartik />}
        {type === "retell" && <Retelltest />}
      </LiveKitRoom>
    </>
  );
}

export default App;
