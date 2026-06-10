import React, { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotificationsIcon from '@mui/icons-material/Notifications';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 6 });
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categories = ['All', 'Placement', 'Result', 'Event'];

  const fetchFeed = async (page = 1, type = 'All') => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications({
        page,
        limit: 6,
        type: type === 'All' ? '' : type
      });
      if (result.success) {
        setNotifications(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.message || 'Failed to retrieve notifications');
      }
    } catch (err) {
      setError(err.message || 'Failed to establish connection with the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, activeTab);
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, newPage) => {
    fetchFeed(newPage, activeTab);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Placement': return 'error'; // Red/Orange
      case 'Result': return 'secondary'; // Cyan
      case 'Event': return 'primary'; // Indigo
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <NotificationsIcon color="primary" sx={{ fontSize: 32 }} /> Notification Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Stay updated with academic schedules, results, and placement notifications.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={() => fetchFeed(pagination.currentPage, activeTab)}
          disabled={loading}
        >
          Refresh Feed
        </Button>
      </Box>

      {/* Tabs Filter Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="notification category filters"
        >
          {categories.map((cat) => (
            <Tab 
              key={cat}
              value={cat} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{cat}</span>
                </Box>
              } 
              sx={{ fontWeight: 600, px: 3, fontSize: '0.95rem' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Main Content Area */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress color="primary" size={50} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={() => fetchFeed(pagination.currentPage, activeTab)}>
              Retry
            </Button>
          }
          sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <AlertTitle>Network Integration Error</AlertTitle>
          {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notifications found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            There are currently no items matching the selected category.
          </Typography>
          <Button variant="outlined" color="primary" onClick={() => setActiveTab('All')}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <>
          {/* Notifications List Grid */}
          <Grid container spacing={3}>
            {notifications.map((notif) => (
              <Grid item xs={12} key={notif.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    borderLeft: notif.isRead 
                      ? '4px solid rgba(255, 255, 255, 0.15)' 
                      : '4px solid #7c4dff', // Highlight unread in primary purple
                    bgcolor: notif.isRead ? 'rgba(18, 20, 28, 0.5)' : 'background.paper',
                    opacity: notif.isRead ? 0.85 : 1,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(124, 77, 255, 0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      {/* Title & Badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Typography 
                          variant="h6" 
                          component="h2"
                          sx={{ 
                            fontWeight: notif.isRead ? 500 : 700,
                            color: notif.isRead ? 'text.secondary' : 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {!notif.isRead && (
                            <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                          )}
                          {notif.title}
                        </Typography>
                      </Box>

                      {/* Chips */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={notif.category} 
                          color={getCategoryColor(notif.category)}
                          size="small" 
                          sx={{ fontWeight: 700 }}
                        />
                        {!notif.isRead && (
                          <Chip 
                            label="New" 
                            color="primary"
                            variant="outlined"
                            size="small" 
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Notification Body */}
                    <Typography 
                      variant="body2" 
                      color={notif.isRead ? 'text.secondary' : 'text.primary'} 
                      sx={{ mb: 2, lineHeight: 1.6 }}
                    >
                      {notif.body}
                    </Typography>

                    {/* Timestamp footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Received: {new Date(notif.createdAt).toLocaleString()}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: notif.isRead ? 'text.secondary' : 'primary.main', fontWeight: 600 }}>
                        {notif.isRead ? 'Marked as read' : 'Unread'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Component */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination 
                count={pagination.totalPages} 
                page={pagination.currentPage} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 600,
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default NotificationsPage;
