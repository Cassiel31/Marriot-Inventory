import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import * as Icons from "lucide-react";

import {
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  TriangleAlert,
  X,
  ChevronDown,
  Plus,
  Trash2,
  Package
} from "lucide-react";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  supabase
} from "../lib/supabase";

function CurrentStock() {

  const navigate = useNavigate();

  const [inventory,setInventory] =
    useState([]);

  const [allCategories,
    setAllCategories] =
    useState([]);

  const [inventoryCounts,
    setInventoryCounts] =
    useState({});

  const [tableSearch,
    setTableSearch] =
    useState("");

  const [showCategoryDropdown,
    setShowCategoryDropdown] =
    useState(false);

  const [showFieldsDropdown,
    setShowFieldsDropdown] =
    useState(false);

  const [showWarrantyPopup,
    setShowWarrantyPopup] =
    useState(false);

  const [showAddCategory,
    setShowAddCategory] =
    useState(false);

  const [selectedCategories,
    setSelectedCategories] =
    useState([]);

  const [selectedFields,
    setSelectedFields] =
    useState([
      "serial_number",
      "category",
      "make",
      "model",
      "warranty_period",
      "warranty_end_date"
    ]);

  const [availableCategories,
    setAvailableCategories] =
    useState([]);

  const [newCategory,
    setNewCategory] =
    useState("");

  const [selectedIcon,
    setSelectedIcon] =
    useState("Package");

  const iconOptions = [

    "Laptop",
    "Monitor",
    "Printer",
    "Router",
    "Package",
    "Server",
    "HardDrive",
    "Wifi",
    "Tablet",
    "Smartphone",
    "Database",
    "Cpu",
    "Cable",
    "Tv",
    "Boxes"

  ];

  useEffect(() => {

    fetchData();

  }, []);

  async function fetchData() {

    const {
      data:categoryData
    } = await supabase
      .from("categories")
      .select("*")
      .order("category");

    if (categoryData) {

      setAllCategories(
        categoryData
      );

      const hiddenCategories =
        categoryData.filter(
          (item) =>
            !item.icon
        );

      setAvailableCategories(
        hiddenCategories
      );
    }

    const {
      data:inventoryData
    } = await supabase
      .from("inventory_items")
      .select("*")
      .order("category");

    if (!inventoryData) return;

    setInventory(
      inventoryData
    );

    const counts = {};

    categoryData?.forEach((cat) => {

      counts[
        cat.category
          ?.trim()
          .toLowerCase()
      ] = 0;

    });

    inventoryData.forEach((item) => {

      const normalizedCategory =
        item.category
          ?.trim()
          .toLowerCase();

      if (!counts[normalizedCategory]) {

        counts[normalizedCategory] = 0;
      }

      counts[normalizedCategory] += 1;
    });

    setInventoryCounts(counts);
  }

  function getWarrantyStatus(date) {

    if (!date) {

      return {
        label:"Unknown",
        color:"#CFCFCF",
        priority:5
      };
    }

    const today =
      new Date();

    const expiry =
      new Date(date);

    const diff =
      expiry - today;

    const days =
      Math.floor(
        diff /
        (1000 * 60 * 60 * 24)
      );

    if (days < 0) {

      return {
        label:"Expired",
        color:"#D98E9C",
        priority:1
      };
    }

    if (days <= 30) {

      return {
        label:"Critical",
        color:"#E7B4B4",
        priority:2
      };
    }

    if (days <= 90) {

      return {
        label:"Warning",
        color:"#E7D28B",
        priority:3
      };
    }

    return {
      label:"Healthy",
      color:"#90AD89",
      priority:4
    };
  }

  const filteredInventory =

    inventory

      .filter((item) =>

        selectedCategories.length === 0

        ?

        true

        :

        selectedCategories.includes(
          item.category
        )
      )

      .filter((item) =>

        item.serial_number
          ?.toLowerCase()
          .includes(
            tableSearch.toLowerCase()
          )

        ||

        item.category
          ?.toLowerCase()
          .includes(
            tableSearch.toLowerCase()
          )

        ||

        item.make
          ?.toLowerCase()
          .includes(
            tableSearch.toLowerCase()
          )

        ||

        item.model
          ?.toLowerCase()
          .includes(
            tableSearch.toLowerCase()
          )
      );

  const warningItems =

    inventory

      .filter((item) => {

        const status =
          getWarrantyStatus(
            item.warranty_end_date
          );

        return (
          status.label !==
          "Healthy"
        );
      })

      .sort((a,b) => {

        const statusA =
          getWarrantyStatus(
            a.warranty_end_date
          );

        const statusB =
          getWarrantyStatus(
            b.warranty_end_date
          );

        return (
          statusA.priority -
          statusB.priority
        );
      });

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

  function toggleField(field) {

    if (
      selectedFields.includes(
        field
      )
    ) {

      setSelectedFields(

        selectedFields.filter(
          (item) =>
            item !== field
        )
      );

    } else {

      setSelectedFields([
        ...selectedFields,
        field
      ]);
    }
  }

  async function addCategory() {

    if (!newCategory) return;

    await supabase
      .from("categories")
      .update({
        icon:selectedIcon
      })
      .eq("category",newCategory);

    setShowAddCategory(false);

    fetchData();
  }

  async function deleteCategory(category) {

    await supabase
      .from("categories")
      .update({
        icon:null
      })
      .eq("category",category);

    fetchData();
  }

  function exportExcel() {

    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredInventory
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventory"
    );

    XLSX.writeFile(
      workbook,
      "Current_Stock.xlsx"
    );
  }

  function exportPDF() {

    const doc =
      new jsPDF();

    autoTable(doc, {

      head:[[
        "Serial",
        "Category",
        "Make",
        "Model"
      ]],

      body:

      filteredInventory.map(
        (item) => [

          item.serial_number,
          item.category,
          item.make,
          item.model
        ]
      ),

      headStyles:{
        fillColor:[111,143,103]
      }
    });

    doc.save(
      "Current_Stock.pdf"
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

        ← Back

      </button>

      <div className="top-header">

        <div>

          <p className="page-mini-title">
            GOA MARRIOTT
          </p>

          <h1 className="stock-title">
            Current Stock
          </h1>

        </div>

        <button
          className="warranty-button"

          onClick={() =>
            setShowWarrantyPopup(
              true
            )
          }
        >

          <TriangleAlert size={18} />

          Warranty Alerts

        </button>

      </div>

      <div className="stock-grid">

        {

          allCategories

          .filter((item) =>
            item.icon
          )

          .map((item,index) => {

            const IconComponent =
              Icons[item.icon] ||
              Package;

            return (

              <div
                className="stock-card"
                key={index}
              >

                <button
                  className="delete-category-btn"

                  onClick={() =>
                    deleteCategory(
                      item.category
                    )
                  }
                >

                  <Trash2 size={14} />

                </button>

                <div className="stock-icon">

                  <IconComponent
                    size={28}
                  />

                </div>

                <h2 className="stock-count">

                  {

                    inventoryCounts[
                      item.category
                        ?.trim()
                        .toLowerCase()
                    ] || 0
                  }

                </h2>

                <p className="stock-label">

                  {item.category}

                </p>

              </div>
            );
          })
        }

        <div
          className="stock-card add-card"

          onClick={() =>
            setShowAddCategory(
              true
            )
          }
        >

          <Plus size={32} />

          <p>
            Add Category
          </p>

        </div>

      </div>

      {/* TOOLBAR */}

      <div className="toolbar-clean">

        <div className="dropdown-clean">

          <button
            className="toolbar-pill"

            onClick={() =>
              setShowCategoryDropdown(
                !showCategoryDropdown
              )
            }
          >

            Categories

            <ChevronDown size={16} />

          </button>

          {

            showCategoryDropdown && (

              <div className="clean-dropdown-menu">

                {

                  allCategories

                  .filter((item) =>
                    item.icon
                  )

                  .map((cat,index) => (

                    <label
                      key={index}
                      className="clean-option"
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

                      {
                        cat.category
                      }

                    </label>
                  ))
                }

              </div>

            )
          }

        </div>

        <div className="dropdown-clean">

          <button
            className="toolbar-pill"

            onClick={() =>
              setShowFieldsDropdown(
                !showFieldsDropdown
              )
            }
          >

            Visible Fields

            <ChevronDown size={16} />

          </button>

          {

            showFieldsDropdown && (

              <div className="clean-dropdown-menu">

                {

                  [
                    "serial_number",
                    "category",
                    "make",
                    "model",
                    "warranty_period",
                    "warranty_end_date"
                  ]

                  .map((field,index) => (

                    <label
                      key={index}
                      className="clean-option"
                    >

                      <input
                        type="checkbox"

                        checked={

                          selectedFields.includes(
                            field
                          )
                        }

                        onChange={() =>
                          toggleField(
                            field
                          )
                        }
                      />

                      {

                        field.replaceAll(
                          "_",
                          " "
                        )
                      }

                    </label>
                  ))
                }

              </div>

            )
          }

        </div>

        <button
          className="toolbar-export"

          onClick={exportExcel}
        >

          <FileSpreadsheet size={16} />

          Export Excel

        </button>

        <button
          className="toolbar-export"

          onClick={exportPDF}
        >

          <FileText size={16} />

          Export PDF

        </button>

      </div>

      {/* SEARCH */}

      <div className="category-search">

        <Search size={18} />

        <input
          type="text"

          className="category-input"

          placeholder="Search serial number, category, make or model..."

          value={tableSearch}

          onChange={(e) =>
            setTableSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* WARRANTY POPUP */}

      {

        showWarrantyPopup && (

          <div className="warranty-popup-overlay">

            <div className="warranty-popup">

              <div className="warranty-popup-header">

                <div>

                  <p className="popup-mini">
                    WARRANTY TRACKER
                  </p>

                  <h2>
                    Warranty Alerts
                  </h2>

                </div>

                <button
                  className="close-popup-btn"

                  onClick={() =>
                    setShowWarrantyPopup(
                      false
                    )
                  }
                >

                  <X size={20} />

                </button>

              </div>

              <div className="warranty-popup-search">

                <Search size={18} />

                <input
                  type="text"

                  placeholder="Search serial number, make, model or category..."

                  value={tableSearch}

                  onChange={(e) =>
                    setTableSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="warranty-popup-list">

                {

                  warningItems.length === 0

                  ?

                  (

                    <div className="empty-warning">

                      <TriangleAlert
                        size={38}
                      />

                      <p>
                        No warranty alerts
                      </p>

                    </div>

                  )

                  :

                  (

                    warningItems

                    .filter((item) =>

                      item.serial_number
                        ?.toLowerCase()
                        .includes(
                          tableSearch.toLowerCase()
                        )

                      ||

                      item.category
                        ?.toLowerCase()
                        .includes(
                          tableSearch.toLowerCase()
                        )

                      ||

                      item.make
                        ?.toLowerCase()
                        .includes(
                          tableSearch.toLowerCase()
                        )

                      ||

                      item.model
                        ?.toLowerCase()
                        .includes(
                          tableSearch.toLowerCase()
                        )
                    )

                    .map((item,index) => {

                      const status =
                        getWarrantyStatus(
                          item.warranty_end_date
                        );

                      return (

                        <div
                          className="warning-item-card"
                          key={index}
                        >

                          <div
                            className="warning-strip"

                            style={{
                              background:
                              status.color
                            }}
                          />

                          <div className="warning-left">

                            <h3>
                              {
                                item.serial_number
                              }
                            </h3>

                            <p>
                              {
                                item.make
                              }

                              {" "}

                              {
                                item.model
                              }
                            </p>

                            <span>
                              {
                                item.category
                              }
                            </span>

                          </div>

                          <div className="warning-right">

                            <div
                              className="status-pill"

                              style={{
                                background:
                                status.color
                              }}
                            >

                              {
                                status.label
                              }

                            </div>

                            <p>

                              Ends:

                              {" "}

                              {
                                item.warranty_end_date
                              }

                            </p>

                          </div>

                        </div>
                      );
                    })
                  )
                }

              </div>

            </div>

          </div>
        )
      }

      {/* ADD CATEGORY POPUP */}

{

showAddCategory && (

  <div className="category-modal">

    <div className="export-modal">

      <button
        className="close-modal"
        onClick={() =>
          setShowAddCategory(false)
        }
      >

        <X size={18} />

      </button>

      <h2 className="export-title">
        Add Category Card
      </h2>

      <div className="export-section">

        <h3 className="filter-title">
          Select Category
        </h3>

        <select
          className="auth-input"

          value={newCategory}

          onChange={(e) =>
            setNewCategory(
              e.target.value
            )
          }
        >

          <option value="">
            Select Category
          </option>

          {

            allCategories

              .filter(
                cat => !cat.icon
              )

              .map((cat,index) => (

                <option
                  key={index}
                  value={
                    cat.category
                  }
                >

                  {
                    cat.category
                  }

                </option>

              ))
          }

        </select>

      </div>

      <div className="export-section">

        <h3 className="filter-title">
          Choose Icon
        </h3>

        <div className="icon-picker-grid">

  {

    iconOptions.map(
      (icon,index) => {

        const IconComponent =
          Icons[icon] || Package;

        return (

          <button
            key={index}

            type="button"

            className={

              selectedIcon === icon

              ?

              "icon-picker-btn active-icon"

              :

              "icon-picker-btn"
            }

            onClick={() =>
              setSelectedIcon(icon)
            }
          >

            <IconComponent size={24} />

          </button>

        );
      }
    )
  }

</div>

      </div>

      <div className="export-buttons-row">

        <button
          className="export-btn"
          onClick={addCategory}
        >

          Add Category

        </button>

      </div>

    </div>

  </div>

)
}

      {/* TABLE */}

      <div className="history-table-wrapper">

        <table className="history-table">

          <thead>

            <tr>

              {

                selectedFields.includes(
                  "serial_number"
                ) && (
                  <th>Serial</th>
                )
              }

              {

                selectedFields.includes(
                  "category"
                ) && (
                  <th>Category</th>
                )
              }

              {

                selectedFields.includes(
                  "make"
                ) && (
                  <th>Make</th>
                )
              }

              {

                selectedFields.includes(
                  "model"
                ) && (
                  <th>Model</th>
                )
              }

              {

                (
                  selectedFields.includes(
                    "warranty_period"
                  )

                  ||

                  selectedFields.includes(
                    "warranty_end_date"
                  )

                ) && (
                  <th>Warranty</th>
                )
              }

              <th>Status</th>

              <th>Invoice</th>

            </tr>

          </thead>

          <tbody>

            {

              filteredInventory.map(
                (item,index) => {

                  const status =
                    getWarrantyStatus(
                      item.warranty_end_date
                    );

                  return (

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
                            {item.make}
                          </td>
                        )
                      }

                      {

                        selectedFields.includes(
                          "model"
                        ) && (

                          <td>
                            {item.model}
                          </td>
                        )
                      }

                      {

                        (
                          selectedFields.includes(
                            "warranty_period"
                          )

                          ||

                          selectedFields.includes(
                            "warranty_end_date"
                          )

                        ) && (

                          <td>

                            <div className="warranty-col">

                              {

                                selectedFields.includes(
                                  "warranty_period"
                                ) && (

                                  <span className="material-chip">

                                    {
                                      item.warranty_period
                                    }

                                  </span>
                                )
                              }

                              {

                                selectedFields.includes(
                                  "warranty_end_date"
                                ) && (

                                  <span className="warranty-end">

                                    Ends:

                                    {" "}

                                    {
                                      item.warranty_end_date
                                    }

                                  </span>
                                )
                              }

                            </div>

                          </td>
                        )
                      }

                      <td>

                        <div
                          className="status-pill"

                          style={{
                            background:
                            status.color
                          }}
                        >

                          {
                            status.label
                          }

                        </div>

                      </td>

                      <td>

                        {

                          item.invoice_file

                          ?

                          (

                            <a
                              href={
                                item.invoice_file
                              }

                              target="_blank"

                              rel="noreferrer"

                              className="invoice-view-btn"
                            >

                              <Eye size={15} />

                            </a>

                          )

                          :

                          "—"
                        }

                      </td>

                    </tr>
                  );
                })
            }

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default CurrentStock;