import CryptoJS from "crypto-js";

const SECRET = import.meta.env.VITE_CRYPTO_SECRET;

export const encrypt = (data) => CryptoJS.AES.encrypt(data, SECRET).toString();

export const decrypt = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};
