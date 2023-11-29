export interface VerifySignatureDTO {
  message: string;
  signature: string;
}

export interface VerifySignatureResponse {
  accessToken: string;
}
