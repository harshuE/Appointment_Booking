// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update import here
import Booking from './Booking'; // Adjust the import if needed
import ArchitectDashboard from './ArchitectDashboard';
import ClientUI from './ClientUI';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/booking" element={<Booking />} /> {/* Booking page */}
                    <Route path="/dashboard" element={<ArchitectDashboard />} /> {/* Architect Dashboard */}
                    <Route path="/" element={<ClientUI />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
