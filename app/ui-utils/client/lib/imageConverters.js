export const toPNGBlob = async img => {
	const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
	const ctx = canvas.getContext('2d');
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0);
	return await canvas.convertToBlob();
};

export const toOriginBlob = async img => {
	const response = await fetch(img.src);
	return await response.blob();
};
