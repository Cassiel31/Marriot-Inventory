// App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Dashboard
from "./pages/Dashboard";

import AddInventory
from "./pages/AddInventory";

import CurrentStock
from "./pages/CurrentStock";

import AssignInventory
from "./pages/AssignInventory";

import History
from "./pages/History";

import "./style.css";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"

          element={
            <Navigate
              to="/dashboard"
            />
          }
        />

        <Route
          path="/dashboard"

          element={<Dashboard />}
        />

        <Route
          path="/add-inventory"

          element={
            <AddInventory />
          }
        />

        <Route
          path="/current-stock"

          element={
            <CurrentStock />
          }
        />

        <Route
          path="/assign-inventory"

          element={
            <AssignInventory />
          }
        />

        <Route
          path="/history"

          element={<History />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;