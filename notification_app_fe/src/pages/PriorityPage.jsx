import React, { useState, useEffect } from 'react';
import { getPriorityNotifications } from '../services/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StarIcon from '@mui/icons-material/Star';
import DateRangeIcon from '@mui/icons-material/DateRange';

function PriorityPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPriorityFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPriorityNotifications({ limit: 10 });
      if (result.success) {
        setNotifications(result.data);
      } else {
        throw new Error(result.message || 'Failed to retrieve priority notifications');
      }
    } catch (err) {
      setError(err.message || 'Failed to establish connection with the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorityFeed();
  }, []);

  const getPriorityWeight = (cat) => {
    switch (cat) {
      case 'Placement': return { label: 'High Priority', color: '#ff1744', level: 3 };
      case 'Result': return { label: 'Medium Priority', color: '#00e5ff', level: 2 };
      case 'Event': return { label: 'Low Priority', color: '#7c4dff', level: 1 };
      default: return { label: 'Normal Priority', color: '#90caf9', level: 0 };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StarIcon color="secondary" sx={{ fontSize: 32 }} /> Priority Inbox (Top 10)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Notifications sorted dynamically using hierarchical priority rules: <strong>Placement &gt; Result &gt; Event</strong>, sorted by recency.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<RefreshIcon />}
          onClick={fetchPriorityFeed}
          disabled={loading}
          sx={{ boxShadow: '0 4px 14px 0 rgba(0, 229, 255, 0.4)', color: 'background.default', '&:hover': { color: 'background.default' } }}
        >
          Reload
        </Button>
      </Box>

      {/* Main Content Area */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress color="secondary" size={50} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          variant="filled"
          action={
            <Button color="inherit" size="small" onClick={fetchPriorityFeed}>
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
            Priority Inbox is empty
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All caught up! There are no priority notifications right now.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {notifications.map((notif, index) => {
            const config = getPriorityWeight(notif.category);
            return (
              <Grid item xs={12} key={notif.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    borderLeft: `5px solid ${config.color}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 30px rgba(0, 229, 255, 0.1)`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      {/* Title & Rank Badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: '50%', 
                            bgcolor: 'rgba(0, 229, 255, 0.15)', 
                            color: 'secondary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: '1px solid rgba(0, 229, 255, 0.3)'
                          }}
                        >
                          #{index + 1}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h2"
                          sx={{ 
                            fontWeight: 700,
                            color: 'text.primary'
                          }}
                        >
                          {notif.title}
                        </Typography>
                      </Box>

                      {/* Priority Tag */}
                      <Chip 
                        icon={<PriorityHighIcon style={{ fontSize: '0.9rem', color: '#fff' }} />}
                        label={config.label} 
                        sx={{ 
                          bgcolor: config.color, 
                          color: '#ffffff', 
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          height: '24px',
                          '& .MuiChip-icon': {
                            marginLeft: '4px',
                            marginRight: '-4px'
                          }
                        }}
                      />
                    </Box>

                    {/* Notification Body */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, lineHeight: 1.6 }}
                    >
                      {notif.body}
                    </Typography>

                    {/* Footer Details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <DateRangeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">
                          {new Date(notif.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={notif.category} 
                          variant="outlined"
                          size="small" 
                          sx={{ borderColor: config.color, color: config.color, fontWeight: 700 }}
                        />
                        <Chip 
                          label={notif.isRead ? 'Read' : 'Unread'} 
                          size="small" 
                          variant={notif.isRead ? 'outlined' : 'filled'}
                          color={notif.isRead ? 'default' : 'primary'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default PriorityPage;
