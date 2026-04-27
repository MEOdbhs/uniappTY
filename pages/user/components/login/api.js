import { encrypt } from "/@/utils/crypto";
import { service } from "/@/cool";

/** 与 NCMP-GS 一致：OAuth2 password + 字段 AES（crypto 与 Web 相同） */
export function login(username, password) {
	const body =
		`username=${encodeURIComponent(encrypt(username))}` +
		`&password=${encodeURIComponent(encrypt(password))}` +
		`&grant_type=password` +
		`&client_id=${encodeURIComponent(encrypt("ncm-company-client"))}` +
		`&client_secret=${encodeURIComponent(encrypt("cdtye2019"))}`;
	return service.request({
		url: "auth/oauth/token",
		method: "POST",
		data: body,
		header: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		needProject: false,
	});
}

export function getCodeImg() {
	return service.request({
		url: "/captchaImage",
		method: "GET",
		timeout: 20000,
	});
}

export function getAppVersionList() {
	return service.request({
		url: "/AppVersionManage/listNoPage",
		method: "GET",
	});
}

export function register(data) {
	return service.request({
		url: "/register",
		method: "POST",
		data: data,
	});
}

export function sendSms(phone) {
	return service.request({
		url: "/sendSms",
		method: "GET",
		params: { phone },
	});
}

/** Web 侧无若依 getInfo：拉取企业与用户信息见 cool/store/user.ts */
export function getInfo() {
	return service.request({
		url: "/companyApp/home/getMineListByDeptId",
		method: "GET",
	});
}

export function updateUserPwd(oldPassword, newPassword) {
	const data = {
		oldPassword,
		newPassword,
	};
	return service.request({
		url: "/system/user/profile/updatePwd",
		method: "PUT",
		params: data,
	});
}

export function logout() {
	return service.request({
		url: "/logout",
		method: "POST",
	});
}
