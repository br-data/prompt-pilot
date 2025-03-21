export function guessMimeType(fileName: string): string {
    const lowerName = fileName.toLowerCase();

    if (lowerName.endsWith('.mp4')) return 'video/mp4';
    if (lowerName.endsWith('.flv')) return 'video/x-flv';
    if (lowerName.endsWith('.mov')) return 'video/quicktime';
    if (lowerName.endsWith('.mpeg')) return 'video/mpeg';
    if (lowerName.endsWith('.mpg')) return 'video/mpg';
    if (lowerName.endsWith('.mpg') || lowerName.endsWith('.mpegps')) return 'video/mpegps';
    if (lowerName.endsWith('.webm')) return 'video/webm';
    if (lowerName.endsWith('.wmv')) return 'video/wmv';
    if (lowerName.endsWith('.3gp') || lowerName.endsWith('.3gpp')) return 'video/3gpp';
    if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg';
    if (lowerName.endsWith('.png')) return 'image/png';

    return 'application/octet-stream';
}