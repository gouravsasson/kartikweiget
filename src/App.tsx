import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import { LiveKitRoom } from "@livekit/components-react";
import { Room } from "livekit-client";

import { useState } from "react";
function App() {
  const [room] = useState(() => new Room({}));

  const { type } = useWidgetContext();
  // const [type, setType] = useState("livekit");

  return (
    <>
      <LiveKitRoom token="" serverUrl="" room={room} connect={false}>
        {type === "livekit" && <RetellaiAgent />}
      </LiveKitRoom>
    </>
  );
}

export default App;
