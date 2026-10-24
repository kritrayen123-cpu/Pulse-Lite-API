import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import type { AuthenticatedRequest } from '../auth/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.usersService.getByIdOrFail(req.user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateRole(id, dto.role, req.user.sub);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.remove(id, req.user.sub);
  }
}