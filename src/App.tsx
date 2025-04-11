import Forkartik from "./components/Forkartik";
import Test from "./components/Test";
import { useWidgetContext } from "./constexts/WidgetContext";

function App() {
  const { type } = useWidgetContext();
  return <>{type === "test" && <Test/>}</>;
}

export default App;
