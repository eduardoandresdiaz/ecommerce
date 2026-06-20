import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: any;
  }
}

// 👉 Agregamos Product como tipo global
declare global {
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imgUrl?: string;
    creatorEmail?: string;
    telefono?: string;
    createdAt: string;
    expiresAt?: string;

    // Nuevos campos
    mostrarprecio: boolean;
    resaltaroferta: boolean;
    nopublicable: boolean;
    proveedor?: string;
  }
}
