import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowUpward as IncomeIcon,
  ArrowDownward as ExpenseIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboardStats, markBillAsPaid, updateGoalProgress } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    weeklyData: [],
    expensesBreakdown: [],
    recentTransactions: [],
    upcomingBills: [],
    goals: [],
  });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      console.log('Dashboard Stats Response:', response);
      if (response?.data) {
        response.data = response.data?.data?? {}
        setDashboardData({
          totalBalance: response.data.totalBalance || 0,
          weeklyData: response.data.weeklyData || [],
          expensesBreakdown: response.data.expensesBreakdown || [],
          recentTransactions: response.data.recentTransactions || [],
          upcomingBills: response.data.upcomingBills || [],
          goals: response.data.goals || [],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleAddTransaction = () => {
    navigate('/add-transaction');
  };

  const handlePayBill = async (billId) => {
    try {
      await markBillAsPaid(billId);
      loadDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error paying bill:', error);
    }
  };

  const handleOpenContributionDialog = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setIsContributionDialogOpen(true);
  };

  const handleCloseContributionDialog = () => {
    setIsContributionDialogOpen(false);
    setSelectedGoal(null);
    setContributionAmount('');
  };

  const handleContributeToGoal = async () => {
    if (!selectedGoal || !contributionAmount) return;

    try {
      await updateGoalProgress(selectedGoal._id, contributionAmount);
      handleCloseContributionDialog();
      loadDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error('Error contributing to goal:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Total Balance Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              Total Balance
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTransaction}
            >
              Add Transaction
            </Button>
          </Box>
          <Typography variant="h3" component="div" sx={{ mt: 2 }}>
            ${dashboardData.totalBalance.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Weekly Comparison Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Comparison
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={dashboardData.weeklyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="amount" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Expenses Breakdown */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expenses Breakdown
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.expensesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {dashboardData.expensesBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {dashboardData.recentTransactions.map((transaction) => (
                <Box
                  key={transaction._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Box display="flex" alignItems="center">
                    {transaction.type === 'income' ? (
                      <IncomeIcon color="success" />
                    ) : (
                      <ExpenseIcon color="error" />
                    )}
                    <Box ml={2}>
                      <Typography variant="subtitle1">{transaction.description}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="subtitle1"
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Bills */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Bills
              </Typography>
              {dashboardData.upcomingBills.map((bill) => (
                <Box
                  key={bill._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{bill.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      ${bill.amount.toFixed(2)}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handlePayBill(bill._id)}
                    >
                      Pay Now
                    </Button>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Goals */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Goals
              </Typography>
              <Grid container spacing={2}>
                {dashboardData.goals.map((goal) => (
                  <Grid item xs={12} sm={6} md={4} key={goal._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{goal.name}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenContributionDialog(goal)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                        <Box mt={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="textSecondary">
                              Progress
                            </Typography>
                            <Typography variant="body2">
                              ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(goal.currentAmount / goal.targetAmount) * 100}
                            sx={{ mt: 1, mb: 1 }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            Target Date: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contribution Dialog */}
      <Dialog open={isContributionDialogOpen} onClose={handleCloseContributionDialog}>
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
          <Button onClick={handleContributeToGoal} variant="contained" color="primary">
            Contribute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
