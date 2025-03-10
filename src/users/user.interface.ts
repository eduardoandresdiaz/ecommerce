import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './user.entity';
import { validateUser } from 'src/utils/validate';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: FileUploadService,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.userService.getUsers(page, limit);
  }
  @HttpCode(200)
  @Get(':id')
  @UseGuards(AuthGuard)
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getUserById(id);
  }

  @HttpCode(200)
  @Put(':id')
  @UseGuards(AuthGuard)
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRegistry: User,
  ) {
    if (validateUser(updateUserRegistry)) {
      return this.userService.updateUser(String(id), updateUserRegistry);
    }
    return 'usuario no valido';
  }
  @HttpCode(200)
  @Delete(':id')
  @UseGuards(AuthGuard)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    console.log('users controller delete');
    return this.userService.deleteUser(id);
  }
}
