import { IsString } from "class-validator";

export class SignInWithCredentialsDTO {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
