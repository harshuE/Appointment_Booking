import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@mui/material';
import './AppointmentStyles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Booking() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        clientName: "",
        email: "",
        phoneNumber: "",
        projectType: "",
        preferredDate: "",
        preferredTime: "",
        location: "",
        purpose: ""
    });
    const [error, setError] = useState({});
    const [message, setMessage] = useState("");
    const [submittedData, setSubmittedData] = useState(null);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    
    const apiUrl = "http://localhost:8000/appoints";

    useEffect(() => {
        const fetchBookedDates = async () => {
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const appointments = await response.json();
                    const dates = appointments.map(app => app.preferredDate);
                    setBookedDates(dates);
                }
            } catch (error) {
                console.error("Failed to fetch booked dates", error);
            }
        };

        fetchBookedDates();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        setError({ ...error, [name]: "" }); // Reset the error on field change
    };

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phonePattern = /^\d{10}$/;
        return phonePattern.test(phoneNumber);
    };

    const validateStep1Fields = () => {
        let isValid = true;
        let newError = {};

        if (!formData.clientName) {
            newError.clientName = "Client Name is required.";
            isValid = false;
        }
        if (!validateEmail(formData.email)) {
            newError.email = "Please enter a valid email address.";
            isValid = false;
        }
        if (!validatePhoneNumber(formData.phoneNumber)) {
            newError.phoneNumber = "Please enter a valid phone number (10 digits).";
            isValid = false;
        }
        if (!formData.projectType) {
            newError.projectType = "Please select a project type.";
            isValid = false;
        }

        setError(newError);
        return isValid;
    };

    const validateStep2Fields = () => {
        let isValid = true;
        let newError = {};

        if (!formData.preferredDate) {
            newError.preferredDate = "Please select a preferred date.";
            isValid = false;
        }
        if (!formData.preferredTime) {
            newError.preferredTime = "Please select a preferred time.";
            isValid = false;
        }
        if (!formData.location) {
            newError.location = "Please enter a location.";
            isValid = false;
        }
        if (!formData.purpose) {
            newError.purpose = "Please enter the purpose of the appointment.";
            isValid = false;
        }

        setError(newError);
        return isValid;
    };

    const handleNextStep = () => {
        if (validateStep1Fields()) {
            setStep(2);
        }
    };

    const handleSubmit = async () => {
        if (validateStep2Fields()) {
            const { clientName, email, phoneNumber, projectType, preferredDate, preferredTime, location, purpose } = formData;

            if (clientName && email && phoneNumber && projectType && preferredDate && preferredTime && location && purpose) {
                try {
                    const url = isUpdateMode ? `${apiUrl}/${submittedData._id}` : apiUrl;
                    const method = isUpdateMode ? "PUT" : "POST";

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    });

                    if (response.ok) {
                        const updatedData = await response.json();
                        setSubmittedData(updatedData);
                        setMessage(isUpdateMode ? "Appointment updated successfully" : "Appointment created successfully");
                        setError({});
                        setStep(3);
                        setIsUpdateMode(false);

                        toast.success("Appointment booked successfully!", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                    } else {
                        const errorData = await response.json();
                        setError({ general: `Error: ${errorData.message || "Unable to process the request"}` });
                        setMessage("");
                    }
                } catch (err) {
                    setError({ general: `Network error: ${err.message}` });
                    setMessage("");
                }
            } else {
                setError({ general: "Please fill in all required fields" });
            }
        }
    };

    const handleDownloadPDF = () => {
        if (submittedData) {
            const doc = new jsPDF();

            const logoImg = new Image();
            logoImg.src = `${process.env.PUBLIC_URL}/logo.jpg`;
            logoImg.onload = function() {
                const logoWidth = 30;
                const logoHeight = 32;
                doc.addImage(logoImg, 'JPG', 150, 10, logoWidth, logoHeight);

                doc.setFontSize(16);
                doc.text("Appointment Overview", 10, 30);

                doc.autoTable({
                    startY: 40,
                    head: [['Field', 'Details']],
                    body: [
                        ['Client Name', submittedData.clientName],
                        ['Email', submittedData.email],
                        ['Phone Number', submittedData.phoneNumber],
                        ['Project Type', submittedData.projectType],
                        ['Date of Appointment', submittedData.preferredDate],
                        ['Time Chosen', submittedData.preferredTime],
                        ['Purpose', submittedData.purpose]
                    ],
                    margin: { horizontal: 10 },
                    styles: { fontSize: 12 },
                    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
                    alternateRowStyles: { fillColor: [240, 240, 240] }
                });

                doc.setFontSize(12);
                doc.setTextColor(0, 128, 0);
                doc.text("The appointment with the architect is confirmed now.", 16, doc.autoTable.previous.finalY + 10);

                doc.save("appointment_overview.pdf");
            };
            logoImg.onerror = function() {
                console.error("Error loading logo image.");
            };
        } else {
            console.error("No submitted data available");
        }
    };

    const handleUpdate = () => {
        setFormData(submittedData);
        setIsUpdateMode(true);
        setStep(1);
    };

    const handleDelete = async () => {
        if (submittedData && submittedData._id) {
            try {
                const response = await fetch(`${apiUrl}/${submittedData._id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    setSubmittedData(null);
                    setFormData({
                        clientName: "",
                        email: "",
                        phoneNumber: "",
                        projectType: "",
                        preferredDate: "",
                        preferredTime: "",
                        location: "",
                        purpose: ""
                    });
                    setMessage("Appointment deleted successfully");
                    setError({});
                    setStep(1);

                    toast.success("Appointment deleted successfully!", {
                        position: "top-right",
                        autoClose: 3000,
                    });

                } else {
                    const errorData = await response.json();
                    setError({ general: `Error: ${errorData.message || "Unable to delete the appointment"}` });
                    setMessage("");
                }
            } catch (err) {
                setError({ general: `Network error: ${err.message}` });
                setMessage("");
            }
        } else {
            setError({ general: "No appointment selected for deletion" });
        }
    };

    const isDateBooked = (date) => {
        return bookedDates.includes(date);
    };

    const today = new Date().toISOString().split("T")[0];

    const handleDateSelection = (e) => {
        const selectedDate = e.target.value;

        if (isDateBooked(selectedDate)) {
            setError({ preferredDate: "This date is already booked. Please choose another date." });
            setFormData({ ...formData, preferredDate: "" });
        } else {
            setError({});
            setFormData({ ...formData, preferredDate: selectedDate });
        }
    };

    return (
        <div className="container mt-5">
            <div className="appointment-header">
                <h1>Book Your Appointment with Our Experts</h1>
            </div>

            <div className="row mt-3">
                {step === 1 && (
                    <>
                        <div className="col-md-6">
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h3>Step 1: Client Details</h3>
                                    <div className="form-group">
                                        <label>Client Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleChange}
                                            placeholder="Enter client name"
                                            required
                                        />
                                        {error.clientName && <span className="text-danger">{error.clientName}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email"
                                            required
                                        />
                                        {error.email && <span className="text-danger">{error.email}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                        {error.phoneNumber && <span className="text-danger">{error.phoneNumber}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Project Type</label>
                                        <select
                                            className="form-control"
                                            name="projectType"
                                            value={formData.projectType}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Project Type</option>
                                            <option value="Design">Design</option>
                                            <option value="Construction">Construction</option>
                                            <option value="Both">Both</option>
                                        </select>
                                        {error.projectType && <span className="text-danger">{error.projectType}</span>}
                                    </div>
                                    <button variant="contained" className="btn-next" onClick={handleNextStep}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <img src="imag1.avif" alt="Step 1 Image" className="step-image" />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="col-md-6">
                            <img src="imag 2.jpg" alt="Step 2 Image" className="step-image" />
                        </div>
                        <div className="col-md-6">
                            <div className="card mb-3">
                                <div className="card-body">
                                    <h3>Step 2: Appointment Details</h3>
                                    <div className="form-group">
                                        <label>Preferred Date</label>
                                        <input
                                            type="date"
                                            className={`form-control ${formData.preferredDate ? (isDateBooked(formData.preferredDate) ? "is-invalid" : "is-valid") : ""}`}
                                            name="preferredDate"
                                            value={formData.preferredDate}
                                            onChange={handleDateSelection}
                                            min={today}
                                            required
                                        />
                                        {error.preferredDate && <span className="text-danger">{error.preferredDate}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Preferred Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="preferredTime"
                                            value={formData.preferredTime}
                                            onChange={handleChange}
                                            required
                                        />
                                        {error.preferredTime && <span className="text-danger">{error.preferredTime}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Enter location"
                                            required
                                        />
                                        {error.location && <span className="text-danger">{error.location}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Purpose</label>
                                        <textarea
                                            className="form-control"
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Enter purpose of the appointment"
                                            required
                                        ></textarea>
                                        {error.purpose && <span className="text-danger">{error.purpose}</span>}
                                    </div>
                                    <div className="button-container2">
                                        <Button variant="contained" className="btn-previous" onClick={() => setStep(1)}>
                                            Previous
                                        </Button>
                                        <Button variant="contained" className="btn-submit" onClick={handleSubmit}>
                                            Submit
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {step === 3 && submittedData && (
                <div className="row mt-3">
                    <div className="col-md-6">
                        <div className="card mb-3">
                            <div className="card-body">
                                <h3>Appointment Overview</h3>
                                <ul className="list-group">
                                    <li className="list-group-item"><strong>Client Name:</strong> {submittedData.clientName}</li>
                                    <li className="list-group-item"><strong>Email:</strong> {submittedData.email}</li>
                                    <li className="list-group-item"><strong>Phone Number:</strong> {submittedData.phoneNumber}</li>
                                    <li className="list-group-item"><strong>Project Type:</strong> {submittedData.projectType}</li>
                                    <li className="list-group-item"><strong>Date:</strong> {submittedData.preferredDate}</li>
                                    <li className="list-group-item"><strong>Time:</strong> {submittedData.preferredTime}</li>
                                    <li className="list-group-item"><strong>Location:</strong> {submittedData.location}</li>
                                    <li className="list-group-item"><strong>Purpose:</strong> {submittedData.purpose}</li>
                                </ul>
                                <div className="button-group">
                                    <Button variant="contained" className="btn-success" onClick={handleDownloadPDF}>
                                        Download PDF
                                    </Button>
                                    <Button variant="contained" className="btn-warning" onClick={handleUpdate}>
                                        Update
                                    </Button>
                                    <Button variant="contained" className="btn-danger" onClick={handleDelete}>
                                        Delete
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <img src="imag3.jpg" alt="Step 3 Image" className="step-image" />
                    </div>
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
