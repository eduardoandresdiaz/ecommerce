import { Controller, Post, Body, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './categories.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  addCategory(@Body() category: Category) {
    return this.categoriesService.addCategories(category);
  }

  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }
}

// import { Controller, Get } from '@nestjs/common';
// import { CategoriesService } from './categories.service';

// @Controller('categories')
// export class CategoriesController {
//   constructor(private categoriesService: CategoriesService) {}
//   @Get('seeder')
//   addCategories() {
//     return this.categoriesService.addCategories();
//   }
//   @Get()
//   getCategories() {
//     return this.categoriesService.getCategories();
//   }
// }
