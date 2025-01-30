import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { TaskProvider } from "./TaskContext.jsx";
import Manager from "./Pages/Manager";
import { User } from "./Pages/user";
import TimesheetDashboard from "./components/TimesheetDashboard.jsx";
import ManagerDashboard from "./components/ManagerDashboard.jsx";

export default function App() {
  return (
    <TaskProvider>
      {/* <Router> */}
        {/* <nav className="bg-gray-200 p-4">
          <Link to="/user" className="mr-4 text-blue-500">User Page</Link>
          <Link to="/manager" className="text-blue-500">Manager Page</Link>
        </nav> */}
        <Routes>
          {/* <Route path="/user" element={<User />} />
          <Route path="/manager" element={<Manager />} /> */}
          <Route path="/" element={<TimesheetDashboard/>}/>
          <Route path="/manager" element={<ManagerDashboard/>}/>
        </Routes>
      {/* </Router> */}
    </TaskProvider>
  );
}
