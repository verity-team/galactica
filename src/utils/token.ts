import { Jwt, JwtPayload, VerifyErrors, verify } from "jsonwebtoken";

export async function verifyJwtAsync<T>(
  accessToken: string,
): Promise<T & JwtPayload> {
  const verifyAsync = async (accessToken: string): Promise<T & JwtPayload> => {
    return new Promise((resolve, reject) => {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        throw new Error("JWT Secret Key is required to start the server");
      }

      verify(
        accessToken,
        secretKey,
        undefined,
        (error: VerifyErrors, decoded: Jwt) => {
          if (error != null) {
            reject(error);
          }

          resolve(decoded.payload as T);
        },
      );
    });
  };

  return await verifyAsync(accessToken);
}
