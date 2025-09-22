import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import StudentRegistration from "./pages/StudentRegistration";
import StudentProfile from "./pages/StudentProfile";
import AdminMainLayout from "./pages/AdminMainLayout";
import AdminDashboardMain from "./pages/AdminDashboardMain";
import AdminGroups from "./pages/AdminGroups";
import AdminStudents from "./pages/AdminStudents";
import AdminBookings from "./pages/AdminBookings";
import AdminSettings from "./pages/AdminSettings";

import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetails />} />
        <Route path="/student-registration" element={<StudentRegistration />} />
        <Route path="/students/:id" element={<StudentProfile />} />

              {/* New Admin Dashboard */}
              <Route path="/admin" element={<AdminMainLayout />}>
                <Route index element={<AdminDashboardMain />} />
                <Route path="dashboard" element={<AdminDashboardMain />} />
                <Route path="groups" element={<AdminGroups />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
