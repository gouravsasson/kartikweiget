import Forkartik from "./components/Forkartik";
import Test from "./components/Test";
import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import {
  RoomContext,
  LiveKitRoom,
  ConnectionState,
} from "@livekit/components-react";
import { useState } from "react";
function App() {
  const { type } = useWidgetContext();
  // console.log(type);

  return (
    <>
      {type === "livekit" && <RetellaiAgent />}
      {/* <RetellaiAgent /> */}
      {/* {type === "test" && <Test />} */}
    </>
  );
}

export default App;
