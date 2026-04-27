package uts.sdk.modules.srFileChoose

import android.net.Uri
import java.io.File
import android.content.Context

fun getFilePathFromUri(
    context: Context,
    uri: Uri,
    fileName: String = "temp_${System.currentTimeMillis()}.tmp"
): String? {
    val safeFileName = System.currentTimeMillis().toString() + "_" + fileName.replace(Regex("[^a-zA-Z0-9.\\-_\\u4e00-\\u9fa5]"), "_")
    val targetFile = File(context.cacheDir, safeFileName)
    return try {
        context.contentResolver.openInputStream(uri)?.use { input ->
            targetFile.outputStream().use { output ->
                input.copyTo(output)
            }
        } ?: return null
        "file://" + targetFile.absolutePath
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}
