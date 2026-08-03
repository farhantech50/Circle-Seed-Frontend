import AppRoutes from "./routes/AppRoutes";
import { deviceTypeStore } from "./store/deviceTypeStore";

function App() {
  const { osType, browserType, platformType } = deviceTypeStore();
  return (
    <>
      <AppRoutes />
    </>
  );
}

export default App;
