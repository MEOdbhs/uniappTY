declare namespace Eps {
	interface UserAddressEntity {
		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface UserInfoEntity {
		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	type json = any;

	interface PagePagination {
		size: number;
		page: number;
		total: number;
		[key: string]: any;
	}

	interface PageResponse<T> {
		pagination: PagePagination;
		list: T[];
		[key: string]: any;
	}

	interface UserAddressPageResponse {
		pagination: PagePagination;
		list: UserAddressEntity[];
	}

	interface BaseComm {
		/**
		 * uploadMode
		 */
		uploadMode(data?: any): Promise<any>;

		/**
		 * upload
		 */
		upload(data?: any): Promise<any>;

		/**
		 * param
		 */
		param(data?: any): Promise<any>;

		/**
		 * eps
		 */
		eps(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { uploadMode: string; upload: string; param: string; eps: string };

		/**
		 * 权限状态
		 */
		_permission: { uploadMode: boolean; upload: boolean; param: boolean; eps: boolean };

		request: Request;
	}

	interface DictInfo {
		/**
		 * types
		 */
		types(data?: any): Promise<any>;

		/**
		 * data
		 */
		data(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { types: string; data: string };

		/**
		 * 权限状态
		 */
		_permission: { types: boolean; data: boolean };

		request: Request;
	}

	interface UserAddress {
		/**
		 * default
		 */
		default(data?: any): Promise<any>;

		/**
		 * delete
		 */
		delete(data?: any): Promise<any>;

		/**
		 * update
		 */
		update(data?: any): Promise<any>;

		/**
		 * info
		 */
		info(data?: any): Promise<UserAddressEntity>;

		/**
		 * list
		 */
		list(data?: any): Promise<UserAddressEntity[]>;

		/**
		 * page
		 */
		page(data?: any): Promise<UserAddressPageResponse>;

		/**
		 * add
		 */
		add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			default: string;
			delete: string;
			update: string;
			info: string;
			list: string;
			page: string;
			add: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			default: boolean;
			delete: boolean;
			update: boolean;
			info: boolean;
			list: boolean;
			page: boolean;
			add: boolean;
		};

		request: Request;
	}

	interface UserComm {
		/**
		 * wxMpConfig
		 */
		wxMpConfig(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { wxMpConfig: string };

		/**
		 * 权限状态
		 */
		_permission: { wxMpConfig: boolean };

		request: Request;
	}

	interface UserInfo {
		/**
		 * updatePassword
		 */
		updatePassword(data?: any): Promise<any>;

		/**
		 * updatePerson
		 */
		updatePerson(data?: any): Promise<any>;

		/**
		 * bindPhone
		 */
		bindPhone(data?: any): Promise<any>;

		/**
		 * miniPhone
		 */
		miniPhone(data?: any): Promise<any>;

		/**
		 * person
		 */
		person(data?: any): Promise<any>;

		/**
		 * logoff
		 */
		logoff(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			updatePassword: string;
			updatePerson: string;
			bindPhone: string;
			miniPhone: string;
			person: string;
			logoff: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			updatePassword: boolean;
			updatePerson: boolean;
			bindPhone: boolean;
			miniPhone: boolean;
			person: boolean;
			logoff: boolean;
		};

		request: Request;
	}

	interface UserLogin {
		/**
		 * refreshToken
		 */
		refreshToken(data?: any): Promise<any>;

		/**
		 * miniPhone
		 */
		miniPhone(data?: any): Promise<any>;

		/**
		 * uniPhone
		 */
		uniPhone(data?: any): Promise<any>;

		/**
		 * password
		 */
		password(data?: any): Promise<any>;

		/**
		 * captcha
		 */
		captcha(data?: any): Promise<any>;

		/**
		 * smsCode
		 */
		smsCode(data?: any): Promise<any>;

		/**
		 * wxApp
		 */
		wxApp(data?: any): Promise<any>;

		/**
		 * phone
		 */
		phone(data?: any): Promise<any>;

		/**
		 * mini
		 */
		mini(data?: any): Promise<any>;

		/**
		 * mp
		 */
		mp(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: {
			refreshToken: string;
			miniPhone: string;
			uniPhone: string;
			password: string;
			captcha: string;
			smsCode: string;
			wxApp: string;
			phone: string;
			mini: string;
			mp: string;
		};

		/**
		 * 权限状态
		 */
		_permission: {
			refreshToken: boolean;
			miniPhone: boolean;
			uniPhone: boolean;
			password: boolean;
			captcha: boolean;
			smsCode: boolean;
			wxApp: boolean;
			phone: boolean;
			mini: boolean;
			mp: boolean;
		};

		request: Request;
	}

	interface RequestOptions {
		url: string;
		method?: "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT";
		data?: any;
		params?: any;
		headers?: any;
		timeout?: number;
		[key: string]: any;
	}

	type Request = (options: RequestOptions) => Promise<any>;

	type Service = {
		request: Request;

		base: { comm: BaseComm };
		dict: { info: DictInfo };
		user: { address: UserAddress; comm: UserComm; info: UserInfo; login: UserLogin };
	};
}
