// Dashboard.jsx

import {
  PackagePlus,
  Boxes,
  ClipboardList,
  History
} from "lucide-react";

import {
  Link
} from "react-router-dom";

function Dashboard() {

  return (

    <div className="dashboard-page">

      <div className="dashboard-top">

        <p className="dashboard-tag">

          GOA MARRIOTT

        </p>

        <h1 className="dashboard-title">

          Inventory
          <br />
          Dashboard

        </h1>

        <p className="dashboard-subtitle">

          Manage inventory,
          assignments and
          stock records.

        </p>

      </div>

      <div className="dashboard-grid">

        <Link
          to="/add-inventory"

          className="dashboard-card"
        >

          <PackagePlus size={54} />

          <h2>

            Add
            Inventory

          </h2>

          <p>

            Add new assets,
            invoices and
            inventory records.

          </p>

        </Link>

        <Link
          to="/current-stock"

          className="dashboard-card"
        >

          <Boxes size={54} />

          <h2>

            Current
            Stock

          </h2>

          <p>

            View live inventory
            counts and available
            stock records.

          </p>

        </Link>

        <Link
          to="/assign-inventory"

          className="dashboard-card"
        >

          <ClipboardList size={54} />

          <h2>

            Assign
            Inventory

          </h2>

          <p>

            Assign devices
            and assets to
            departments.

          </p>

        </Link>

        <Link
          to="/history"

          className="dashboard-card"
        >

          <History size={54} />

          <h2>

            Assignment
            History

          </h2>

          <p>

            View assigned
            inventory and
            warranty tracking.

          </p>

        </Link>

      </div>

    </div>

  );
}

export default Dashboard;