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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getGoals, addGoal, updateGoal, deleteGoal, updateGoalProgress } from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openContributionDialog, setOpenContributionDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await getGoals();
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
        category: goal.category,
      });
      setSelectedGoal(goal);
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        targetDate: '',
        category: '',
      });
      setSelectedGoal(null);
    }
    setOpenDialog(true);
  };

  const handleOpenContributionDialog = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setOpenContributionDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGoal(null);
  };

  const handleCloseContributionDialog = () => {
    setOpenContributionDialog(false);
    setSelectedGoal(null);
    setContributionAmount('');
  };

  const handleSubmit = async () => {
    try {
      if (selectedGoal) {
        await updateGoal(selectedGoal._id, formData);
      } else {
        await addGoal(formData);
      }
      handleCloseDialog();
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
        loadGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleContribute = async () => {
    if (!selectedGoal || !contributionAmount) return;

    try {
      await updateGoalProgress(selectedGoal._id, contributionAmount);
      handleCloseContributionDialog();
      loadGoals();
    } catch (error) {
      console.error('Error contributing to goal:', error);
    }
  };

  const categories = [
    'Savings',
    'Investment',
    'Emergency Fund',
    'Vacation',
    'Education',
    'Home',
    'Vehicle',
    'Other',
  ];

  const calculateProgress = (current, target) => (current / target) * 100;

  const calculateTimeLeft = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Financial Goals</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => (
          <Grid item xs={12} md={6} lg={4} key={goal._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{goal.name}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(goal._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Category: {goal.category}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Progress
                    </Typography>
                    <Typography variant="body2">
                      ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(goal.currentAmount, goal.targetAmount)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Target Date: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Days Left: {calculateTimeLeft(goal.targetDate)}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<SavingsIcon />}
                  onClick={() => handleOpenContributionDialog(goal)}
                  sx={{ mt: 2 }}
                >
                  Add Contribution
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Goal Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
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
          <TextField
            label="Target Amount"
            type="number"
            fullWidth
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
          <TextField
            label="Current Amount"
            type="number"
            fullWidth
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
          <TextField
            label="Target Date"
            type="date"
            fullWidth
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedGoal ? 'Save Changes' : 'Add Goal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog open={openContributionDialog} onClose={handleCloseContributionDialog}>
        <DialogTitle>Contribute to Goal: {selectedGoal?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Contribution Amount"
            type="number"
            fullWidth
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            InputProps={{
              startAdornment: <Typography>$</Typography>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContributionDialog}>Cancel</Button>
          <Button onClick={handleContribute} variant="contained" color="primary">
            Contribute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Goals;
