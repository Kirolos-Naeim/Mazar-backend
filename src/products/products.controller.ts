import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AdminGuard } from '../common/admin.guard';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  listProducts() {
    return this.productsService.listPublic();
  }

  @UseGuards(AdminGuard)
  @Get('admin/products')
  listAdminProducts() {
    return this.productsService.listAll();
  }

  @UseGuards(AdminGuard)
  @Post('admin/products')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Put('admin/products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('admin/products/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
