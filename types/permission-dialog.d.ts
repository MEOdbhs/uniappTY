declare namespace PermissionDialog {
	interface Options {
		title?: string;
		message?: string;
		buttonText?: string;
		callback?(): void;
	}
}
