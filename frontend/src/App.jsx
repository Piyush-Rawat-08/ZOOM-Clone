import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Authentication from "./pages/Authentication";
import {AuthProvider} from "./contexts/AuthContext";
import VideoMeet from "./pages/videoMeet";
import VideoMeetRefactored from "./pages/videoMeetRefactored";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/:url" element={<VideoMeetRefactored/>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
