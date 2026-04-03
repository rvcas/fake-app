import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccessKey } from "@/lib/access-key";
import { publicKeyToDid, buildDidDocument } from "@/lib/did";

type DidStepProps = {
  accessKey: AccessKey;
};

export function DidStep({ accessKey }: DidStepProps) {
  const did = useMemo(
    () => publicKeyToDid(accessKey.publicKeyCompressed),
    [accessKey.publicKeyCompressed],
  );

  const didDocument = useMemo(
    () => buildDidDocument(did, accessKey.publicKeyRaw),
    [did, accessKey.publicKeyRaw],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. DID Credential</CardTitle>
        <CardDescription>Access key wrapped as a did:key identifier</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-muted-foreground text-xs">DID</span>
          <p className="font-mono text-xs break-all">{did}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">DID Document</span>
          <pre className="mt-1 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(didDocument, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
