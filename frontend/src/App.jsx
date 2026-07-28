import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Authentication from "./pages/Authentication";
import {AuthProvider} from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
