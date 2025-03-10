export function validateUser(user: any): boolean {
  const isValidUser =
    user.name && user.email && user.password && user.address && user.phone;
  return isValidUser;
}
export function validateProduct(product: any): boolean {
  const isValidProduct =
    product.name && product.price && product.category && product.stock;
  return Boolean(isValidProduct);
}
