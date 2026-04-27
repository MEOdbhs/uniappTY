import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("61DC779D88F53947");
const iv = CryptoJS.enc.Utf8.parse("1b76d0c6af4bcb56");

/** 与 NCMP-GS/src/utils/crypto.ts 保持一致 */
export function encrypt(value: string): string {
	return CryptoJS.AES.encrypt(value, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
}

export function decrypt(value: string): string {
	return CryptoJS.AES.decrypt(value, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString(CryptoJS.enc.Utf8);
}
