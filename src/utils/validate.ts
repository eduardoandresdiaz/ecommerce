export function validateUser(user: any): boolean {
  const isValidUser =
    user.name && user.email && user.password && user.address && user.phone;
  return Boolean(isValidUser);
}

export function validateProduct(product: any): boolean {
  const isValidProduct =
    product.name &&
    product.price &&
    product.category &&
    product.stock;

  // ✅ Validar booleanos
  const validBooleans =
    typeof product.mostrarprecio === 'boolean' &&
    typeof product.resaltaroferta === 'boolean' &&
    typeof product.nopublicable === 'boolean';

  // ✅ Validar proveedor (string o null)
  const validProveedor =
    product.proveedor === null || typeof product.proveedor === 'string';

  return Boolean(isValidProduct && validBooleans && validProveedor);
}

// export function validateUser(user: any): boolean {
//   const isValidUser =
//     user.name && user.email && user.password && user.address && user.phone;
//   return isValidUser;
// }
// export function validateProduct(product: any): boolean {
//   const isValidProduct =
//     product.name && product.price && product.category && product.stock;
//   return Boolean(isValidProduct);
// }
