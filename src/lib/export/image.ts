import { toPng, toJpeg } from 'html-to-image';

export async function exportImage(format: 'png' | 'jpeg') {
  const el = document.querySelector('.react-flow') as HTMLElement;
  if (!el) throw new Error('Graph canvas not found');

  const dataUrl = format === 'png'
    ? await toPng(el, { pixelRatio: 2 })
    : await toJpeg(el, { quality: 0.95, pixelRatio: 2 });

  const link = document.createElement('a');
  link.download = `diagram.${format}`;
  link.href = dataUrl;
  link.click();
}
