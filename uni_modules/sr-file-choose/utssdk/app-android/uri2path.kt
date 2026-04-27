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
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(targetFile).use { output ->
                val buffer = ByteArray(4 * 1024) // 4KB buffer
                var read: Int
                while (true) {
                    read = input.read(buffer)
                    if (read == -1) break
                    output.write(buffer, 0, read)
                }
                output.flush()
            }
        } ?: return null
        "file://" + targetFile.absolutePath
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}
