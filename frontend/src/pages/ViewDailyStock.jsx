import React, { useState, useEffect } from "react";
import UploadFile from "../components/UploadFile";
import CarryForwardStock from "../components/CarryForwardStock";

const ViewDailyStock = () => {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [stock, setStock] = useState(null);
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editData, setEditData] = useState({ quantity: 0, photo: "" });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteVegId, setDeleteVegId] = useState(null);
    const [showCarryForward, setShowCarryForward] = useState(false);

    // Fetch vegetables for name lookup
    useEffect(() => {
        const fetchVegetables = async () => {
            try {
                const response = await fetch(
                    "https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables"
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch vegetables: ${response.statusText}`);
                }
                const data = await response.json();
                setVegetables(data);
            } catch (err) {
                console.error("Fetch vegetables error:", err);
                setError("Unable to load vegetables. Please try again later.");
            }
        };
        fetchVegetables();
    }, []);

    // Fetch stock for selected date
    useEffect(() => {
        fetchStock();
    }, [date]);

    const fetchStock = async () => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const response = await fetch(
                `https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/${date}`
            );
            if (!response.ok) {
                if (response.status === 404) {
                    setStock(null);
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch stock: ${response.statusText}`);
            }
            const data = await response.json();
            setStock(data);
        } catch (err) {
            console.error("Fetch stock error:", err);
            setError("Failed to load stock. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const startEdit = (index) => {
        setEditIndex(index);
        setEditData({
            quantity: stock.vegetables[index].quantity,
            photo: stock.vegetables[index].photo,
        });
    };

    const handleEditChange = (field, value) => {
        setEditData({ ...editData, [field]: value });
    };

    const saveEdit = async () => {
        if (editData.quantity <= 0) {
            setError("Quantity must be positive");
            return;
        }
        if (!editData.photo) {
            setError("Photo is required");
            return;
        }
        setLoading(true);
        try {
            const updatedVegs = [...stock.vegetables];
            updatedVegs[editIndex] = {
                ...updatedVegs[editIndex],
                quantity: Number(editData.quantity),
                photo: editData.photo,
            };
            const response = await fetch(
                `https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/${date}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vegetables: updatedVegs }),
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update stock");
            }
            setSuccess("Stock updated successfully!");
            setStock({ ...stock, vegetables: updatedVegs });
            setEditIndex(null);
        } catch (err) {
            console.error("Update stock error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete vegetable
    const confirmDeleteVegetable = (vegId) => {
        setDeleteVegId(vegId);
        setShowDeleteModal(true);
    };

    const deleteVegetable = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/${date}/vegetable/${deleteVegId}`,
                { method: "DELETE" }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to remove vegetable");
            }
            setSuccess("Vegetable removed successfully!");
            setStock({
                ...stock,
                vegetables: stock.vegetables.filter((veg) => veg.id !== deleteVegId),
            });
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Delete vegetable error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete entire stock
    const deleteStock = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/${date}`,
                { method: "DELETE" }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete stock");
            }
            setSuccess("Daily stock deleted successfully!");
            setStock(null);
        } catch (err) {
            console.error("Delete stock error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle stock update after carry forward
    const handleStockUpdated = (updatedStock) => {
        console.log("Stock updated via carry forward:", updatedStock);
        setSuccess("Stock carried forward successfully!");
        setStock(updatedStock); // Update local stock state directly
    };

    const getVegetableName = (id) =>
        vegetables.find((v) => v._id === id)?.name || "Unknown";

    return (
        <div className="container mt-5 mb-5">
            <div className="card shadow-lg animate__animated animate__fadeIn">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <h2>View Daily Stock</h2>
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => setShowCarryForward(true)}
                    >
                        Carry Forward Stock
                    </button>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">
                            Select Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    {loading && (
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    )}
                    {!loading && stock && (
                        <>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>Vegetable</th>
                                            <th>Quantity</th>
                                            <th>Photo</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stock.vegetables.map((veg, index) => (
                                            <tr key={veg.id}>
                                                <td>{getVegetableName(veg.id)}</td>
                                                <td>
                                                    {editIndex === index ? (
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            min="0"
                                                            value={editData.quantity}
                                                            onChange={(e) =>
                                                                handleEditChange("quantity", e.target.value)
                                                            }
                                                        />
                                                    ) : (
                                                        veg.quantity
                                                    )}
                                                </td>
                                                <td>
                                                    {editIndex === index ? (
                                                        <>
                                                            <UploadFile
                                                                onUpload={(url) => handleEditChange("photo", url)}
                                                            />
                                                            {editData.photo && (
                                                                <img
                                                                    src={editData.photo}
                                                                    alt="Preview"
                                                                    className="img-thumbnail mt-2"
                                                                    style={{ maxWidth: "50px" }}
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <img
                                                            src={veg.photo}
                                                            alt={getVegetableName(veg.id)}
                                                            className="img-thumbnail"
                                                            style={{ maxWidth: "50px" }}
                                                        />
                                                    )}
                                                </td>
                                                <td>
                                                    {editIndex === index ? (
                                                        <>
                                                            <button
                                                                className={`btn btn-success btn-sm me-2 ${loading ? "disabled" : ""}`}
                                                                onClick={saveEdit}
                                                                disabled={loading}
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => setEditIndex(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={() => startEdit(index)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => confirmDeleteVegetable(veg.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                className={`btn btn-danger ${loading ? "disabled" : ""}`}
                                onClick={deleteStock}
                                disabled={loading}
                            >
                                Delete Entire Stock
                            </button>
                        </>
                    )}
                    {!loading && !stock && (
                        <div className="alert alert-info">
                            No stock found for {date}. Try adding stock or selecting another date.
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <div
                className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}
                style={{
                    backgroundColor: showDeleteModal ? "rgba(0,0,0,0.5)" : "transparent",
                }}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Delete</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowDeleteModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to remove this vegetable from the daily stock?
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={`btn btn-danger ${loading ? "disabled" : ""}`}
                                onClick={deleteVegetable}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carry Forward Modal */}
            <CarryForwardStock
                show={showCarryForward}
                onClose={() => setShowCarryForward(false)}
                onStockUpdated={handleStockUpdated}
                date={date} // Pass selected date for carry-forward
            />
        </div>
    );
};

export default ViewDailyStock;