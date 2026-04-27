<template>
	<view>

		<!-- 只用于绘制水印图片，不做展示 -->
		<canvas canvas-id="myCanvas" style="position: fixed;left: 2000rpx;opacity: 0;"></canvas>

	</view>
</template>

<script>
	export default {
		name: 'waterMark',
		props: {
			rotate: { //旋转角度
				type: Number,
				default: -15
			},
			opacity: { //画布透明度
				type: Number,
				default: 0.2
			},
			row: { //水印行数
				type: Number,
				default: 7
			},
			col: { //水印列数
				type: Number,
				default: 2
			},
			width: { //生成水印图片宽
				type: Number,
				default: 100
			},
			height: { //生成水印图片高
				type: Number,
				default: 100
			},
		},
		data() {
			return {
				statusBar: 10,
				screenHeight: 800
			}
		},
		methods: {

			createWaterMark(data) {
				if(uni.getStorageSync('appWaterMark')) return;

				const ctx = uni.createCanvasContext('myCanvas')

				ctx.rotate(this.rotate * Math.PI / 180)
				ctx.setGlobalAlpha(this.opacity)

				data.forEach((item, index) => {
					if (item.type == 'text') {
						ctx.setFontSize(item.size)
						ctx.setTextAlign('left')
						ctx.fillText(item.content, item.x || 0, item.y || 0)
					} else {
						ctx.drawImage(item.content, item.x || 0, item.y || 0, item.width, item.height)
					}
				})

				ctx.draw()
				var self = this;
				uni.getSystemInfo({
					success: function (res) {
						self.statusBar = res.statusBarHeight;
						self.screenHeight = res.screenHeight;
						// console.log('res', res)
						setTimeout(function() {
							self.canvasToTempFilePath();
						}, 1000)
					}
				});
			},

			canvasToTempFilePath() {
				var self = this;
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: self.width,
					height: self.height,
					destWidth: self.width,
					destHeight: self.height,
					canvasId: 'myCanvas',
					success: function(res) {
						// 在H5平台下，tempFilePath 为 base64
						// console.log('canvas图片', res.tempFilePath)
						// #ifdef APP-PLUS
						self.appWaterMark(res.tempFilePath);
						// #endif
						// #ifdef H5
						self.h5WaterMark(res.tempFilePath);
						// #endif
					}
				})
			},

			appWaterMark(tempFilePath) {
				var self = this;
				if (!tempFilePath) return;
				let bitmap = new plus.nativeObj.Bitmap('bmp1');
				bitmap.load(tempFilePath, function() {
					var plusView = null;
					if(plus.nativeObj.View.getViewById('appWaterMark')){
						plusView = plus.nativeObj.View.getViewById('appWaterMark');
					}else{
						plusView = new plus.nativeObj.View('appWaterMark', {
							top: self.statusBar + 'px',
							left: '0px',
							height: '100%',
							width: '100%'
						});
					}
					plusView.reset();
					
					// 绘制图片
					for (var i = 0; i < self.row; i++) {
						for (var j = 0; j < self.col; j++) {
							plusView.drawBitmap(bitmap, {
								top: '0px',
								left:'0px',
								width: '100%',
								height: '100%'
							}, {
								top: i * (self.screenHeight/self.row) + self.statusBar + "px",
								left: j * self.width + (i % 2) * (self.width / 2) + "px",
								width: self.width+'px',
								height: self.height+'px'
							});
						}
					}
					plusView.interceptTouchEvent(false); //是否拦截View控件的触屏事件
					plusView.show();
					uni.setStorageSync('appWaterMark', true);
				}, function(e) {
					console.log('bmp1.png load failed! ' + JSON.stringify(e));
				});
			},

			h5WaterMark(tempFilePath) {
				var newDiv = null;
				if(document.getElementById("WaterMark")){
					newDiv = document.getElementById("WaterMark");
				}else{
					// 创建一个新的div元素
					newDiv = document.createElement("div");
					newDiv.id = 'WaterMark';
					// 设置一些样式
					newDiv.style.position = "fixed";
					newDiv.style.top = "0";
					newDiv.style.left = "0";
					newDiv.style.height = "100%";
					newDiv.style.width = "100%";
					newDiv.style.zIndex = 100000;
					newDiv.style.pointerEvents = 'none';
					
					// 将新创建的div添加到body中
					document.body.appendChild(newDiv);
				}
				var imgChild = document.getElementsByClassName("WaterMarkImg");
				while(imgChild.length > 0){
				    imgChild[0].parentNode.removeChild(imgChild[0]); // 移除元素
				}

				for (var i = 0; i < this.row; i++) {
					for (var j = 0; j < this.col; j++) {
						var newChild = document.createElement("img");
						newChild.className = 'WaterMarkImg'
						newChild.src = tempFilePath;
						newChild.style.position = "absolute";
						newChild.style.top = i * (this.screenHeight/this.row) + this.statusBar + "px";
						newChild.style.left = j * this.width + (i%2) * (this.width / 2) + "px";
						newDiv.appendChild(newChild);
					}
				}
				uni.setStorageSync('appWaterMark', true);
			},

		}
	}
</script>

<style lang="scss" scoped>

</style>