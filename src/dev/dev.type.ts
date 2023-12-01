import { IsEthereumAddress, IsNotEmpty, IsString } from "class-validator";

export class GetSiweMessageDTO {
  @IsString()
  @IsEthereumAddress()
  address: string;

  @IsNotEmpty()
  @IsString()
  nonce: string;
}

export interface GetSiweMessageResponse {
  message: string;
}
