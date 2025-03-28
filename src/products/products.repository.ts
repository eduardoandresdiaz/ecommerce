import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { Category } from '../categories/categories.entity';
import { NotFoundException } from '@nestjs/common';

export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async getProducts(page: number = 1, limit: number = 100): Promise<Product[]> {
    const products = await this.productRepository.find({
      relations: {
        category: true,
      },
    });
    let inStock = products.filter((product) => product.stock > 0);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    inStock = inStock.slice(startIndex, endIndex);
    return inStock;
  }

  async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { creatorEmail },
      relations: {
        category: true, // Incluye la relación con categorías
      },
    });
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
    }
    return product;
  }

  async updateProduct(id: string, product: Product): Promise<Product> {
    await this.productRepository.update(id, product);
    const updatedProduct = await this.productRepository.findOneBy({ id });
    return updatedProduct;
  }

  async createProduct(productData: Partial<Product>): Promise<string> {
    // Verificar si el nombre de la categoría fue proporcionado
    if (!productData.category || !productData.category.name) {
      throw new Error('La categoría es obligatoria y debe incluir un nombre.');
    }

    try {
      // Buscar o crear la categoría
      let category = await this.categoriesRepository.findOne({
        where: { name: productData.category.name },
      });

      if (!category) {
        // Si la categoría no existe, crearla
        category = new Category();
        category.name = productData.category.name;
        category = await this.categoriesRepository.save(category);
      }

      // Crear el producto con la categoría asignada
      const product = new Product();
      product.name = productData.name;
      product.description = productData.description;
      product.price = productData.price;
      product.stock = productData.stock;
      product.imgUrl =
        productData.imgUrl ||
        'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';
      product.creatorEmail = productData.creatorEmail;

      product.createdAt = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(product.createdAt.getDate() + 15);
      product.expiresAt = expirationDate;

      product.category = category;

      await this.productRepository.save(product);
      return `Producto creado exitosamente con ID: ${product.id}`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error creando producto: ${error.message}`);
      } else {
        throw new Error('Error desconocido al crear producto');
      }
    }
  }

  async deleteProduct(id: string): Promise<Partial<Product>> {
    const productToDelete = await this.productRepository.findOneBy({ id });

    if (!productToDelete) {
      throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
    }

    await this.productRepository.remove(productToDelete);
    return productToDelete;
  }

  async findProductByName(name: string): Promise<Product | string> {
    const product = await this.productRepository.findOne({
      where: { name },
    });

    if (product) {
      return product;
    } else {
      return 'Este producto no existe';
    }
  }

  async addProducts(): Promise<string> {
    const categories = await this.categoriesRepository.find();

    try {
      const productsArray: any[] = []; // Importa tus datos JSON de seeders aquí

      if (productsArray.length === 0) {
        throw new Error('No se encontraron productos');
      }

      for (const element of productsArray) {
        const relatedCategory = await this.verifyAndAddCategories(
          categories,
          element.category,
        );

        const product = new Product();
        product.name = element.name;
        product.description = element.description;
        product.price = element.price;
        product.stock = element.stock;
        product.imgUrl =
          element.imgUrl ||
          'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';
        product.category = relatedCategory;

        product.createdAt = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(product.createdAt.getDate() + 15);
        product.expiresAt = expirationDate;

        await this.productRepository.save(product);
      }

      return 'Productos agregados';
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error agregando productos: ${error.message}`);
      } else {
        throw new Error('Error desconocido al agregar productos');
      }
    }
  }

  async verifyAndAddCategories(
    categories: Category[],
    categoryName: string,
  ): Promise<Category> {
    let category = categories.find((cat) => cat.name === categoryName);

    if (!category) {
      category = new Category();
      category.name = categoryName;
      await this.categoriesRepository.save(category);
      categories = await this.categoriesRepository.find();
    }

    return category;
  }
}

// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Product } from './products.entity';
// import { Category } from '../categories/categories.entity';
// import { NotFoundException } from '@nestjs/common';

// export class ProductRepository {
//   constructor(
//     @InjectRepository(Product)
//     private productRepository: Repository<Product>,
//     @InjectRepository(Category)
//     private categoriesRepository: Repository<Category>,
//   ) {}

//   async getProducts(page: number = 1, limit: number = 100): Promise<Product[]> {
//     const products = await this.productRepository.find({
//       relations: {
//         category: true,
//       },
//     });
//     let inStock = products.filter((product) => product.stock > 0);
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + limit;
//     inStock = inStock.slice(startIndex, endIndex);
//     return inStock;
//   }

//   async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
//     return await this.productRepository.find({
//       where: { creatorEmail },
//       relations: {
//         category: true, // Incluye la relación con categorías
//       },
//     });
//   }

//   async getProductById(id: string): Promise<Product> {
//     const product = await this.productRepository.findOneBy({ id });
//     if (!product) {
//       throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
//     }
//     return product;
//   }

//   async updateProduct(id: string, product: Product): Promise<Product> {
//     await this.productRepository.update(id, product);
//     const updatedProduct = await this.productRepository.findOneBy({ id });
//     return updatedProduct;
//   }

//   async createProduct(productData: Partial<Product>): Promise<string> {
//     const existingProduct = await this.findProductByName(productData.name);
//     if (typeof existingProduct !== 'string') {
//       return 'El producto ya existe';
//     }

//     try {
//       let category = await this.categoriesRepository.findOne({
//         where: { name: productData.category.name },
//       });

//       if (!category) {
//         category = new Category();
//         category.name = productData.category.name;
//         category = await this.categoriesRepository.save(category);
//       }

//       const product = new Product();
//       product.name = productData.name;
//       product.description = productData.description;
//       product.price = productData.price;
//       product.stock = productData.stock;
//       product.imgUrl =
//         productData.imgUrl ||
//         'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';
//       product.creatorEmail = productData.creatorEmail;

//       product.createdAt = new Date();
//       const expirationDate = new Date();
//       expirationDate.setDate(product.createdAt.getDate() + 15);
//       product.expiresAt = expirationDate;

//       product.category = category;

//       await this.productRepository.save(product);
//       return `Producto creado exitosamente con ID: ${product.id}`;
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         throw new Error(`Error creando producto: ${error.message}`);
//       } else {
//         throw new Error('Error desconocido al crear producto');
//       }
//     }
//   }

//   async deleteProduct(id: string): Promise<Partial<Product>> {
//     const productToDelete = await this.productRepository.findOneBy({ id });

//     if (!productToDelete) {
//       throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
//     }

//     await this.productRepository.remove(productToDelete);
//     return productToDelete;
//   }

//   async findProductByName(name: string): Promise<Product | string> {
//     const product = await this.productRepository.findOne({
//       where: { name },
//     });

//     if (product) {
//       return product;
//     } else {
//       return 'Este producto no existe';
//     }
//   }

//   async addProducts(): Promise<string> {
//     const categories = await this.categoriesRepository.find();

//     try {
//       const productsArray: any[] = []; // Importa tus datos JSON de seeders aquí

//       if (productsArray.length === 0) {
//         throw new Error('No se encontraron productos');
//       }

//       for (const element of productsArray) {
//         const relatedCategory = await this.verifyAndAddCategories(
//           categories,
//           element.category,
//         );

//         const product = new Product();
//         product.name = element.name;
//         product.description = element.description;
//         product.price = element.price;
//         product.stock = element.stock;
//         product.imgUrl =
//           element.imgUrl ||
//           'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';
//         product.category = relatedCategory;

//         product.createdAt = new Date();
//         const expirationDate = new Date();
//         expirationDate.setDate(product.createdAt.getDate() + 15);
//         product.expiresAt = expirationDate;

//         await this.productRepository.save(product);
//       }

//       return 'Productos agregados';
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         throw new Error(`Error agregando productos: ${error.message}`);
//       } else {
//         throw new Error('Error desconocido al agregar productos');
//       }
//     }
//   }

//   async verifyAndAddCategories(
//     categories: Category[],
//     categoryName: string,
//   ): Promise<Category> {
//     let category = categories.find((cat) => cat.name === categoryName);

//     if (!category) {
//       category = new Category();
//       category.name = categoryName;
//       await this.categoriesRepository.save(category);
//       categories = await this.categoriesRepository.find();
//     }

//     return category;
//   }
// }
