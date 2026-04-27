export type ChooseFileResult = {
    size: number;
    path: string;
    name: string;
}

export type ChooseFileOptions = {
    complete?: (res: ChooseFileResult | any) => void;
    success?: (res: ChooseFileResult) => void;
    fail?: (err: any) => void;
}

export function chooseFileFromModule(options: ChooseFileOptions) {
    // @ts-ignore
    if (typeof uni.chooseMessageFile === "function") {
        // @ts-ignore
        uni.chooseMessageFile({
            count: 1,
            type: "file",
            success: (res: any) => {
                const file = res.tempFiles[0];
                const resData: ChooseFileResult = {
                    size: file.size || 0,
                    path: file.path || file.tempFilePath,
                    name: file.name || "unknown"
                };
                if (options.success) options.success(resData);
                if (options.complete) options.complete(resData);
            },
            fail: (err: any) => {
                if (options.fail) options.fail(err);
                if (options.complete) options.complete(err);
            }
        });
    } else {
        // @ts-ignore
        uni.chooseFile({
            count: 1,
            type: "all",
            success: (res: any) => {
                const file = res.tempFiles[0];
                const resData: ChooseFileResult = {
                    size: file.size || 0,
                    path: file.path || file.tempFilePath,
                    name: file.name || "unknown"
                };
                if (options.success) options.success(resData);
                if (options.complete) options.complete(resData);
            },
            fail: (err: any) => {
                if (options.fail) options.fail(err);
                if (options.complete) options.complete(err);
            }
        });
    }
}
