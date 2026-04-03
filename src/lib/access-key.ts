export type AccessKey = {
  publicKeyRaw: ArrayBuffer; // 65 bytes uncompressed
  publicKeyCompressed: Uint8Array; // 33 bytes compressed
  publicKeyHex: string;
  privateKey: CryptoKey;
};

export async function generateAccessKey(): Promise<AccessKey> {
  const keyPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);

  const rawPubKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const compressed = compressP256PublicKey(rawPubKey);
  const hex = bufferToHex(rawPubKey);

  return {
    publicKeyRaw: rawPubKey,
    publicKeyCompressed: compressed,
    publicKeyHex: hex,
    privateKey: keyPair.privateKey,
  };
}

export function compressP256PublicKey(rawPublicKey: ArrayBuffer): Uint8Array {
  const uncompressed = new Uint8Array(rawPublicKey);
  // uncompressed format: 0x04 || x (32) || y (32)
  const x = uncompressed.slice(1, 33);
  const y = uncompressed.slice(33, 65);
  const prefix = (y[31]! & 1) === 0 ? 0x02 : 0x03;
  const compressed = new Uint8Array(33);
  compressed[0] = prefix;
  compressed.set(x, 1);
  return compressed;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return "0x" + [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
