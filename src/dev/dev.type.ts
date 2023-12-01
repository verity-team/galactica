import { IsEthereumAddress, IsString } from "class-validator";

export class GetSiweMessageDTO {
  @IsString()
  @IsEthereumAddress()
  address: string;

  @IsString()
  nonce: string;
}

export interface GetSiweMessageResponse {
  message: string;
}
