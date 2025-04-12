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

  return <>{type === "livekit" && <RetellaiAgent />}</>;
}

export default App;
