import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    secretKey: naclUtil.encodeBase64(keyPair.secretKey)
  };
}

export function encryptMessage(message, receiverPublicKeyBase64, senderSecretKeyBase64) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = naclUtil.decodeUTF8(message);
  
  const receiverPublicKey = naclUtil.decodeBase64(receiverPublicKeyBase64);
  const senderSecretKey = naclUtil.decodeBase64(senderSecretKeyBase64);

  const encryptedMessage = nacl.box(messageUint8, nonce, receiverPublicKey, senderSecretKey);
  
  return {
    nonce: naclUtil.encodeBase64(nonce),
    ciphertext: naclUtil.encodeBase64(encryptedMessage)
  };
}

export function decryptMessage(ciphertextBase64, nonceBase64, senderPublicKeyBase64, receiverSecretKeyBase64) {
  const ciphertext = naclUtil.decodeBase64(ciphertextBase64);
  const nonce = naclUtil.decodeBase64(nonceBase64);
  
  const senderPublicKey = naclUtil.decodeBase64(senderPublicKeyBase64);
  const receiverSecretKey = naclUtil.decodeBase64(receiverSecretKeyBase64);

  const decryptedMessage = nacl.box.open(ciphertext, nonce, senderPublicKey, receiverSecretKey);

  if (!decryptedMessage) {
    throw new Error('Could not decrypt message using the provided secret key.');
  }

  return naclUtil.encodeUTF8(decryptedMessage);
}
