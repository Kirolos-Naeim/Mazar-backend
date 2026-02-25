import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateGuestOrderDto, CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { RequestUser } from '../common/request-user';
import { AdminGuard } from '../common/admin.guard';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('orders')
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user, dto);
  }

  @Post('guest/orders')
  createGuest(@Body() dto: CreateGuestOrderDto) {
    return this.ordersService.createGuest(dto);
  }

  @Get('orders/my')
  myOrders(@CurrentUser() user: RequestUser) {
    return this.ordersService.myOrders(user.id);
  }

  @Get('orders/:id')
  getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.ordersService.getById(user, id);
  }

  @UseGuards(AdminGuard)
  @Get('admin/orders')
  adminOrders() {
    return this.ordersService.allOrders();
  }

  @UseGuards(AdminGuard)
  @Get('admin/orders/:id')
  adminOrderById(@Param('id') id: string) {
    return this.ordersService.adminOrderById(id);
  }

  @UseGuards(AdminGuard)
  @Put('admin/orders/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
