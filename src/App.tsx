import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { AlertsPage } from "./pages/AlertsPage";
import { LocationsPage } from "./pages/LocationsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <div className="flex">
              <Sidebar />
              <Routes>
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/" element={<Navigate to="/alerts" replace />} />
              </Routes>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

