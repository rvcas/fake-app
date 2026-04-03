import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PASSKEYS_ORIGIN = "https://passkeys.rvcas.dev";
const EMBED_URL = `${PASSKEYS_ORIGIN}/embed`;

type AuthResult = {
  credential: { credentialId: string; publicKey: string };
  did: string;
  didDocument: Record<string, unknown>;
  accessKeyPublicKey: string;
};

export function FakeDapp() {
  const [showIframe, setShowIframe] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== PASSKEYS_ORIGIN) return;
      const data = event.data;
      if (data?.source !== "midnightos-passkeys") return;

      if (data.type === "authenticated") {
        setAuthResult(data.payload);
        setShowIframe(false);
        setError(null);
      } else if (data.type === "error") {
        setError(data.payload?.message ?? "Authentication failed");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = useCallback(() => {
    setShowIframe(true);
    setError(null);
  }, []);

  function handleDisconnect() {
    setAuthResult(null);
    setShowIframe(false);
    setError(null);
  }

  // Connected — show the dApp content
  if (authResult) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-xl font-semibold">Fake dApp</h1>
            <p className="text-sm text-muted-foreground">Connected via passkeys.rvcas.dev</p>
          </div>
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Identity</CardTitle>
            <CardDescription>Cross-domain passkey authentication via iframe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-muted-foreground text-xs">DID</span>
              <p className="font-mono text-xs break-all">{authResult.did}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">
                Access Key (scoped to this dApp)
              </span>
              <p className="font-mono text-xs break-all">{authResult.accessKeyPublicKey}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">DID Document</span>
              <pre className="mt-1 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(authResult.didDocument, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>dApp Actions</CardTitle>
            <CardDescription>
              Pretend blockchain operations using your DID credential
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" disabled>
              Send Transaction
            </Button>
            <Button variant="outline" disabled>
              Sign Message
            </Button>
            <Button variant="outline" disabled>
              Deploy Contract
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not connected — show connect button + iframe
  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">Fake dApp</h1>
        <p className="text-sm text-muted-foreground">
          A third-party application on a different domain that authenticates via passkeys.rvcas.dev
          using a cross-origin iframe
        </p>
      </div>

      {!showIframe && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Sign in with your midnightOS passkey — no extensions, no seed phrases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button onClick={handleConnect}>Connect with Passkey</Button>
          </CardContent>
        </Card>
      )}

      {showIframe && (
        <Card>
          <CardHeader>
            <CardTitle>midnightOS Wallet</CardTitle>
            <CardDescription>Authenticating via passkeys.rvcas.dev</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <p className="text-xs text-destructive mb-3">{error}</p>}
            <iframe
              ref={iframeRef}
              src={EMBED_URL}
              allow="publickey-credentials-create; publickey-credentials-get"
              className="w-full rounded-md border border-border"
              style={{ height: 240 }}
              title="midnightOS Passkey Authentication"
            />
            <Button variant="outline" className="mt-3" onClick={() => setShowIframe(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
