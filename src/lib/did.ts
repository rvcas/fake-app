import bs58 from "bs58";

/**
 * Constructs a did:key identifier from a compressed P-256 public key.
 *
 * Format: did:key:z<base58btc(multicodec_prefix + compressed_pubkey)>
 * Multicodec prefix for p256-pub (0x1200) varint-encoded: [0x80, 0x24]
 */
export function publicKeyToDid(compressedPubKey: Uint8Array): string {
  const multicodecPrefix = new Uint8Array([0x80, 0x24]);
  const payload = new Uint8Array(multicodecPrefix.length + compressedPubKey.length);
  payload.set(multicodecPrefix);
  payload.set(compressedPubKey, multicodecPrefix.length);
  const encoded = bs58.encode(payload);
  return `did:key:z${encoded}`;
}

/**
 * Builds a DID Document for a did:key with a P-256 public key.
 */
export function buildDidDocument(did: string, publicKeyRaw: ArrayBuffer): DidDocument {
  const uncompressed = new Uint8Array(publicKeyRaw);
  const x = uncompressed.slice(1, 33);
  const y = uncompressed.slice(33, 65);

  const fragment = did.replace("did:key:", "");
  const verificationMethodId = `${did}#${fragment}`;

  return {
    "@context": ["https://www.w3.org/ns/did/v1", "https://w3id.org/security/suites/jws-2020/v1"],
    id: did,
    verificationMethod: [
      {
        id: verificationMethodId,
        type: "JsonWebKey2020",
        controller: did,
        publicKeyJwk: {
          kty: "EC",
          crv: "P-256",
          x: uint8ToBase64Url(x),
          y: uint8ToBase64Url(y),
        },
      },
    ],
    authentication: [verificationMethodId],
    assertionMethod: [verificationMethodId],
  };
}

export type DidDocument = {
  "@context": string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
};

type VerificationMethod = {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk: {
    kty: string;
    crv: string;
    x: string;
    y: string;
  };
};

function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
