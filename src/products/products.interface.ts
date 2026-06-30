export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imgUrl: string;
  // 🔹 Nuevos campos
  stockminimo: number;
  ubicacion: string;
}
