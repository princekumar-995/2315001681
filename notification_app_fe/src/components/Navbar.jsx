import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'All Notifications', path: '/' },
    { label: 'Priority Inbox', path: '/priority' }
  ];

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', height: '100%' }}>
      <Typography variant="h6" sx={{ my: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <NotificationsActiveIcon color="primary" /> NotifApp
      </Typography>
      <Divider />
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                textAlign: 'center',
                borderRadius: 2,
                mb: 1,
                bgcolor: location.pathname === item.path ? 'primary.dark' : 'transparent',
                '&:hover': { bgcolor: 'rgba(124, 77, 255, 0.08)' }
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 700 : 500 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundImage: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                textDecoration: 'none',
                color: 'text.primary',
                background: 'linear-gradient(45deg, #7c4dff 30%, #00e5ff 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              NotifApp
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                variant={location.pathname === item.path ? 'contained' : 'text'}
                color="primary"
                sx={{
                  fontWeight: 600,
                  px: 3,
                  boxShadow: location.pathname === item.path ? '0 4px 14px 0 rgba(124, 77, 255, 0.4)' : 'none',
                  '&:hover': {
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile Drawer Trigger */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250, borderLeft: '1px solid rgba(255,255,255,0.08)' },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Navbar;
