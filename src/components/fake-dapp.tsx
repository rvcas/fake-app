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

type SignResult = {
  message: string;
  signature: string;
  publicKey: string;
};

export function FakeDapp() {
  const [iframeMounted, setIframeMounted] = useState(false);
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState("Hello from fake-app!");
  const [signResult, setSignResult] = useState<SignResult | null>(null);
  const [signing, setSigning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const signResolveRef = useRef<((result: SignResult) => void) | null>(null);
  const signRejectRef = useRef<((error: Error) => void) | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== PASSKEYS_ORIGIN) return;
      const data = event.data;
      if (data?.source !== "midnightos-passkeys") return;

      if (data.type === "authenticated") {
        setAuthResult(data.payload);
        setError(null);
      } else if (data.type === "error") {
        setError(data.payload?.message ?? "Authentication failed");
      } else if (data.type === "signed") {
        signResolveRef.current?.(data.payload);
        signResolveRef.current = null;
        signRejectRef.current = null;
      } else if (data.type === "sign-error") {
        signRejectRef.current?.(new Error(data.payload?.message ?? "Signing failed"));
        signResolveRef.current = null;
        signRejectRef.current = null;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = useCallback(() => {
    setIframeMounted(true);
    setError(null);
  }, []);

  function handleDisconnect() {
    setAuthResult(null);
    setIframeMounted(false);
    setSignResult(null);
    setError(null);
  }

  const handleSign = useCallback(async () => {
    if (!iframeRef.current?.contentWindow) return;
    setSigning(true);
    setSignResult(null);

    try {
      const result = await new Promise<SignResult>((resolve, reject) => {
        signResolveRef.current = resolve;
        signRejectRef.current = reject;

        iframeRef.current!.contentWindow!.postMessage(
          {
            source: "midnightos-dapp",
            type: "sign",
            payload: {
              message: messageToSign,
              requestId: crypto.randomUUID(),
            },
          },
          PASSKEYS_ORIGIN,
        );

        // Timeout after 30 seconds
        setTimeout(() => {
          if (signResolveRef.current) {
            reject(new Error("Sign request timed out"));
            signResolveRef.current = null;
            signRejectRef.current = null;
          }
        }, 30_000);
      });

      setSignResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed");
    } finally {
      setSigning(false);
    }
  }, [messageToSign]);

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign Message</CardTitle>
            <CardDescription>
              Sign a message with your access key via the embedded iframe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="message" className="text-xs text-muted-foreground">
                Message
              </label>
              <input
                id="message"
                type="text"
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-sm"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button onClick={handleSign} disabled={signing || !messageToSign}>
              {signing ? "Signing..." : "Sign Message"}
            </Button>

            {signResult && (
              <div className="space-y-2 pt-2">
                <div>
                  <span className="text-muted-foreground text-xs">Message</span>
                  <p className="font-mono text-xs break-all">{signResult.message}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Signature (ECDSA P-256)</span>
                  <p className="font-mono text-xs break-all">{signResult.signature}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Signed by</span>
                  <p className="font-mono text-xs break-all">{signResult.publicKey}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden iframe — keeps access key alive for signing */}
        <iframe
          ref={iframeRef}
          src={EMBED_URL}
          allow="publickey-credentials-create; publickey-credentials-get"
          className="hidden"
          title="midnightOS Passkey Authentication"
        />
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

      {!iframeMounted && (
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

      {iframeMounted && !authResult && (
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
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setIframeMounted(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
