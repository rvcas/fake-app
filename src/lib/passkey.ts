import { Registration, Authentication } from "webauthx/client";
import * as api from "./api";

export type PasskeyCredential = {
  credentialId: string;
  publicKey: string; // hex-encoded P-256 public key
};

export async function registerPasskey(username: string): Promise<PasskeyCredential> {
  const { sessionId, options } = await api.registerOptions(username);

  // webauthx/client accepts serialized options from the server
  const credential = await Registration.create({
    options: options as never,
  });

  const result = await api.registerVerify(sessionId, credential);
  if (result.error) throw new Error(result.error);

  return {
    credentialId: result.credentialId,
    publicKey: result.publicKey,
  };
}

export async function authenticatePasskey(credentialId?: string): Promise<PasskeyCredential> {
  const { sessionId, options } = await api.authOptions(credentialId);

  // webauthx/client accepts serialized options from the server
  const response = await Authentication.sign({
    options: options as never,
  });

  const result = await api.authVerify(sessionId, response);
  if (result.error) throw new Error(result.error);
  if (!result.valid) throw new Error("Authentication failed");

  return {
    credentialId: result.credentialId!,
    publicKey: result.publicKey!,
  };
}
