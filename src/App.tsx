import Forkartik from "./components/Forkartik";
import Test from "./components/Test";
import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import {
  RoomContext,
  LiveKitRoom,
  ConnectionState,
} from "@livekit/components-react";
import { Room } from "livekit-client";

import { useState } from "react";
function App() {
  const [room] = useState(() => new Room({}));

  const { type } = useWidgetContext();
  // console.log(type);

  return (
    <>
      <LiveKitRoom token="" serverUrl="" room={room} connect={false}>
        {/* <RoomContext.Provider > */}
        {type === "livekit" && <RetellaiAgent />}
        {/* <RetellaiAgent /> */}
        {/* {type === "test" && <Test />} */}
        {/* </RoomContext.Provider> */}
      </LiveKitRoom>
    </>
  );
}

export default App;
