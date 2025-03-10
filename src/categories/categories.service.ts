import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './categories.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  addCategories(category: Category) {
    return this.categoriesRepository.save(category);
  }

  getCategories(): Promise<Category[]> {
    return this.categoriesRepository.find();
  }
}

// import { Injectable } from '@nestjs/common';
// import { CategoriesRepository } from './categories.repository';

// @Injectable()
// export class CategoriesService {
//   constructor(private categoriesRepository: CategoriesRepository) {}
//   addCategories() {
//     return this.categoriesRepository.addCategories();
//   }
//   getCategories() {
//     return this.categoriesRepository.getCategories();
//   }
// }
