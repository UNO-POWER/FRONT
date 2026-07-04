import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Lobby from "./pages/Lobby.jsx";
import Partida from "./pages/Partida.jsx";
import Cuenta from "./pages/Cuenta.jsx";
import Stats from "./pages/Stats.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/cuenta" element={<Cuenta />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/sala/:codigo" element={<Lobby />} />
      <Route path="/partida/:codigo" element={<Partida />} />
    </Routes>
  );
}
