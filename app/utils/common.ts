export const createPath = (filename: string) => {
  const name = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
  const timestamp = Date.now();
  return `${name}-${timestamp}${ext}`.toLowerCase();
}

export const convertImage = (imageFile: File, quality = 0.8) => {
    return new Promise<Blob>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create WebP blob.'));
                    }
                },
                'image/png',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load the image.'));
        };
        img.src = URL.createObjectURL(imageFile);
    });
}