import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import TimesheetDashboard from "./components/TimesheetDashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LoginPage from "./Pages/Login.jsx";
import ManagerDashboard from "./components/ManagerDashboard.jsx";

const App = () => {
  const location = useLocation();

  // Check if the current route is the login page
  const isLoginPage = location.pathname === "/";

  return (
    <Box sx={{ display: "flex" }}>
      {!isLoginPage && <Sidebar />} {/* Render Sidebar only if not on the login page */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/timesheet" element={<TimesheetDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default App;
