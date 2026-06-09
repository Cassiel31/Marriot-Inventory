import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  ArrowLeft,
  Clock3,
  Search,
  FileSpreadsheet,
  FileText
} from "lucide-react";

import * as XLSX
from "xlsx";

import jsPDF
from "jspdf";

import autoTable
from "jspdf-autotable";

import {
  supabase
} from "../lib/supabase";

function History() {

  const navigate =
    useNavigate();

  const [assignments,
    setAssignments] =
    useState([]);

  const [categories,
    setCategories] =
    useState([]);

  const [selectedCategories,
    setSelectedCategories] =
    useState([]);

  const [search,
    setSearch] =
    useState("");

  const [startDate,
    setStartDate] =
    useState("");

  const [endDate,
    setEndDate] =
    useState("");

  const [showExportModal,
    setShowExportModal] =
    useState(false);

  const [selectedFields,
    setSelectedFields] =
    useState([

      "serial_number",
      "category",
      "make",
      "model",
      "assigned_to",
      "department",
      "assigned_by",
      "date_assigned",
      "warranty_period",
      "warranty_end_date"
    ]);

  useEffect(() => {

    fetchAssignments();

    fetchCategories();

  }, []);

  async function fetchAssignments() {

    const { data } =
      await supabase
        .from("assignments")
        .select("*");

    if (data) {

      setAssignments(data);
    }
  }

  async function fetchCategories() {

    const { data } =
      await supabase
        .from("categories")
        .select("*")
        .order("category");

    if (data) {

      setCategories(data);
    }
  }

  function toggleField(field) {

    if (
      selectedFields.includes(field)
    ) {

      setSelectedFields(

        selectedFields.filter(
          (f) => f !== field
        )
      );

    } else {

      setSelectedFields([
        ...selectedFields,
        field
      ]);
    }
  }

  function toggleCategory(category) {

    if (
      selectedCategories.includes(
        category
      )
    ) {

      setSelectedCategories(

        selectedCategories.filter(
          (item) =>
            item !== category
        )
      );

    } else {

      setSelectedCategories([
        ...selectedCategories,
        category
      ]);
    }
  }

  function formatDate(date) {

    if (!date) {

      return "N/A";
    }

    return new Date(date)
      .toLocaleDateString(
        "en-GB"
      );
  }

  function calculateWarrantyLeft(
    warrantyEndDate
  ) {

    if (!warrantyEndDate) {

      return "N/A";
    }

    const today =
      new Date();

    const expiry =
      new Date(
        warrantyEndDate
      );

    const diff =
      expiry - today;

    if (diff <= 0) {

      return "Expired";
    }

    const days =
      Math.floor(
        diff / (1000 * 60 * 60 * 24)
      );

    const months =
      Math.floor(days / 30);

    const years =
      Math.floor(months / 12);

    const remainingMonths =
      months % 12;

    if (years > 0) {

      return `${years}y ${remainingMonths}m left`;
    }

    return `${months}m left`;
  }

  function convertToDate(dateString) {

    if (!dateString) return null;

    const parts =
      dateString.split("/");

    if (parts.length !== 3)
      return null;

    return new Date(
      `${parts[2]}-${parts[1]}-${parts[0]}`
    );
  }

  const filteredAssignments =

    assignments

      .filter((item) =>

        selectedCategories.length === 0

        ?

        true

        :

        selectedCategories.includes(
          item.category
        )
      )

      .filter((item) => {

        const itemDate =
          convertToDate(
            item.date_assigned
          );

        const start =
          startDate
          ? new Date(startDate)
          : null;

        const end =
          endDate
          ? new Date(endDate)
          : null;

        if (
          start &&
          itemDate &&
          itemDate < start
        ) {

          return false;
        }

        if (
          end &&
          itemDate &&
          itemDate > end
        ) {

          return false;
        }

        return true;
      })

      .filter((item) =>

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

        item.assigned_to
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        item.department
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

  function exportExcel() {

    const exportData =

      filteredAssignments.map((item) => {

        const row = {};

        selectedFields.forEach((field) => {

          row[field] = item[field];
        });

        return row;
      });

    const worksheet =
      XLSX.utils.json_to_sheet(
        exportData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Assignment_History"
    );

    XLSX.writeFile(
      workbook,
      "Assignment_History.xlsx"
    );
  }

  function exportPDF() {

    const doc =
      new jsPDF();

    doc.setFontSize(22);

    doc.text(
      "Goa Marriott Assignment History",
      14,
      20
    );

    const headers = [

      selectedFields.map((field) =>

        field
          .replaceAll("_"," ")
          .toUpperCase()
      )
    ];

    const rows =

      filteredAssignments.map((item) =>

        selectedFields.map(
          (field) => item[field]
        )
      );

    autoTable(doc, {

      startY:30,

      head:headers,

      body:rows,

      styles:{
        fontSize:10
      },

      headStyles:{
        fillColor:[104,138,101]
      },

      alternateRowStyles:{
        fillColor:[245,248,239]
      }
    });

    doc.save(
      "Assignment_History.pdf"
    );
  }

  return (

    <div className="stock-page">

      <button
        className="back-button"

        onClick={() =>
          navigate("/dashboard")
        }
      >

        <ArrowLeft size={18} />

        Back

      </button>

      <div className="stock-top">

        <p className="dashboard-tag">

          GOA MARRIOTT

        </p>

        <h1 className="stock-title">

          Assignment
          <br />
          History

        </h1>

        <p className="stock-subtitle">

          Warranty tracking,
          assignment records
          and export management.

        </p>

      </div>

      <div className="stock-table-section">

        <div className="inventory-toolbar">

          <div className="inventory-toolbar-left">

            <h2 className="table-title">

              Assignment Records

            </h2>

            <p className="inventory-toolbar-subtitle">

              Search, filter and manage assignment history.

            </p>

          </div>

          <button
            className="inventory-button export-main-btn"

            onClick={() =>
              setShowExportModal(true)
            }
          >

            <FileSpreadsheet size={18} />

            Export Options

          </button>

        </div>

        <div className="stock-table-top">

          <div className="category-search table-search">

            <Search size={18} />

            <input
              type="text"

              className="category-input"

              placeholder="Search serial number, users, departments or models..."

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div className="history-table-wrapper">

          <table className="history-table">

            <thead>

              <tr>

                {

                  selectedFields.includes(
                    "serial_number"
                  ) && (
                    <th>
                      Serial Number
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "category"
                  ) && (
                    <th>
                      Category
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "make"
                  ) && (
                    <th>
                      Make
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "model"
                  ) && (
                    <th>
                      Model
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "assigned_to"
                  ) && (
                    <th>
                      Assigned To
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "department"
                  ) && (
                    <th>
                      Department
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "assigned_by"
                  ) && (
                    <th>
                      Assigned By
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "date_assigned"
                  ) && (
                    <th>
                      Date Assigned
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "warranty_period"
                  ) && (
                    <th>
                      Warranty
                    </th>
                  )
                }

                {

                  selectedFields.includes(
                    "warranty_end_date"
                  ) && (
                    <th>
                      Remaining
                    </th>
                  )
                }

              </tr>

            </thead>

            <tbody>

              {

                filteredAssignments.length === 0

                ?

                (

                  <tr>

                    <td
                      colSpan="10"
                      className="empty-history"
                    >

                      No assignment history found.

                    </td>

                  </tr>

                )

                :

                filteredAssignments.map(
                  (item,index) => (

                    <tr key={index}>

                      {

                        selectedFields.includes(
                          "serial_number"
                        ) && (
                          <td>
                            {
                              item.serial_number
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "category"
                        ) && (
                          <td>
                            {
                              item.category
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "make"
                        ) && (
                          <td>
                            {
                              item.make
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "model"
                        ) && (
                          <td>
                            {
                              item.model
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "assigned_to"
                        ) && (
                          <td>
                            {
                              item.assigned_to
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "department"
                        ) && (
                          <td>
                            {
                              item.department
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "assigned_by"
                        ) && (
                          <td>
                            {
                              item.assigned_by
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "date_assigned"
                        ) && (
                          <td>
                            {
                              item.date_assigned
                            }
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "warranty_period"
                        ) && (

                          <td>

                            <div
                              style={{
                                display:"flex",
                                flexDirection:"column",
                                gap:"4px"
                              }}
                            >

                              <span className="material-chip">

                                {
                                  item.warranty_period
                                }

                              </span>

                              <span
                                style={{
                                  fontSize:"12px",
                                  color:"#7B8471"
                                }}
                              >

                                Ends:

                                {" "}

                                {
                                  formatDate(
                                    item.warranty_end_date
                                  )
                                }

                              </span>

                            </div>

                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "warranty_end_date"
                        ) && (

                          <td>

                            <div
                              style={{
                                display:"flex",
                                alignItems:"center",
                                gap:"8px"
                              }}
                            >

                              <Clock3 size={15} />

                              {

                                calculateWarrantyLeft(
                                  item.warranty_end_date
                                )
                              }

                            </div>

                          </td>
                        )
                      }

                    </tr>

                  ))
              }

            </tbody>

          </table>

        </div>

      </div>

      {

        showExportModal && (

          <div className="category-modal">

            <div className="category-modal-box export-modal">

              <button
                className="close-modal"

                onClick={() =>
                  setShowExportModal(false)
                }
              >

                <ArrowLeft size={18} />

              </button>

              <h2 className="export-title">

                Export Assignment History

              </h2>

              <div className="export-section">

                <p className="filter-title">

                  Categories

                </p>

                <div className="category-checkboxes">

                  {

                    categories.map(
                      (cat,index) => (

                        <label
                          key={index}

                          className="category-checkbox"
                        >

                          <input
                            type="checkbox"

                            checked={

                              selectedCategories.includes(
                                cat.category
                              )
                            }

                            onChange={() =>
                              toggleCategory(
                                cat.category
                              )
                            }
                          />

                          <span>

                            {
                              cat.category
                            }

                          </span>

                        </label>

                      ))
                  }

                </div>

              </div>

              <div className="export-section">

                <p className="filter-title">

                  Date Range

                </p>

                <div className="export-date-grid">

                  <input
                    type="date"

                    className="auth-input"

                    value={startDate}

                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="date"

                    className="auth-input"

                    value={endDate}

                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div className="export-section">

                <p className="filter-title">

                  Visible Columns

                </p>

                <div className="category-dropdown">

                  {

                    [

                      "serial_number",
                      "category",
                      "make",
                      "model",
                      "assigned_to",
                      "department",
                      "assigned_by",
                      "date_assigned",
                      "warranty_period",
                      "warranty_end_date"
                    ]

                    .map((field,index) => (

                      <button
                        key={index}

                        className={

                          selectedFields.includes(field)

                          ?

                          "category-option active-icon"

                          :

                          "category-option"
                        }

                        onClick={() =>
                          toggleField(field)
                        }
                      >

                        {
                          field.replaceAll("_"," ")
                        }

                      </button>

                    ))
                  }

                </div>

              </div>

              <div className="export-buttons-row">

                <button
                  className="inventory-button export-btn"

                  onClick={exportExcel}
                >

                  <FileSpreadsheet size={18} />

                  Export Excel

                </button>

                <button
                  className="inventory-button export-btn"

                  onClick={exportPDF}
                >

                  <FileText size={18} />

                  Export PDF

                </button>

              </div>

            </div>

          </div>

        )
      }

    </div>

  );
}

export default History;