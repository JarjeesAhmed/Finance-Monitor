import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { getExpenseAnalytics } from '../services/api';

const Expenses = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('3months');
  const [expenseData, setExpenseData] = useState({
    monthlyExpenses: [],
    categoryBreakdown: [],
    totalExpenses: 0,
    averageExpense: 0,
    highestExpense: 0,
    mostFrequentCategory: '',
  });

  useEffect(() => {
    loadExpenseData();
  }, [timeRange]);

  const loadExpenseData = async () => {
    try {
      const endDate = endOfMonth(new Date());
      let startDate;

      switch (timeRange) {
        case '1month':
          startDate = startOfMonth(new Date());
          break;
        case '3months':
          startDate = startOfMonth(subMonths(new Date(), 2));
          break;
        case '6months':
          startDate = startOfMonth(subMonths(new Date(), 5));
          break;
        case '1year':
          startDate = startOfMonth(subMonths(new Date(), 11));
          break;
        default:
          startDate = startOfMonth(subMonths(new Date(), 2));
      }

      const response = await getExpenseAnalytics(startDate, endDate);
      setExpenseData(response.data);
    } catch (error) {
      console.error('Error loading expense data:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Expense Analytics</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="1month">Last Month</MenuItem>
            <MenuItem value="3months">Last 3 Months</MenuItem>
            <MenuItem value="6months">Last 6 Months</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h3">${expenseData.totalExpenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Average Monthly Expense
              </Typography>
              <Typography variant="h3">${expenseData.averageExpense.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Highest Monthly Expense
              </Typography>
              <Typography variant="h3">${expenseData.highestExpense.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Expenses Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Expenses Trend
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={expenseData.monthlyExpenses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => format(new Date(value), 'MMMM yyyy')}
                      formatter={(value) => ['$' + value.toFixed(2), 'Expenses']}
                    />
                    <Legend />
                    <Bar
                      dataKey="amount"
                      name="Expenses"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Categories
              </Typography>
              <Box sx={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={expenseData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => ['$' + value.toFixed(2), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Details
              </Typography>
              <Box sx={{ mt: 2 }}>
                {expenseData.categoryBreakdown.map((category, index) => (
                  <Box
                    key={category.name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length],
                          mr: 2,
                        }}
                      />
                      <Typography variant="subtitle1">{category.name}</Typography>
                    </Box>
                    <Typography variant="subtitle1">${category.value.toFixed(2)}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Expenses;
