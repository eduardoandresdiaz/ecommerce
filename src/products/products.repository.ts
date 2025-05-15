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
  async findProductsByKeywords(input: string): Promise<Product[]> {
    const keywords = input
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1); // Ignora palabras muy cortas como "a", "y", etc.

    if (keywords.length === 0) return [];

    const query = this.productRepository.createQueryBuilder('product');

    const whereExpressions: string[] = [];
    const parameters: Record<string, string> = {};

    keywords.forEach((word, index) => {
      const param = `%${word}%`;
      parameters[`kw${index}`] = param;

      whereExpressions.push(`
        LOWER(product.name) LIKE :kw${index}
        OR LOWER(product.description) LIKE :kw${index}
      `);
    });

    query.where(whereExpressions.join(' OR '), parameters);

    const products = await query.getMany();

    const rankedProducts = products
      .map((product) => {
        const text = (product.name + ' ' + product.description).toLowerCase();

        const matchCount = keywords.filter((kw) => text.includes(kw)).length;

        return { product, matchCount };
      })
      .filter((p) => p.matchCount > 0) // ✅ Excluye los que no coinciden con ninguna palabra
      .sort((a, b) => b.matchCount - a.matchCount); // Ordena por relevancia

    return rankedProducts.map(({ product }) => product);
  }
  async getProducts(page: number = 1, limit: number = 100): Promise<Product[]> {
    return await this.productRepository.find({
      relations: {
        category: true,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit, // Salta los registros de las páginas anteriores
      take: limit, // Limita la cantidad de registros devueltos
    });
  }

  // async getProducts(page: number = 1, limit: number = 100): Promise<Product[]> {
  //   const products = await this.productRepository.find({
  //     relations: {
  //       category: true,
  //     },
  //   });
  //   let inStock = products.filter((product) => product.stock > 0);
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = startIndex + limit;
  //   inStock = inStock.slice(startIndex, endIndex);
  //   return inStock;
  // }
  async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { creatorEmail },
      relations: {
        category: true,
      },
      order: {
        createdAt: 'DESC', // Ordenar por fecha de creación, descendente
      },
    });
  }

  // async getProductsByCreatorEmail(creatorEmail: string): Promise<Product[]> {
  //   return await this.productRepository.find({
  //     where: { creatorEmail },
  //     relations: {
  //       category: true,
  //     },
  //   });
  // }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
    }
    return product;
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findOneBy({ id });
    if (!existingProduct) {
      throw new NotFoundException(`Producto con ID ${id} no fue encontrado.`);
    }

    if (productData.category && productData.category.id) {
      const category = await this.categoriesRepository.findOneBy({
        id: productData.category.id,
      });
      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${productData.category.id} no fue encontrada.`,
        );
      }
      productData.category = category;
    }

    await this.productRepository.save({ id, ...productData });
    return await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });
  }

  async createProduct(productData: Partial<Product>): Promise<string> {
    if (!productData.category || !productData.category.name) {
      throw new Error('La categoría es obligatoria y debe incluir un nombre.');
    }

    try {
      let category = await this.categoriesRepository.findOne({
        where: { name: productData.category.name },
      });

      if (!category) {
        category = new Category();
        category.name = productData.category.name;
        category = await this.categoriesRepository.save(category);
      }

      const product = new Product();
      product.name = productData.name;
      product.description = productData.description;
      product.price = productData.price;
      product.stock = productData.stock;
      product.imgUrl =
        productData.imgUrl ||
        'https://res.cloudinary.com/dvp0fdhyc/image/upload/v1742769896/cyi4pszz0ighbcdgpujw.jpg';
      product.creatorEmail = productData.creatorEmail;
      product.telefono = productData.telefono || null;

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
      const productsArray: any[] = [
        {
          name: 'Producto ejemplo 1',
          description: 'Descripción del producto ejemplo 1',
          price: 500,
          stock: 10,
          imgUrl: 'https://via.placeholder.com/150',
          category: 'Categoría ejemplo 1',
          telefono: '123-456-789',
        },
        {
          name: 'Producto ejemplo 2',
          description: 'Descripción del producto ejemplo 2',
          price: 1000,
          stock: 20,
          imgUrl: 'https://via.placeholder.com/150',
          category: 'Categoría ejemplo 2',
          telefono: '987-654-321',
        },
      ];

      for (const element of productsArray) {
        let category = categories.find((cat) => cat.name === element.category);

        if (!category) {
          category = new Category();
          category.name = element.category;
          await this.categoriesRepository.save(category);
          categories.push(category);
        }

        const product = new Product();
        product.name = element.name;
        product.description = element.description;
        product.price = element.price;
        product.stock = element.stock;
        product.imgUrl = element.imgUrl;
        product.telefono = element.telefono;
        product.category = category;

        product.createdAt = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(product.createdAt.getDate() + 15);
        product.expiresAt = expirationDate;

        await this.productRepository.save(product);
      }

      return 'Productos agregados correctamente';
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
