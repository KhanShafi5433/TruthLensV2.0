export interface OCRPreprocessingResult {
  processedImage: string; // base64
  preprocessingSteps: string[];
  qualityScore: number;
}

export class ImagePreprocessor {
  private static instance: ImagePreprocessor;

  static getInstance(): ImagePreprocessor {
    if (!ImagePreprocessor.instance) {
      ImagePreprocessor.instance = new ImagePreprocessor();
    }
    return ImagePreprocessor.instance;
  }

  async preprocess(imageBase64: string, mimeType: string): Promise<OCRPreprocessingResult> {
    const steps: string[] = [];
    let qualityScore = 50;

    // Create canvas for image processing
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return {
        processedImage: imageBase64,
        preprocessingSteps: [],
        qualityScore: 50,
      };
    }

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;

        // Step 1: Convert to grayscale
        steps.push("Grayscale conversion");
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // R
          data[i + 1] = avg; // G
          data[i + 2] = avg; // B
        }
        qualityScore += 10;

        // Step 2: Increase contrast
        steps.push("Contrast enhancement");
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = factor * (data[i] - 128) + 128;
          data[i + 1] = factor * (data[i + 1] - 128) + 128;
          data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
        qualityScore += 10;

        // Step 3: Apply thresholding for dark mode handling
        steps.push("Adaptive thresholding");
        const isDarkMode = this.detectDarkMode(data);
        if (isDarkMode) {
          // Invert for dark mode
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          steps.push("Dark mode inversion");
          qualityScore += 15;
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Convert back to base64
        const processedBase64 = canvas.toDataURL(mimeType, 0.9);

        resolve({
          processedImage: processedBase64,
          preprocessingSteps: steps,
          qualityScore: Math.min(100, qualityScore),
        });
      };

      img.src = `data:${mimeType};base64,${imageBase64}`;
    });
  }

  private detectDarkMode(data: Uint8ClampedArray): boolean {
    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    const avgBrightness = totalBrightness / pixelCount;
    return avgBrightness < 100; // Threshold for dark mode
  }

  async enhanceForBlur(imageBase64: string, mimeType: string): Promise<string> {
    // Apply sharpening filter for blurry images
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return imageBase64;

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Apply sharpening
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Simple sharpening kernel
        const kernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];

        const copy = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                  sum += copy[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
                }
              }
              const idx = (y * width + x) * 4 + c;
              data[idx] = Math.min(255, Math.max(0, sum));
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL(mimeType, 0.9));
      };

      img.src = `data:${mimeType};base64,${imageBase64}`;
    });
  }
}
