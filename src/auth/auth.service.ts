import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginCustomerDto, RegisterCustomerDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async registerCustomer(dto: RegisterCustomerDto) {
    const phone = dto.phone.trim();
    const username = dto.username.trim().toLowerCase();

    const [phoneExists, usernameExists] = await Promise.all([
      this.prisma.user.findUnique({ where: { phone } }),
      this.prisma.user.findUnique({ where: { username } }),
    ]);

    if (phoneExists) {
      throw new ConflictException('Phone already registered. Please login instead.');
    }

    if (usernameExists) {
      throw new ConflictException('Username already taken.');
    }

    const user = await this.prisma.user.create({
      data: {
        phone,
        username,
        passwordHash: this.hashPassword(dto.password),
        name: dto.username,
        address: dto.address.trim(),
        location: dto.location.trim(),
        role: Role.CUSTOMER,
      },
    });

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken, user };
  }

  async loginCustomer(dto: LoginCustomerDto) {
    const username = dto.username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || user.role !== Role.CUSTOMER || !user.passwordHash) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const ok = this.verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid username or password.');

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken, user };
  }

  async loginAdmin(dto: LoginCustomerDto) {
    const username = dto.username.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || user.role !== Role.ADMIN || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const ok = this.verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { accessToken, user };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const hashedBuffer = scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(hash, 'hex');
    if (hashedBuffer.length !== hashBuffer.length) return false;
    return timingSafeEqual(hashedBuffer, hashBuffer);
  }
}
