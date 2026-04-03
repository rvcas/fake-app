import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerPasskey, type PasskeyCredential } from "@/lib/passkey";

type RegisterStepProps = {
  onComplete: (credential: PasskeyCredential) => void;
  credential: PasskeyCredential | null;
};

export function RegisterStep({ onComplete, credential }: RegisterStepProps) {
  const [username, setUsername] = useState("midnight-user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setLoading(true);
    setError(null);
    try {
      const result = await registerPasskey(username);
      onComplete(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (credential) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>1. Root Key (Passkey)</CardTitle>
          <CardDescription>Registered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground text-xs">Credential ID</span>
            <p className="font-mono text-xs break-all">{credential.credentialId}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">P-256 Public Key</span>
            <p className="font-mono text-xs break-all">{credential.publicKey}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Register Passkey (Root Key)</CardTitle>
        <CardDescription>
          Create a P-256 WebAuthn credential backed by your device's secure enclave (Touch ID, Face
          ID, YubiKey)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="username" className="text-xs text-muted-foreground">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button onClick={handleRegister} disabled={loading || !username}>
          {loading ? "Waiting for passkey..." : "Create Passkey"}
        </Button>
      </CardContent>
    </Card>
  );
}
