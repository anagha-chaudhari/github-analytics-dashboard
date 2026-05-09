import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Callback from "./Callback";
import Home from "./Home";
import Dashboard from "./Dashboard";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/dashboard" element={<Dashboard/>}/>
    </Routes>
  );
}

export default App;
