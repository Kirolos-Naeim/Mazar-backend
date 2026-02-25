import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  listPublic() {
    return this.prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAll() {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false, stock: 0 },
    });
  }
}
