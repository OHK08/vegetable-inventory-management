import React, { useState, useEffect } from "react";
import UploadFile from "../components/UploadFile";

const AddDailyStock = () => {
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [vegetables, setVegetables] = useState([]);
    const [selectedVegs, setSelectedVegs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [warning, setWarning] = useState("");

    useEffect(() => {
        const fetchVegetables = async (retries = 3, delay = 1000) => {
            for (let i = 0; i < retries; i++) {
                try {
                    console.log("Fetching vegetables...");
                    const response = await fetch(
                        "https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables"
                    );
                    if (!response.ok) {
                        throw new Error(`Failed to fetch vegetables: ${response.status} ${response.statusText}`);
                    }
                    const data = await response.json();
                    console.log("Vegetables fetched:", data);
                    setVegetables(data);
                    if (data.length === 0) {
                        setWarning("No vegetables found. Add vegetables to proceed.");
                    }
                    return; // Success, exit the function
                } catch (err) {
                    console.error(`Fetch attempt ${i + 1} failed:`, err);
                    if (i < retries - 1) {
                        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retry
                    } else {
                        console.error("Fetch vegetables error:", err);
                        setWarning("Unable to load vegetables due to server error. Please try again.");
                        setVegetables([]);
                    }
                }
            }
        };
    
        fetchVegetables();
    }, []);

    // Handle adding a vegetable
    const addVegetable = () => {
        setSelectedVegs([
            ...selectedVegs,
            { id: "", quantity: 0, photo: "", tempPhoto: null },
        ]);
    };

    // Handle vegetable field changes
    const updateVegetable = (index, field, value) => {
        setSelectedVegs((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            console.log(`Updated vegetable ${index}:`, updated[index]);
            return updated;
        });
    };

    // Handle photo upload
    const handlePhotoUpload = (index, url) => {
        console.log(`Photo uploaded for vegetable ${index}:`, url);
        if (url && typeof url === "string" && url.startsWith("https://")) {
            updateVegetable(index, "photo", url);
        } else {
            console.warn(`Invalid photo URL for vegetable ${index}:`, url);
            setError("Failed to process photo upload. Please try again.");
        }
    };

    // Handle upload errors
    const handleUploadError = (index, errorMsg) => {
        console.warn(`Upload error for vegetable ${index}:`, errorMsg);
        setError(`Photo upload failed: ${errorMsg}`);
    };

    // Remove a vegetable
    const removeVegetable = (index) => {
        setSelectedVegs(selectedVegs.filter((_, i) => i !== index));
    };

    // Check if all vegetables have valid inputs
    const hasValidInputs = selectedVegs.every(
        (veg) => veg.id && veg.quantity > 0 && veg.photo && veg.photo.trim() !== ""
    );

    // Submit daily stock
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        console.log("Validating selected vegetables:", selectedVegs);
        if (selectedVegs.length === 0) {
            console.warn("Validation failed: No vegetables selected");
            setError("Add at least one vegetable");
            setLoading(false);
            return;
        }
        for (const veg of selectedVegs) {
            if (!veg.id) {
                console.warn("Validation failed: Missing vegetable ID");
                setError("Select a vegetable for all entries");
                setLoading(false);
                return;
            }
            if (veg.quantity <= 0) {
                console.warn("Validation failed: Invalid quantity");
                setError("Quantity must be positive");
                setLoading(false);
                return;
            }
            if (!veg.photo) {
                console.warn("Validation failed: Missing photo");
                setError("Upload a photo for all vegetables");
                setLoading(false);
                return;
            }
        }

        const payload = {
            date,
            vegetables: selectedVegs.map((veg) => ({
                id: veg.id,
                quantity: Number(veg.quantity),
                photo: veg.photo,
            })),
        };
        console.log("Submitting payload:", payload);

        try {
            const response = await fetch(
                "https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            console.log("Response status:", response.status, response.statusText);
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                console.warn("Backend error response:", errorData);
                throw new Error(errorData.error || `Failed to add daily stock: ${response.status}`);
            }
            const responseData = await response.json();
            console.log("Response data:", responseData);
            setSuccess("Daily stock added successfully!");
            setSelectedVegs([]);
        } catch (err) {
            console.error("Submit daily stock error:", err);
            setError(
                err.message.includes("Invalid date format") ||
                err.message.includes("Validation failed") ?
                err.message :
                "Failed to submit daily stock. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="card shadow-lg animate__animated animate__fadeIn">
                <div className="card-header bg-primary text-white">
                    <h2>Add Daily Stock</h2>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {warning && <div className="alert alert-warning">{warning}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                className="form-control"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <h5>Vegetables</h5>
                        {selectedVegs.map((veg, index) => (
                            <div
                                key={index}
                                className="card mb-3 p-3 border animate__animated animate__fadeInUp"
                            >
                                <div className="mb-2">
                                    <label htmlFor={`veg-${index}`} className="form-label">
                                        Vegetable
                                    </label>
                                    <select
                                        id={`veg-${index}`}
                                        className={`form-select ${!veg.id && error ? "is-invalid" : ""}`}
                                        value={veg.id}
                                        onChange={(e) =>
                                            updateVegetable(index, "id", e.target.value)
                                        }
                                        required
                                    >
                                        <option value="">Select Vegetable</option>
                                        {vegetables.map((v) => (
                                            <option key={v._id} value={v._id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!veg.id && error && (
                                        <div className="invalid-feedback">
                                            Please select a vegetable.
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <label htmlFor={`quantity-${index}`} className="form-label">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id={`quantity-${index}`}
                                        className={`form-control ${veg.quantity <= 0 && error ? "is-invalid" : ""}`}
                                        min="0"
                                        value={veg.quantity}
                                        onChange={(e) =>
                                            updateVegetable(index, "quantity", e.target.value)
                                        }
                                        required
                                    />
                                    {veg.quantity <= 0 && error && (
                                        <div className="invalid-feedback">
                                            Quantity must be positive.
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <label htmlFor={`photo-${index}`} className="form-label">
                                        Photo <span className="text-danger">*</span>
                                    </label>
                                    <UploadFile
                                        onUploadSuccess={(url) => handlePhotoUpload(index, url)}
                                        onError={(errorMsg) => handleUploadError(index, errorMsg)}
                                    />
                                    {veg.photo ? (
                                        <img
                                            src={veg.photo}
                                            alt="Preview"
                                            className="img-thumbnail mt-2"
                                            style={{ maxWidth: "100px" }}
                                        />
                                    ) : (
                                        <div
                                            className={`mt-2 p-2 border rounded text-center ${!veg.photo && error ? "border-danger text-danger" : "border-secondary text-muted"}`}
                                        >
                                            No photo uploaded
                                        </div>
                                    )}
                                    {!veg.photo && error && (
                                        <div className="invalid-feedback d-block">
                                            Please upload a photo.
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeVegetable(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary mb-3"
                            onClick={addVegetable}
                            disabled={vegetables.length === 0}
                        >
                            Add Vegetable
                        </button>
                        <div>
                            <button
                                type="submit"
                                className={`btn btn-primary ${loading || selectedVegs.length === 0 || !hasValidInputs ? "disabled" : ""}`}
                                disabled={loading || selectedVegs.length === 0 || !hasValidInputs}
                            >
                                {loading ? (
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                ) : (
                                    "Submit Stock"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddDailyStock;