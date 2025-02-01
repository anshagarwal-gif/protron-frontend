import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box } from "@mui/material";
import TimesheetDashboard from "./components/TimesheetDashboard.jsx";
import Sidebar from "./components/Sidebar.jsx"

export default function App() {
  return (

    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Your main content here */}
        <Routes>
          <Route path="/" element={<>Home</>} />
          <Route path="/timesheet" element={<TimesheetDashboard />} />
        </Routes>
      </Box>
    </Box>

  );
}
