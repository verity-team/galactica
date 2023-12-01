import { IsEthereumAddress, IsNotEmpty } from "class-validator";

export class GetSiweMessageDTO {
  @IsEthereumAddress()
  address: string;

  @IsNotEmpty()
  nonce: string;
}

export interface GetSiweMessageResponse {
  message: string;
}
