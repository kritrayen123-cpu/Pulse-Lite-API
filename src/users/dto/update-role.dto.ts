import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class UpdateRoleDto {
  @IsEnum(Role)
  role: Role;
}