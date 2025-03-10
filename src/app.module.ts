import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { typeconfig } from './config/typeOrm.config';
import { JwtModule } from '@nestjs/jwt';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    typeconfig,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }, // expira en 1 hora
    }),
    FileUploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { ProductsModule } from './products/products.module';
// import { typeconfig } from './config/typeOrm.config';
// import { JwtModule } from '@nestjs/jwt';
// import { FileUploadModule } from './file-upload/file-upload.module';
// import { OrdersModule } from './orders/orders.module';
// import { CategoriesModule } from './categories/categories.module';

// @Module({
//   imports: [
//     typeconfig,
//     AuthModule,
//     UsersModule,
//     ProductsModule,
//     CategoriesModule, // Asegúrate de que CategoriesModule esté importado aquí
//     OrdersModule, // Aquí es donde agregas OrdersModule
//     JwtModule.register({
//       global: true,
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '1h' }, // expira en 1 hora
//     }),
//     FileUploadModule,
//   ],
//   controllers: [],
//   providers: [],
// })
// export class AppModule {}

// import { Module } from '@nestjs/common';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { ProductsModule } from './products/products.module';
// import { typeconfig } from './config/typeOrm.config';
// import { JwtModule } from '@nestjs/jwt';
// import { FileUploadModule } from './file-upload/file-upload.module';
// import { OrdersModule } from './orders/orders.module';

// @Module({
//   imports: [
//     typeconfig,
//     AuthModule,
//     UsersModule,
//     ProductsModule,
//     JwtModule.register({
//       global: true,
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '1h' }, ///expira en 1 hora
//     }),
//     FileUploadModule,
//   ],

//   controllers: [],
//   providers: [],
// })
// export class AppModule {}
