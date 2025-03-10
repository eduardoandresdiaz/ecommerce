import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import data from '../utils/seeders/data.json'; // Importación correcta del JSON
import { Category } from 'src/categories/categories.entity';
import { Product } from './products.entity';
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

  async getProductById(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
    }
    return product;
  }

  async updateProduct(id: string, product: Product) {
    await this.productRepository.update(id, product);
    const updatedProduct = await this.productRepository.findOneBy({ id });
    return updatedProduct;
  }

  async createProduct(products: Partial<Product>): Promise<string> {
    // Verificar si el producto ya existe
    const existingProduct = await this.findProductByName(products.name);
    if (typeof existingProduct !== 'string') {
      return 'El producto ya existe';
    }

    try {
      // Verificar si la categoría existe, y si no, agregarla
      let category = await this.categoriesRepository.findOne({
        where: { name: products.category.name },
      });

      if (!category) {
        category = new Category();
        category.name = products.category.name;
        category = await this.categoriesRepository.save(category);
      }

      const product = new Product();
      product.name = products.name;
      product.description = products.description;
      product.price = products.price;
      product.stock = products.stock;
      product.imgUrl =
        products.imgUrl ||
        'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
      product.category = category;

      await this.productRepository.save(product);
      return 'Producto creado exitosamente';
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

  async addProducts() {
    const categories = await this.categoriesRepository.find();

    try {
      const productsArray: any[] = Array.isArray(data) ? data : [];

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
          'https://www.thermaxglobal.com/wp-content/uploads/2020/05/image-not-found.jpg';
        product.category = relatedCategory;

        await this.productRepository
          .createQueryBuilder()
          .insert()
          .into(Product)
          .values(product)
          .orUpdate(['description', 'price', 'stock'], ['name'])
          .execute();
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

  // Función para encontrar un producto por nombre
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
}
