import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getBills, addBill, updateBill, deleteBill, markBillAsPaid } from '../services/api';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    isRecurring: false,
    frequency: 'monthly',
    notificationEnabled: true,
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await getBills();
      setBills(response.data);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const handleOpenDialog = (bill = null) => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: format(new Date(bill.dueDate), 'yyyy-MM-dd'),
        category: bill.category,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency || 'monthly',
        notificationEnabled: bill.notificationEnabled,
      });
      setSelectedBill(bill);
    } else {
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        isRecurring: false,
        frequency: 'monthly',
        notificationEnabled: true,
      });
      setSelectedBill(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBill(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedBill) {
        await updateBill(selectedBill._id, formData);
      } else {
        await addBill(formData);
      }
      handleCloseDialog();
      loadBills();
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteBill(billId);
        loadBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const handlePayBill = async (billId) => {
    try {
      await markBillAsPaid(billId);
      loadBills();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const categories = [
    'Utilities',
    'Rent/Mortgage',
    'Insurance',
    'Subscriptions',
    'Credit Card',
    'Other',
  ];

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const getTotalUpcoming = () => {
    return bills
      .filter((bill) => !bill.isPaid)
      .reduce((total, bill) => total + bill.amount, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Bills & Payments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Bill
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Upcoming Bills
          </Typography>
          <Typography variant="h3">${getTotalUpcoming().toFixed(2)}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {bills.map((bill) => (
          <Grid item xs={12} md={6} lg={4} key={bill._id}>
            <Card sx={{ opacity: bill.isPaid ? 0.7 : 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{bill.name}</Typography>
                  <Box>
                    {!bill.isPaid && (
                      <>
                        <IconButton size="small" onClick={() => handleOpenDialog(bill)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(bill._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Category: {bill.category}
                </Typography>
                {bill.isRecurring && (
                  <Typography variant="body2" color="textSecondary">
                    Recurring: {bill.frequency}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography variant="h5">${bill.amount.toFixed(2)}</Typography>
                  {!bill.isPaid && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckIcon />}
                      onClick={() => handlePayBill(bill._id)}
                    >
                      Pay Now
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Bill Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            select
            label="Category"
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({ ...formData, isRecurring: e.target.checked })
                }
              />
            }
            label="Recurring Bill"
            sx={{ mt: 2 }}
          />
          {formData.isRecurring && (
            <TextField
              select
              label="Frequency"
              fullWidth
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              margin="normal"
            >
              {frequencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={formData.notificationEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, notificationEnabled: e.target.checked })
                }
              />
            }
            label="Enable Notifications"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedBill ? 'Save Changes' : 'Add Bill'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
