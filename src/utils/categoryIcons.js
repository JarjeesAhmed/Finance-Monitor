import {
  AttachMoney,
  Work,
  Business,
  AccountBalance,
  LocalAtm,
  Restaurant,
  DirectionsCar,
  Home,
  LocalMovies,
  ShoppingCart,
  LocalHospital,
  School,
  Flight,
  CardGiftcard,
  Payments,
} from '@mui/icons-material';

export const categoryIcons = {
  // Income categories
  Salary: Work,
  Freelance: Business,
  Investment: AccountBalance,
  'Bank Transfer': LocalAtm,
  Other: AttachMoney,

  // Expense categories
  Food: Restaurant,
  Transportation: DirectionsCar,
  Housing: Home,
  Entertainment: LocalMovies,
  Shopping: ShoppingCart,
  Healthcare: LocalHospital,
  Education: School,
  Travel: Flight,
  Gifts: CardGiftcard,
  Bills: Payments,
};

export const getCategoryIcon = (category) => {
  return categoryIcons[category] || AttachMoney;
};
