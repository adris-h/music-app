export async function getColorHash(imageSrc: string) {
    if (!import.meta.client) return {};
    // load the image into a bitmap
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    // create a canvas to draw the image on it
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }
    ctx.drawImage(bitmap, 0, 0);

    // extract pixel data
    const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
    const data = imageData.data;

    const hash: Record<string, number> = {};

    for (let i = 0; i < data.length; i += 4) {
        if(data[i+3] === 0) continue;
        // @ts-ignore
        const hex =  ((1 << 24) + (data[i] << 16) + (data[i + 1] << 8) + data[i + 2]).toString(16).slice(1).toUpperCase();
        hash[hex] = (hash[hex] || 0) + 1;
    }

    return hash;

}