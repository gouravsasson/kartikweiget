import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import { LiveKitRoom } from "@livekit/components-react";
import Forkartik from "./components/Forkartik";
import { Room } from "livekit-client";
import Retelltest from "./components/Retelltest";
import { useState } from "react";
import DanubeAgentStaging from "./components/DanubeAgentStaging";
function App() {
  const [room] = useState(() => new Room({}));

  const { type } = useWidgetContext();
  console.log("type", type);
  // const [type, setType] = useState("ravan");

  return (
    <>
      <LiveKitRoom token="" serverUrl="" room={room} connect={false}>
        {/* main danube agent */}
        {type === "ravan" && <RetellaiAgent />}
        {/* danube staging agent */}
        {type === "danubestaging" && <DanubeAgentStaging />}
        {/* thunder agent */}
        {type === "thunder" && <Forkartik />}
        {/* retell agent made on retell */}
        {type === "retell" && <Retelltest />}
      </LiveKitRoom>
    </>
  );
}

export default App;
