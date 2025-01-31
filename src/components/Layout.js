import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  ListItemButton,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalance as BalanceIcon,
  Receipt as TransactionsIcon,
  Description as BillsIcon,
  TrendingUp as ExpensesIcon,
  Flag as GoalsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Overview', icon: DashboardIcon, path: '/' },
  { text: 'Balances', icon: BalanceIcon, path: '/balances' },
  { text: 'Transactions', icon: TransactionsIcon, path: '/transactions' },
  { text: 'Bills', icon: BillsIcon, path: '/bills' },
  { text: 'Expenses', icon: ExpensesIcon, path: '/expenses' },
  { text: 'Goals', icon: GoalsIcon, path: '/goals' },
];

const Layout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useCustomTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 'none',
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            FINEbank.io
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>

        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ mx: 2 }} />

        <List sx={{ p: 2 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to="/settings"
              selected={location.pathname === '/settings'}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: theme.palette.grey[100],
                  '&:hover': {
                    bgcolor: theme.palette.grey[200],
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: theme.palette.error.light + '20',
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>

        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : theme.palette.grey[50],
              borderRadius: 2,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                mr: 2,
              }}
            >
              U
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                User Name
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View profile
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : theme.palette.grey[50],
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
