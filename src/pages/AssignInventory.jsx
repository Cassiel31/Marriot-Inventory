import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Laptop,
  Monitor,
  Printer,
  Router,
  Tablet,
  Package,
  ChevronDown
} from "lucide-react";

import { supabase } from "../lib/supabase";

function AssignInventory() {

  const navigate = useNavigate();

  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [expandedSerial, setExpandedSerial] = useState("");

  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const [dateAssigned, setDateAssigned] = useState("");

  useEffect(() => {

    fetchInventory();
    fetchUsers();

  }, []);

  async function fetchInventory() {

    const { data } = await supabase
      .from("inventory_items")
      .select("*")
      .order("category");

    if (data) {
      setInventory(data);
    }
  }

  async function fetchUsers() {

    const { data } = await supabase
      .from("users")
      .select("*")
      .order("username");

    if (data) {
      setUsers(data);
    }
  }

  function getIcon(category) {

    switch (category) {

      case "Laptop":
        return <Laptop size={22} />;

      case "PC":
        return <Monitor size={22} />;

      case "Printer":
        return <Printer size={22} />;

      case "Router":
        return <Router size={22} />;

      case "POS":
        return <Tablet size={22} />;

      default:
        return <Package size={22} />;
    }
  }

  function formatDate(value) {

    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 4) {
      return `${numbers.slice(0,2)}/${numbers.slice(2)}`;
    }

    return `${numbers.slice(0,2)}/${numbers.slice(2,4)}/${numbers.slice(4,8)}`;
  }

  async function assignInventory(item) {

    if (
      !assignedTo ||
      !department ||
      !assignedBy ||
      !dateAssigned
    ) {

      alert("Fill all fields");
      return;
    }

    const { error } = await supabase
      .from("assignments")
      .insert([{

        serial_number: item.serial_number,

        category: item.category,

        make: item.make,

        model: item.model,

        material_type: item.material_type,

        assigned_to: assignedTo,

        department: department,

        assigned_by: assignedBy,

        date_assigned: dateAssigned,

        warranty_period: item.warranty_period,

        warranty_end_date: item.warranty_end_date,

        invoice_url: item.invoice_file,

        notes: item.notes

      }]);

    if (error) {

      alert(error.message);

      return;
    }

    await supabase
      .from("inventory_items")
      .delete()
      .eq(
        "serial_number",
        item.serial_number
      );

    alert("Inventory Assigned");

    setExpandedSerial("");

    setAssignedTo("");
    setDepartment("");
    setAssignedBy("");
    setDateAssigned("");

    fetchInventory();
  }

  const filteredInventory =

    search.trim() === ""

    ?

    []

    :

    inventory.filter((item) =>

      item.serial_number
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.make
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.model
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.material_type
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      item.category
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <div className="assign-page">

      <button
        className="back-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >

        <ArrowLeft size={18} />

        Back

      </button>

      <div className="assign-header">

        <p className="assign-mini">
          GOA MARRIOTT
        </p>

        <h1 className="assign-title">

          Assign
          <br />
          Inventory

        </h1>

        <p className="assign-subtitle">

          Search inventory by serial number, make, model or material type.

        </p>

      </div>

      <div className="assign-search">

        <Search
          size={20}
          color="#6F8F67"
        />

        <input
          type="text"

          placeholder="Search serial number, make or model..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {

        search.trim() !== "" &&
        filteredInventory.length === 0 && (

          <div className="assign-empty">

            <Package size={42} />

            <p>
              No inventory found.
            </p>

          </div>

        )
      }

      <div className="assign-rows">

        {

          filteredInventory.map((item,index) => (

            <div
              className="assign-row-wrapper"
              key={index}
            >

              <button
                className="assign-row-clean"

                onClick={() =>

                  setExpandedSerial(

                    expandedSerial ===
                    item.serial_number

                    ?

                    ""

                    :

                    item.serial_number
                  )
                }
              >

                <div className="assign-row-left">

                  <div className="assign-icon-small">

                    {
                      getIcon(
                        item.category
                      )
                    }

                  </div>

                  <div>

                    <div className="assign-row-serial">

                      {
                        item.serial_number
                      }

                    </div>

                    <div className="assign-row-name">

                      {
                        item.make
                      }

                      {" "}

                      {
                        item.model
                      }

                    </div>

                  </div>

                </div>

                <div className="assign-row-right">

                  <span className="assign-warranty">

                    Ends:

                    {" "}

                    {
                      item.warranty_end_date || "—"
                    }

                  </span>

                  <ChevronDown size={18} />

                </div>

              </button>

              {

                expandedSerial ===
                item.serial_number && (

                  <div className="assign-expand-clean">

                    <div className="assign-form-grid">

                      <div className="assign-field">

                        <label>
                          Assigned To
                        </label>

                        <input
                          type="text"

                          placeholder="Employee Name"

                          value={assignedTo}

                          onChange={(e) =>
                            setAssignedTo(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="assign-field">

                        <label>
                          Department
                        </label>

                        <input
                          type="text"

                          placeholder="Department"

                          value={department}

                          onChange={(e) =>
                            setDepartment(
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="assign-field">

                        <label>
                          Assigned By
                        </label>

                        <select
                          value={assignedBy}

                          onChange={(e) =>
                            setAssignedBy(
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Select User
                          </option>

                          {

                            users.map((user,index) => (

                              <option
                                key={index}

                                value={
                                  user.username
                                }
                              >

                                {
                                  user.username
                                }

                              </option>

                            ))
                          }

                        </select>

                      </div>

                      <div className="assign-field">

                        <label>
                          Date Assigned
                        </label>

                        <input
                          type="text"

                          placeholder="dd/mm/yyyy"

                          maxLength={10}

                          value={dateAssigned}

                          onChange={(e) =>
                            setDateAssigned(
                              formatDate(
                                e.target.value
                              )
                            )
                          }
                        />

                      </div>

                    </div>

                    <button
                      className="assign-btn"

                      onClick={() =>
                        assignInventory(
                          item
                        )
                      }
                    >

                      Assign Inventory

                    </button>

                  </div>

                )
              }

            </div>

          ))
        }

      </div>

    </div>
  );
}

export default AssignInventory;