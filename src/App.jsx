import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Lobby from "./pages/Lobby.jsx";
import Cuenta from "./pages/Cuenta.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/cuenta" element={<Cuenta />} />
      <Route path="/sala/:codigo" element={<Lobby />} />
    </Routes>
  );
}
