import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ClientUI.css'; // CSS for styling

const ClientUI = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleBookAppointment = () => {
    navigate('/booking'); // Navigate to the booking page
  };

  return (
    <div className="appointment-container">
      {/* Heading */}
      <h1 className="heading">Build Your Dream</h1>

      <div className="image-grid">
        {/* 6 images */}
        <img src="p1.jpg" alt="Image 1" className="grid-image" />
        <img src="p2.jpeg" alt="Image 2" className="grid-image" />
        <img src="p3.jpg" alt="Image 3" className="grid-image" />
        <img src="p4.jpg" alt="Image 4" className="grid-image" />
        <img src="p5.jpeg" alt="Image 5" className="grid-image" />
        <img src="p6.jpg" alt="Image 6" className="grid-image" />
      </div>

      {/* Button in the top-right corner */}
      <div className="button-container">
        <button className="book-button" onClick={handleBookAppointment}>
          Book Your Appointment
        </button>
      </div>
    </div>
  );
};

export default ClientUI;
