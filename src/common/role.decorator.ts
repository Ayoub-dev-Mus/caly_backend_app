import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/enums/role';



export const HasRoles = (...roles: Role[]) => SetMetadata('role', roles);