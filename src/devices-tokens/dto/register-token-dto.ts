import { User } from "src/users/entities/user.entity";

export class RegisterTokenDto {
    token: string;
    user: User; // Assuming you're identifying users by a numeric ID
  }