import pixelmatch from "pixelmatch";
import { ScoreResult, calculateScorePoints } from "./css_data";

/**
 * Runs off-screen visual rasterization and pixelmatch diffing between
 * candidate code and target code (or target image) at 400x300 viewport.
 */
export function evaluateCssCode(
  userCode: string,
  targetHtmlOrImage: string,
  width = 400,
  height = 300,
  isTargetImage = false
): Promise<ScoreResult> {
  return new Promise((resolve) => {
    const offscreenUser = document.createElement("canvas");
    offscreenUser.width = width;
    offscreenUser.height = height;
    const ctxUser = offscreenUser.getContext("2d", { willReadFrequently: true });

    const offscreenTarget = document.createElement("canvas");
    offscreenTarget.width = width;
    offscreenTarget.height = height;
    const ctxTarget = offscreenTarget.getContext("2d", { willReadFrequently: true });

    const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">${userCode}</div></foreignObject></svg>`;
    const userBlob = new Blob([userSvg], { type: "image/svg+xml;charset=utf-8" });
    const userUrl = URL.createObjectURL(userBlob);

    let targetUrl: string;
    let shouldRevokeTarget = false;

    if (isTargetImage) {
      targetUrl = targetHtmlOrImage;
    } else {
      const targetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="margin:0;padding:0;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">${targetHtmlOrImage}</div></foreignObject></svg>`;
      const targetBlob = new Blob([targetSvg], { type: "image/svg+xml;charset=utf-8" });
      targetUrl = URL.createObjectURL(targetBlob);
      shouldRevokeTarget = true;
    }

    const userImg = new Image();
    const targetImg = new Image();

    let loaded = 0;
    const cleanup = () => {
      URL.revokeObjectURL(userUrl);
      if (shouldRevokeTarget) {
        URL.revokeObjectURL(targetUrl);
      }
    };

    const onBothLoaded = () => {
      try {
        if (!ctxUser || !ctxTarget) {
          resolve({ score: 0, matchPct: 0, chars: userCode.length });
          return;
        }

        ctxUser.drawImage(userImg, 0, 0, width, height);
        ctxTarget.drawImage(targetImg, 0, 0, width, height);

        const imgDataUser = ctxUser.getImageData(0, 0, width, height);
        const imgDataTarget = ctxTarget.getImageData(0, 0, width, height);

        const diffCanvas = document.createElement("canvas");
        diffCanvas.width = width;
        diffCanvas.height = height;
        const ctxDiff = diffCanvas.getContext("2d");
        const diffImgData = ctxDiff?.createImageData(width, height);

        let mismatched = 0;
        if (diffImgData) {
          mismatched = pixelmatch(
            imgDataUser.data,
            imgDataTarget.data,
            diffImgData.data,
            width,
            height,
            {
              threshold: 0.08,
              diffColor: [241, 86, 65],
              aaColor: [247, 183, 7],
              diffColorAlt: [58, 169, 196],
              alpha: 0.3,
            }
          );
        }

        const totalPixels = width * height;
        const accuracy = Math.max(
          0,
          Math.min(100, ((totalPixels - mismatched) / totalPixels) * 100)
        );
        const formattedPct = parseFloat(accuracy.toFixed(1));
        const chars = userCode.length;
        const totalScore = calculateScorePoints(formattedPct, chars);

        resolve({
          score: totalScore,
          matchPct: formattedPct,
          chars,
        });
      } finally {
        cleanup();
      }
    };

    userImg.onload = () => {
      loaded++;
      if (loaded === 2) onBothLoaded();
    };
    userImg.onerror = () => {
      resolve({ score: 0, matchPct: 0, chars: userCode.length });
      cleanup();
    };

    targetImg.onload = () => {
      loaded++;
      if (loaded === 2) onBothLoaded();
    };
    targetImg.onerror = () => {
      resolve({ score: 0, matchPct: 0, chars: userCode.length });
      cleanup();
    };

    userImg.src = userUrl;
    targetImg.src = targetUrl;
  });
}
