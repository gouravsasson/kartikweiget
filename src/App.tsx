import { useWidgetContext } from "./constexts/WidgetContext";
import RetellaiAgent from "./components/RetellaiAgent";
import { LiveKitRoom } from "@livekit/components-react";
import Forkartik from "./components/Forkartik";
import { Room } from "livekit-client";
import Retelltest from "./components/Retelltest";
import { useEffect, useState } from "react";
import DanubeAgentStaging from "./components/DanubeAgentStaging";
import { Analytics } from "@vercel/analytics/react";
import axios from "axios";
function App() {
  useEffect(() => {
    const localCountryCode = localStorage.getItem("countryCode");
    if (!localCountryCode) {
      const fetchIp = async () => {
        const res = await axios.get("https://ipapi.co/json/");
        localStorage.setItem("countryCode", res.data.country_calling_code);
        localStorage.setItem("countryName", res.data.country_name);
        localStorage.setItem("continentcode", res.data.country);
      };
      fetchIp();
    }
  }, []);
  const [room] = useState(() => new Room({}));

  const { type } = useWidgetContext();
  // console.log("type", type);
  // const [type, setType] = useState("danubestaging");

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
      <Analytics />
    </>
  );
}

export default App;
