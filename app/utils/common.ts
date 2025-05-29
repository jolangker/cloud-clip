export const createPath = (filename: string) => {
  const name = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
  const timestamp = Date.now();
  return `${name}-${timestamp}${ext}`.toLowerCase();
}