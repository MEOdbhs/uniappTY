package uts.sdk.modules.srFileChoose

import android.net.Uri
import java.io.File
import android.content.Context
import java.io.FileOutputStream

fun getFilePathFromUri(
    context: Context,
    uri: Uri,
    fileName: String = "temp_${System.currentTimeMillis()}.tmp"
): String? {
    val safeFileName = System.currentTimeMillis().toString() + "_" + fileName.replace(Regex("[^a-zA-Z0-9.\\-_\\u4e00-\\u9fa5]"), "_")
    val targetFile = File(context.cacheDir, safeFileName)
    return try {
        val inputStream = context.contentResolver.openInputStream(uri) ?: return null
        val outputStream = FileOutputStream(targetFile)
        
        val buffer = ByteArray(4 * 1024)
        var read: Int
        while (true) {
            read = inputStream.read(buffer)
            if (read == -1) break
            outputStream.write(buffer, 0, read)
        }
        
        outputStream.flush()
        outputStream.close()
        inputStream.close()
        
        // Android 平台上如果以 file:// 开头，有些网络库(或uni.uploadFile)内部解析时可能出现异常
        // 我们直接返回绝对路径供 uni.uploadFile 使用
        targetFile.absolutePath
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}
