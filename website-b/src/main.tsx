import ReactDOM from "react-dom/client";
import App from "./App";
import { AppTestBroadcast } from "./AppTestBroadcast";

if (window.location.pathname === "/test-broadcast") {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <AppTestBroadcast />
  );
} else {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
}
