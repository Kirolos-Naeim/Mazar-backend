import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested, IsInt, Min, Matches } from 'class-validator';
import { PaymentMethod, OrderStatus } from '@prisma/client';

class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateGuestOrderDto extends CreateOrderDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone must be a valid international phone number' })
  phone!: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  paymentConfirmed?: boolean;
}
