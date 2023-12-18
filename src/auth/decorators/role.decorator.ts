import { SetMetadata, CustomDecorator } from "@nestjs/common";

export const Roles = (...roles: Role[]): CustomDecorator<string> =>
  SetMetadata("roles", roles);
