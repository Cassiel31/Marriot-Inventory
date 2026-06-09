import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Upload, FileText, Check } from "lucide-react";
import { supabase } from "../lib/supabase";

function AddInventory() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showCategoryDropdown, setShowCategoryDropdown] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [serialNumber, setSerialNumber] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [receivedDate, setReceivedDate] =
    useState("");

  const [receivedBy, setReceivedBy] =
    useState("");

  const [make, setMake] =
    useState("");

  const [model, setModel] =
    useState("");

  const [materialType, setMaterialType] =
    useState("");

  const [warrantyPeriod, setWarrantyPeriod] =
    useState("");

  const [warrantyEndDate, setWarrantyEndDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [invoiceFile, setInvoiceFile] =
    useState(null);

  useEffect(() => {

    fetchData();

  }, []);

  async function fetchData() {

    const { data: usersData } =
      await supabase
        .from("users")
        .select("*")
        .order("username");

    if (usersData) {

      setUsers(usersData);
    }

    const { data: categoryData } =
      await supabase
        .from("categories")
        .select("*")
        .order("category");

    if (categoryData) {

      setCategories(categoryData);
    }
  }

  function formatDateInput(value) {

    let cleaned =
      value.replace(/\D/g, "");

    if (cleaned.length >= 3) {

      cleaned =
        cleaned.slice(0, 2) +
        "/" +
        cleaned.slice(2);
    }

    if (cleaned.length >= 6) {

      cleaned =
        cleaned.slice(0, 5) +
        "/" +
        cleaned.slice(5);
    }

    return cleaned;
  }

  function convertWarrantyDate(date) {

    if (!date) return null;

    const parts =
      date.split("/");

    if (parts.length !== 3)
      return null;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  async function addInventory() {

    setLoading(true);

    let invoiceUrl = "";

    try {

      /* FILE */

      if (invoiceFile) {

        const fileName =
          `${Date.now()}-${invoiceFile.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("invoices")
            .upload(fileName, invoiceFile);

        if (uploadError) {

          console.log(uploadError);

        } else {

          const { data } =
            supabase.storage
              .from("invoices")
              .getPublicUrl(fileName);

          invoiceUrl =
            data.publicUrl;
        }
      }

      /* INSERT */

      const { error } =
        await supabase
          .from("inventory_items")
          .insert([{

            serial_number:
              serialNumber,

            category:
              category,

            date_of_purchase:
              purchaseDate,

            received_date:
              receivedDate,

            received_by:
              receivedBy,

            make:
              make,

            model:
              model,

            material_type:
              materialType,

            warranty_period:
              warrantyPeriod,

            warranty_end_date:
              convertWarrantyDate(
                warrantyEndDate
              ),

            invoice_file:
              invoiceUrl,

            notes:
              notes

          }]);

      if (error) {

        console.log(error);

        alert(
          error.message
        );

        setLoading(false);

        return;
      }

      setShowSuccess(true);

      /* RESET */

      setSerialNumber("");
      setCategory("");
      setPurchaseDate("");
      setReceivedDate("");
      setReceivedBy("");
      setMake("");
      setModel("");
      setMaterialType("");
      setWarrantyPeriod("");
      setWarrantyEndDate("");
      setNotes("");
      setInvoiceFile(null);

      setTimeout(() => {

        setShowSuccess(false);

      }, 3000);

    } catch (err) {

      console.log(err);

      alert(
        "Something went wrong"
      );

    }

    setLoading(false);
  }

  return (

    <div className="add-page">

      {

        showSuccess && (

          <div className="success-toast">

            <div className="success-icon">

              <Check size={18} />

            </div>

            <div>

              <h4>
                Inventory Saved
              </h4>

              <p>
                Asset added successfully
              </p>

            </div>

          </div>
        )
      }

      <button
        className="back-button"
        onClick={() =>
          navigate("/dashboard")
        }
      >

        ← Back

      </button>

      <div className="add-layout">

        <div className="add-left">

          <p className="add-mini-title">

            GOA MARRIOTT

          </p>

          <h1 className="add-title">

            Add
            <br />
            Inventory

          </h1>

          <p className="add-description">

            Add inventory assets,
            invoices and stock
            records into the
            management system.

          </p>

        </div>

        <div className="add-card">

          <div className="form-grid">

            <div className="form-group">

              <label>
                Serial Number
              </label>

              <input
                type="text"
                className="modern-input"
                placeholder=" "
                value={serialNumber}
                onChange={(e) =>
                  setSerialNumber(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Category
              </label>

              <div className="custom-dropdown">

                <button
                  type="button"
                  className="custom-dropdown-trigger"
                  onClick={() =>
                    setShowCategoryDropdown(
                      !showCategoryDropdown
                    )
                  }
                >

                  <div className="dropdown-left">

                    <Search size={16} />

                    <span>

                      {
                        category ||
                        "Select Category"
                      }

                    </span>

                  </div>

                  <span>
                    ▾
                  </span>

                </button>

                {

                  showCategoryDropdown && (

                    <div className="custom-dropdown-menu">

                      {

                        categories.map(
                          (item, index) => (

                            <button
                              key={index}
                              type="button"
                              className="custom-dropdown-item"
                              onClick={() => {

                                setCategory(
                                  item.category
                                );

                                setShowCategoryDropdown(
                                  false
                                );
                              }}
                            >

                              {item.category}

                            </button>
                          ))
                      }

                      <button
                        type="button"
                        className="custom-dropdown-add"
                        onClick={async () => {

                          const newCat =
                            prompt(
                              "Enter new category"
                            );

                          if (!newCat) return;

                          await supabase
                            .from("categories")
                            .insert([{
                              category: newCat
                            }]);

                          fetchData();

                          setCategory(
                            newCat
                          );

                          setShowCategoryDropdown(
                            false
                          );
                        }}
                      >

                        + Add New Category

                      </button>

                    </div>
                  )
                }

              </div>

            </div>

            <div className="form-group">

              <label>
                Date Of Purchase
              </label>

              <input
                type="text"
                className="modern-input"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={purchaseDate}
                onChange={(e) =>
                  setPurchaseDate(
                    formatDateInput(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Received Date
              </label>

              <input
                type="text"
                className="modern-input"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={receivedDate}
                onChange={(e) =>
                  setReceivedDate(
                    formatDateInput(
                      e.target.value
                    )
                  )
                }
              />

            </div>

            <div className="form-group">

              <label> 
                Received By
              </label>

              <select
                className="modern-input clean-select"
                value={receivedBy}
                onChange={(e) =>
                  setReceivedBy(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select User
                </option>

                {

                  users.map(
                    (user, index) => (

                      <option
                        key={index}
                        value={
                          user.username
                        }
                      >

                        {

                          user.name ||
                          user.username
                        }

                      </option>
                    ))
                }

              </select>

            </div>

            <div className="form-group">

              <label>
                Make
              </label>

              <input
                type="text"
                className="modern-input"
                value={make}
                onChange={(e) =>
                  setMake(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Model
              </label>

              <input
                type="text"
                className="modern-input"
                value={model}
                onChange={(e) =>
                  setModel(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Material Type
              </label>

              <input
                type="text"
                className="modern-input"
                value={materialType}
                onChange={(e) =>
                  setMaterialType(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Warranty Period
              </label>

              <input
                type="text"
                className="modern-input"
                placeholder="Example: 3 Years"
                value={warrantyPeriod}
                onChange={(e) =>
                  setWarrantyPeriod(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Warranty Ends On
              </label>

              <input
                type="text"
                className="modern-input"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={warrantyEndDate}
                onChange={(e) =>
                  setWarrantyEndDate(
                    formatDateInput(
                      e.target.value
                    )
                  )
                }
              />

            </div>

          </div>

          <div className="form-group full-width">

            <label>
              Upload Invoice
            </label>

            <label className="upload-box">

              <input
                type="file"
                hidden
                accept=".pdf,image/*"
                onChange={(e) =>
                  setInvoiceFile(
                    e.target.files[0]
                  )
                }
              />

              <div className="upload-inner">

                <div className="upload-icon">

                  <Upload size={18} />

                </div>

                <div>

                  <p className="upload-title">

                    {

                      invoiceFile

                        ?

                        invoiceFile.name

                        :

                        "Upload PDF or Image"
                    }

                  </p>

                  <span className="upload-subtitle">

                    JPG, PNG or PDF

                  </span>

                </div>

              </div>

            </label>

          </div>

          <div className="form-group full-width">

            <label>
              Notes
            </label>

            <textarea
              className="modern-textarea"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
            />

          </div>

          <button
            className="save-btn"
            onClick={addInventory}
            disabled={loading}
          >

            <FileText size={16} />

            {

              loading

                ?

                "Saving..."

                :

                "Save Inventory"
            }

          </button>

        </div>

      </div>

    </div>
  );
}

export default AddInventory;