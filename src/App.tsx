import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import { LiveKitRoom } from "@livekit/components-react";
import Forkartik from "./components/Forkartik";
import { Room } from "livekit-client";

import { useState } from "react";
function App() {
  const [room] = useState(() => new Room({}));

  const { type } = useWidgetContext();
  console.log("type", type);
  // const [type, setType] = useState("livekit");

  return (
    <>
      <LiveKitRoom token="" serverUrl="" room={room} connect={false}>
        {type === "ravan" && <RetellaiAgent />}
        {type === "thunder" && <Forkartik />}
      </LiveKitRoom>
    </>
  );
}

export default App;
