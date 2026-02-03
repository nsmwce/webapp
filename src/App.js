import React from "react";
import {
  HashRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./pages/home";
import Materials from "./pages/materials";
import Events from "./pages/events";
import Trainings from "./pages/trainings";
import Gallery from "./pages/gallery";
import Contact from "./pages/contact";

const App = () => {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/materials/:topicId" element={<Materials />} />
        <Route path="/events" element={<Events />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
};

export default App;
