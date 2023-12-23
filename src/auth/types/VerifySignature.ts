import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";

export class VerifySignatureDTO {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  signature: string;
}

export class AccessTokenPayload {
  @IsEthereumAddress()
  address: string;

  @IsString()
  role: Role;
}
