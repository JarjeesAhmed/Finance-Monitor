import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { addTransaction, getCategories, addCategory, deleteCategory } from '../services/api';
import { getCategoryIcon } from '../utils/categoryIcons';

const AddTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Reset category if type changes
      if (name === 'type') {
        return { ...prev, [name]: value, category: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        setError('Category name is required');
        return;
      }

      const addedCategory = await addCategory({
        name: newCategory.name.trim(),
        type: formData.type,
      });

      setCategories(prev => ({
        ...prev,
        [formData.type]: [...prev[formData.type], addedCategory],
      }));

      setNewCategory({ name: '', type: 'expense' });
      setNewCategoryDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        await fetchCategories(); // Refresh categories
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      
      if (selectedImage) {
        formDataToSend.append('receiptImage', selectedImage);
      }

      await addTransaction(formDataToSend);
      navigate('/transactions');
    } catch (err) {
      console.error('Failed to add transaction:', err);
      setError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Add New Transaction
        </Typography>
        <Paper elevation={3} sx={{ p: 4, mt: 3, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                label="Type"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              disabled={loading}
              inputProps={{ min: "0", step: "0.01" }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
                required
                disabled={loading}
              >
                {categories[formData.type].map((category) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <MenuItem key={category._id} value={category.name}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon sx={{ 
                            color: formData.type === 'income' ? 'success.main' : 'error.main' 
                          }} />
                          {category.name}
                          {category.isCustom && (
                            <Typography variant="caption" color="text.secondary">
                              (Custom)
                            </Typography>
                          )}
                        </Box>
                        {category.isCustom && (
                          <Tooltip title="Delete Category">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category._id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
                <Divider />
                <MenuItem onClick={() => setNewCategoryDialog(true)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon />
                    Add New Category
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              multiline
              rows={2}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="date"
              label="Date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="receipt-image"
                type="file"
                onChange={handleImageChange}
                disabled={loading}
              />
              <label htmlFor="receipt-image">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  disabled={loading}
                >
                  Upload Receipt
                </Button>
              </label>
              {imagePreview && (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={imagePreview}
                    alt="Receipt preview"
                    variant="rounded"
                    sx={{ width: 56, height: 56 }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper',
                    }}
                    onClick={removeImage}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Transaction'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Add New Category Dialog */}
      <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddTransaction;
