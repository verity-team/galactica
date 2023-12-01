import { IsNotEmpty } from "class-validator";

export class VerifySignatureDTO {
  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  signature: string;
}

export interface VerifySignatureResponse {
  accessToken: string;
}
