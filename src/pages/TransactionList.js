import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Image as ImageIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { getTransactions, deleteTransaction } from '../services/api';
import { getCategoryIcon } from '../utils/categoryIcons';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(id);
        setTransactions((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        console.error('Failed to delete transaction:', err);
        setError('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
    return type === 'income' ? `+${formattedAmount}` : `-${formattedAmount}`;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transactions
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3}>
          <List>
            {transactions.length === 0 ? (
              <ListItem>
                <ListItemText primary="No transactions found" />
              </ListItem>
            ) : (
              transactions.map((transaction) => {
                const CategoryIcon = getCategoryIcon(transaction.category);
                return (
                  <ListItem
                    key={transaction._id}
                    divider
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: transaction.type === 'income' ? 'success.main' : 'error.main',
                        }}
                      >
                        <CategoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" component="span">
                          {transaction.category}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(transaction.date)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mr: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color:
                            transaction.type === 'income'
                              ? 'success.main'
                              : 'error.main',
                          fontWeight: 'medium',
                        }}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </Typography>
                      {transaction.receiptImage?.url && (
                        <Tooltip title="View Receipt">
                          <IconButton
                            edge="end"
                            onClick={() => handleImageClick(transaction.receiptImage.url)}
                            size="small"
                          >
                            <ReceiptIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(transaction._id)}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })
            )}
          </List>
        </Paper>
      </Box>

      {/* Receipt Image Dialog */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt Image</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
            }}
          >
            <img
              src={selectedImage}
              alt="Receipt"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TransactionList;
