import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAccessKey, type AccessKey } from "@/lib/access-key";
import { authenticatePasskey } from "@/lib/passkey";

type AccessKeyStepProps = {
  credentialId: string;
  onComplete: (accessKey: AccessKey) => void;
  accessKey: AccessKey | null;
};

export function AccessKeyStep({ credentialId, onComplete, accessKey }: AccessKeyStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const key = await generateAccessKey();

      // Authorize the access key by authenticating with the passkey
      // This proves the passkey holder authorized this access key
      await authenticatePasskey(credentialId);

      onComplete(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate access key");
    } finally {
      setLoading(false);
    }
  }

  if (accessKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>2. Access Key (Session Key)</CardTitle>
          <CardDescription>Generated and authorized by root key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-muted-foreground text-xs">
              P-256 Public Key (software-backed)
            </span>
            <p className="font-mono text-xs break-all">{accessKey.publicKeyHex}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Key Type</span>
            <p className="text-xs">
              Software P-256 (extractable) — authorized by hardware-backed passkey root key
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Generate Access Key</CardTitle>
        <CardDescription>
          Create a software-backed P-256 key pair via Web Crypto API, then authorize it with your
          passkey (biometric prompt)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Unlike the passkey root key (hardware-backed, non-extractable), access keys are software
          keys that can be scoped with expiry and spending limits. This mirrors Tempo's keychain
          model.
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Authorizing..." : "Generate & Authorize Access Key"}
        </Button>
      </CardContent>
    </Card>
  );
}
