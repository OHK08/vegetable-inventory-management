import React, { useState, useEffect } from "react";

const CarryForwardStock = ({ show, onClose, onStockUpdated, date }) => {
    const [previousStock, setPreviousStock] = useState([]);
    const [vegetables, setVegetables] = useState([]);
    const [selectedVegetables, setSelectedVegetables] = useState([]);
    const [warning, setWarning] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch vegetables and previous day's stock when modal opens
    useEffect(() => {
        if (!show) return;

        const fetchVegetables = async () => {
            try {
                console.log("Fetching vegetables...");
                const response = await fetch(
                    "https://omshreevegies-e5q6islzdq-uc.a.run.app/vegetables"
                );
                if (!response.ok) {
                    throw new Error(`Failed to fetch vegetables: ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Vegetables fetched:", data);
                setVegetables(data);
            } catch (err) {
                console.error("Fetch vegetables error:", err);
                setWarning("Unable to load vegetable data. Displaying IDs only.");
            }
        };

        const fetchPreviousStock = async () => {
            try {
                setLoading(true);
                setWarning("");
                setSuccess("");
                console.log("Fetching previous day's stock...");
                const response = await fetch(
                    "https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/previous-day"
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Fetch error response:", errorData);
                    throw new Error(
                        `Failed to fetch previous day's stock: ${response.status} ${response.statusText} - ${errorData.error}`
                    );
                }
                const data = await response.json();
                console.log("Previous day's stock fetched:", data);
                // Filter vegetables with quantity > 0
                const availableStock = data.vegetables.filter(
                    (veg) => veg.quantity > 0
                );
                setPreviousStock(availableStock);
                if (availableStock.length === 0) {
                    setWarning("No remaining stock from the previous day.");
                }
            } catch (err) {
                console.error("Fetch previous stock error:", err);
                setWarning("Unable to load previous day's stock. Please try again.");
                setPreviousStock([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVegetables();
        fetchPreviousStock();
    }, [show]);

    // Get vegetable name by ID
    const getVegetableName = (id) =>
        vegetables.find((v) => v._id === id)?.name || id;

    // Handle checkbox toggle
    const handleCheckboxChange = (vegId) => {
        setSelectedVegetables((prev) =>
            prev.includes(vegId)
                ? prev.filter((id) => id !== vegId)
                : [...prev, vegId]
        );
    };

    // Handle carry forward action
    const handleCarryForward = async () => {
        if (selectedVegetables.length === 0) {
            setWarning("Please select at least one vegetable to carry forward.");
            return;
        }

        try {
            setLoading(true);
            setWarning("");
            setSuccess("");
            const vegetablesToCarry = previousStock
                .filter((veg) => selectedVegetables.includes(veg.id))
                .map(({ id, quantity, photo }) => ({
                    id,
                    quantity,
                    photo,
                }));

            console.log("Carrying forward vegetables:", vegetablesToCarry);

            const response = await fetch(
                "https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        vegetables: vegetablesToCarry,
                        date: date || new Date().toISOString().split("T")[0], // Use provided date or today
                    }),
                }
            );

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    throw new Error(
                        `Server error: ${response.status} ${response.statusText}`
                    );
                }
                console.error("Carry forward error response:", errorData);
                throw new Error(
                    errorData.error || `Failed to carry forward stock: ${response.status}`
                );
            }

            const result = await response.json();
            console.log("Carry forward result:", result);

            // Fetch updated stock for the selected date
            const stockResponse = await fetch(
                `https://omshreevegies-e5q6islzdq-uc.a.run.app/daily-stock/${date || new Date().toISOString().split("T")[0]}`
            );
            if (!stockResponse.ok) {
                const errorData = await stockResponse.json();
                console.error("Fetch updated stock error:", errorData);
                throw new Error(
                    `Failed to fetch updated stock: ${stockResponse.status} ${stockResponse.statusText}`
                );
            }
            const updatedStock = await stockResponse.json();
            console.log("Updated stock fetched:", updatedStock);

            setSuccess("Stock carried forward successfully!");
            setSelectedVegetables([]); // Clear selections
            if (onStockUpdated) {
                onStockUpdated(updatedStock); // Pass updated stock to parent
            }
        } catch (err) {
            console.error("Carry forward error:", err);
            setWarning("Failed to carry forward stock. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`modal fade ${show ? "show d-block" : ""}`}
            tabIndex="-1"
            style={{ backgroundColor: show ? "rgba(0,0,0,0.5)" : "transparent" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            Carry Forward Previous Day's Stock
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {warning && (
                            <div className="alert alert-warning">{warning}</div>
                        )}
                        {success && (
                            <div className="alert alert-success">{success}</div>
                        )}
                        {loading && (
                            <div className="text-center">
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                <span> Loading...</span>
                            </div>
                        )}
                        {!loading && previousStock.length > 0 && (
                            <div>
                                <ul className="list-group mb-3">
                                    {previousStock.map((veg) => (
                                        <li
                                            key={veg.id}
                                            className="list-group-item d-flex align-items-center"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedVegetables.includes(
                                                    veg.id
                                                )}
                                                onChange={() =>
                                                    handleCheckboxChange(veg.id)
                                                }
                                                className="form-check-input me-2"
                                                disabled={loading}
                                            />
                                            <img
                                                src={veg.photo}
                                                alt={getVegetableName(veg.id)}
                                                className="img-thumbnail me-2"
                                                style={{ width: "40px", height: "40px" }}
                                            />
                                            <span>
                                                {getVegetableName(veg.id)} | Quantity: {veg.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {!loading && previousStock.length === 0 && !warning && (
                            <p>No remaining stock available to carry forward.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className={`btn btn-primary ${
                                loading || selectedVegetables.length === 0
                                    ? "disabled"
                                    : ""
                            }`}
                            onClick={handleCarryForward}
                            disabled={loading || selectedVegetables.length === 0}
                        >
                            {loading ? (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            ) : (
                                "Carry Forward Selected"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarryForwardStock;