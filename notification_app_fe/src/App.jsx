import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import NotificationsPage from './pages/NotificationsPage';
import PriorityPage from './pages/PriorityPage';
import Box from '@mui/material/Box';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Responsive Navbar Navigation */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<NotificationsPage />} />
            <Route path="/priority" element={<PriorityPage />} />
            {/* Fallback to home */}
            <Route path="*" element={<NotificationsPage />} />
          </Routes>
        </Box>
        
        {/* Footer */}
        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 Notification Dashboard. Designed with Material UI.
          </Typography>
        </Box>
      </Box>
    </Router>
  );
}

// Inline typography import to support standard footer text
import Typography from '@mui/material/Typography';

export default App;
