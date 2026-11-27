import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

export function imageWidthLoader(config: ImageLoaderConfig) {
  if (!config.width) {
    return config.src;
  }

  const separator = config.src.includes('?') ? '&' : '?';
  return `${config.src}${separator}w=${config.width}`;
}

export function provideImageLoader() {
  return [{ provide: IMAGE_LOADER, useValue: imageWidthLoader }];
}
