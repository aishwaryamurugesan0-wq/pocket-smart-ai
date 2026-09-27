export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function validateRegister({ fullName, email, password, confirmPassword }) {
  const errors = {};
  if (!fullName || !fullName.trim()) errors.fullName = 'Full name is required.';
  if (!email || !email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

export function validateTransaction({ amount, category, transaction_date }) {
  const errors = {};
  const numAmount = Number(amount);
  if (amount === '' || amount === null || amount === undefined) errors.amount = 'Amount is required.';
  else if (Number.isNaN(numAmount) || numAmount <= 0) errors.amount = 'Amount must be a positive number.';
  if (!category) errors.category = 'Choose a category.';
  if (!transaction_date) errors.transaction_date = 'Choose a date.';
  return errors;
}

export function validateBudget({ category, amount }) {
  const errors = {};
  const numAmount = Number(amount);
  if (!category) errors.category = 'Choose a category.';
  if (amount === '' || Number.isNaN(numAmount) || numAmount < 0) errors.amount = 'Budget cannot be negative.';
  return errors;
}

export function validateSavingsGoal({ name, targetAmount, currentAmount }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Give your goal a name.';
  const target = Number(targetAmount);
  if (!targetAmount || Number.isNaN(target) || target <= 0) errors.targetAmount = 'Target must be greater than zero.';
  const current = Number(currentAmount);
  if (currentAmount !== '' && (Number.isNaN(current) || current < 0)) errors.currentAmount = 'Amount saved cannot be negative.';
  return errors;
}

export function validatePurchase({ itemName, price, availableBalance }) {
  const errors = {};
  if (!itemName || !itemName.trim()) errors.itemName = 'Enter what you want to buy.';
  const numPrice = Number(price);
  if (!price || Number.isNaN(numPrice) || numPrice <= 0) errors.price = 'Enter a valid price.';
  if (availableBalance !== undefined) {
    const numBalance = Number(availableBalance);
    if (Number.isNaN(numBalance)) errors.availableBalance = 'Enter a valid balance.';
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
