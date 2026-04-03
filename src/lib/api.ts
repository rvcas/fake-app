type RegisterOptionsResponse = {
  sessionId: string;
  // Serialized CredentialCreationOptions from webauthx/server
  options: Record<string, unknown>;
};

type RegisterVerifyResponse = {
  credentialId: string;
  publicKey: string;
  error?: string;
};

type AuthOptionsResponse = {
  sessionId: string;
  // Serialized CredentialRequestOptions from webauthx/server
  options: Record<string, unknown>;
};

type AuthVerifyResponse = {
  valid: boolean;
  credentialId?: string;
  publicKey?: string;
  error?: string;
};

export async function registerOptions(username: string): Promise<RegisterOptionsResponse> {
  const res = await fetch("/api/register/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  return res.json();
}

export async function registerVerify(
  sessionId: string,
  credential: unknown,
): Promise<RegisterVerifyResponse> {
  const res = await fetch("/api/register/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, credential }),
  });
  return res.json();
}

export async function authOptions(credentialId?: string): Promise<AuthOptionsResponse> {
  const res = await fetch("/api/auth/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credentialId }),
  });
  return res.json();
}

export async function authVerify(
  sessionId: string,
  response: unknown,
): Promise<AuthVerifyResponse> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, response }),
  });
  return res.json();
}
