问题原因
在 Android 10 及以上版本中，受系统“分区存储”安全机制的影响，应用获取本地文件返回的是 content:// 格式的 URI（Content Provider 路径），而不是传统的绝对路径（file://）。 当直接把 content:// 路径传给 uni.uploadFile 时，底层往往无法正确解析读取文件流，导致上传失败或者上传了错误的内容。

解决方案
核心解决思路是：通过原生代码将 content:// 指向的文件流，复制一份到 APP 的本地缓存目录中，从而生成一个标准的 file:// 路径供上传使用。

针对你使用的这款 sr-file-choose 插件，可以直接通过修改插件内部的 UTS 代码来完美解决。具体操作步骤如下：

第一步：新建路径转换文件
在插件的 Android 专属目录下（一般位于 uni_modules/sr-file-choose/utssdk/app-android/，即 index.uts 文件的同级目录），新建一个名为 uri2path.kt 的文件，填入以下 Kotlin 代码：

Kotlin

package uts.sdk.modules.srFileChoose

import android.net.Uri
import java.io.File
import android.content.Context

fun getFilePathFromUri(
context: Context,
uri: Uri,
fileName: String = "temp\_${System.currentTimeMillis()}.tmp" // 加时间戳避免文件覆盖
): String? {
val targetFile = File(context.cacheDir, fileName)

    // 尝试打开输入流并复制到本地缓存目录
    return try {
        context.contentResolver.openInputStream(uri)?.use { input ->
            targetFile.outputStream().use { output ->
                input.copyTo(output)
            }
        } ?: return null

        // 复制成功，返回包含 file:// 的绝对路径
        "file://" + targetFile.absolutePath
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }

}
第二步：修改 index.uts 返回逻辑
在同目录找到 index.uts 文件，找到文件选择成功后组装返回数据的地方（里面会有类似 path: uri 或 path: uri.toString() 的代码）。将其修改为调用刚才写的转换方法：

TypeScript

// 1. 调用 kotlin 中定义的方法，将系统返回的 uri 转换成真实文件路径
const tempFile: string | null = getFilePathFromUri(activity, uri, fileName)

// 2. 将返回的 path 替换成转换后的 tempFile
const res : ChooseFileResult = {  
 size: fileSize,  
 path: tempFile!, // 使用转换后的 file:// 路径
name: fileName
};

// 保持原有的回调返回不变
// ...
第三步：重新打包生效
由于我们修改并新增了原生层的代码（UTS / Kotlin），这些改动在普通的运行模式下不会生效。你必须重新制作“自定义调试基座”或者直接云打包 App，然后在新的基座/App中运行，这个问题就能彻底解决，拿到带有 file:// 前缀的正常路径了。
