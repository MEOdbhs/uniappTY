package uts.sdk.modules.srFileChoose

import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import io.dcloud.uts.UTSAndroid
import io.dcloud.uts.console

object NativeCode {

    private const val REQUEST_CODE_PICK_FILE = 1001

    // 定义一个回调接口，用于返回文件路径
    private var filePickerCallback: ((String?, Number, String) -> Unit)? = null
    private var isRegistered = false

    private fun getMimeType(url: String): String {
        val extension = url.substringAfterLast('.', "")
        return android.webkit.MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase()) ?: "*/*"
    }

    /**
     * 打开文件选择器
     * @param callback 回调函数，用于返回选中的文件路径
     */
    fun openFilePicker(callback: (String?, Number, String) -> Unit) {
		console.log("open filepicker")
        if (!isRegistered) {
            UTSAndroid.onAppActivityResult { requestCode, resultCode, data ->
                if (requestCode == REQUEST_CODE_PICK_FILE) {
                    if (resultCode == android.app.Activity.RESULT_OK) {
                        val uri: Uri? = data?.data
                        if (uri != null) {
                            val context = UTSAndroid.getUniActivity()
                            if (context != null) {
                                var size: Long = 0
                                var name: String = "unknown"
                                context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                                    if (cursor.moveToFirst()) {
                                        val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                                        if (sizeIndex != -1) {
                                            size = cursor.getLong(sizeIndex)
                                        }
                                        val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                                        if (nameIndex != -1) {
                                            name = cursor.getString(nameIndex) ?: "unknown"
                                        }
                                    }
                                }
                                val filePath = getFilePathFromUri(context, uri, name)
                                filePickerCallback?.invoke(filePath, size, name)
                            } else {
                                filePickerCallback?.invoke(null, 0, "")
                            }
                        } else {
                            filePickerCallback?.invoke(null, 0, "")
                        }
                    } else {
                        filePickerCallback?.invoke(null, 0, "")
                    }
                    filePickerCallback = null
                }
            }
            isRegistered = true
        }

        // 保存回调函数
        filePickerCallback = callback

        // 创建文件选择 Intent
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "application/vnd.ms-excel" // .xls
            putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) // .xls, .xlsx
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        // 启动文件选择器
        val activity = UTSAndroid.getUniActivity()
        activity?.startActivityForResult(intent, REQUEST_CODE_PICK_FILE)
    }
}