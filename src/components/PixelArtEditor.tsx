import React, { useState, useRef, useCallback, useEffect } from 'react';

import { Upload, Download, RotateCcw, Sliders } from 'lucide-react';

import { motion } from 'framer-motion';

type PixelArtEditorProps = Record<string, never>;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const applyPixelation = (sourceCanvas: HTMLCanvasElement, pixelSize: number): HTMLCanvasElement => {

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d', {

    willReadFrequently: true

  });

  if (!ctx) return canvas;

  canvas.width = sourceCanvas.width;

  canvas.height = sourceCanvas.height;

  const scaledWidth = Math.floor(sourceCanvas.width / pixelSize);

  const scaledHeight = Math.floor(sourceCanvas.height / pixelSize);

  const tempCanvas = document.createElement('canvas');

  const tempCtx = tempCanvas.getContext('2d', {

    willReadFrequently: true

  });

  if (!tempCtx) return canvas;

  tempCanvas.width = scaledWidth;

  tempCanvas.height = scaledHeight;

  tempCtx.drawImage(sourceCanvas, 0, 0, scaledWidth, scaledHeight);

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, canvas.width, canvas.height);

  return canvas;

};

const applyNoise = (sourceCanvas: HTMLCanvasElement, noiseLevel: number): HTMLCanvasElement => {

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d', {

    willReadFrequently: true

  });

  if (!ctx) return canvas;

  canvas.width = sourceCanvas.width;

  canvas.height = sourceCanvas.height;

  ctx.drawImage(sourceCanvas, 0, 0);

  if (noiseLevel > 0) {

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

      if (Math.random() < noiseLevel / 100) {

        const noise = (Math.random() - 0.5) * 255 * (noiseLevel / 50);

        data[i] = clamp(data[i] + noise, 0, 255);

        data[i + 1] = clamp(data[i + 1] + noise, 0, 255);

        data[i + 2] = clamp(data[i + 2] + noise, 0, 255);

      }

    }

    ctx.putImageData(imageData, 0, 0);

  }

  return canvas;

};

const canvasToSVG = (canvas: HTMLCanvasElement): string => {

  const dataUrl = canvas.toDataURL('image/png');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  <image width="${canvas.width}" height="${canvas.height}" href="${dataUrl}" image-rendering="pixelated"/>
</svg>`;

  return svg;

};



// @component: PixelArtEditor

export const PixelArtEditor = (_props: PixelArtEditorProps) => {

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const [pixelSize, setPixelSize] = useState(8);

  const [noiseLevel, setNoiseLevel] = useState(0);

  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(() => {

    if (!originalImage) return;

    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d', {

      willReadFrequently: true

    });

    if (!ctx) return;

    canvas.width = originalImage.width;

    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    let processed = applyPixelation(canvas, pixelSize);

    processed = applyNoise(processed, noiseLevel);

    setProcessedCanvas(processed);

  }, [originalImage, pixelSize, noiseLevel]);

  useEffect(() => {

    processImage();

  }, [processImage]);

  useEffect(() => {

    if (processedCanvas && canvasRef.current) {

      const ctx = canvasRef.current.getContext('2d');

      if (ctx) {

        canvasRef.current.width = processedCanvas.width;

        canvasRef.current.height = processedCanvas.height;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        ctx.drawImage(processedCanvas, 0, 0);

      }

    }

  }, [processedCanvas]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {

      const img = new Image();

      img.onload = () => {

        setOriginalImage(img);

      };

      img.src = e.target?.result as string;

    };

    reader.readAsDataURL(file);

  };

  const handleExportSVG = () => {

    if (!processedCanvas) return;

    const svgContent = canvasToSVG(processedCanvas);

    const blob = new Blob([svgContent], {

      type: 'image/svg+xml;charset=utf-8'

    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = 'pixel-art.svg';

    a.style.display = 'none';

    document.body.appendChild(a);

    a.click();

    setTimeout(() => {

      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    }, 100);

  };

  const handleExportPNG = () => {

    if (!processedCanvas) return;

    processedCanvas.toBlob(blob => {

      if (!blob) return;

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'pixel-art.png';

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    }, 'image/png');

  };

  const handleReset = () => {

    setPixelSize(8);

    setNoiseLevel(0);

  };



  // @return

  return <div className="w-full h-screen bg-neutral-50 flex flex-col">

      <div className="flex-none border-b border-neutral-200 bg-white/80 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-8 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="w-9 h-9 bg-neutral-900 rounded-lg flex items-center justify-center">

                <Sliders className="w-4 h-4 text-white" />

              </div>

              <div>

                <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">Pixel Art Editor</h1>

                <p className="text-xs text-neutral-500 mt-0.5">Transform images into pixel art</p>

              </div>

            </div>

            <div className="flex items-center gap-2.5">

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              <motion.button whileHover={{

              scale: 1.02

            }} whileTap={{

              scale: 0.98

            }} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">

                <Upload className="w-4 h-4" />

                Upload

              </motion.button>

              <motion.button whileHover={{

              scale: 1.02

            }} whileTap={{

              scale: 0.98

            }} onClick={handleReset} disabled={!originalImage} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">

                <RotateCcw className="w-4 h-4" />

                Reset

              </motion.button>

              <motion.button whileHover={{

              scale: 1.02

            }} whileTap={{

              scale: 0.98

            }} onClick={handleExportSVG} disabled={!processedCanvas} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">

                <Download className="w-4 h-4" />

                SVG

              </motion.button>

              <motion.button whileHover={{

              scale: 1.02

            }} whileTap={{

              scale: 0.98

            }} onClick={handleExportPNG} disabled={!processedCanvas} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">

                <Download className="w-4 h-4" />

                PNG

              </motion.button>

            </div>

          </div>

        </div>

      </div>



      <div className="flex-1 overflow-hidden flex">

        <div className="flex-none w-72 border-r border-neutral-200 bg-white overflow-y-auto">

          <div className="p-8 space-y-8">

            <div className="space-y-6">

              <div>

                <div className="flex items-center justify-between mb-4">

                  <label className="text-sm font-medium text-neutral-900">Pixelation</label>

                  <span className="text-xs font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{pixelSize}px</span>

                </div>

                <input type="range" min="1" max="50" value={pixelSize} onChange={e => setPixelSize(Number(e.target.value))} disabled={!originalImage} className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer" />

                <div className="flex justify-between mt-2.5 text-xs text-neutral-500">

                  <span>Fine</span>

                  <span>Chunky</span>

                </div>

              </div>



              <div>

                <div className="flex items-center justify-between mb-4">

                  <label className="text-sm font-medium text-neutral-900">Noise</label>

                  <span className="text-xs font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{noiseLevel}%</span>

                </div>

                <input type="range" min="0" max="100" value={noiseLevel} onChange={e => setNoiseLevel(Number(e.target.value))} disabled={!originalImage} className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-neutral-900 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer" />

                <div className="flex justify-between mt-2.5 text-xs text-neutral-500">

                  <span>Clean</span>

                  <span>Grainy</span>

                </div>

              </div>

            </div>



            <div className="pt-6 border-t border-neutral-200">

              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Tips</h3>

              <ul className="space-y-3 text-xs text-neutral-600 leading-relaxed">

                <li className="flex items-start gap-2.5">

                  <span className="text-neutral-400 mt-1">•</span>

                  <span>Lower pixel size creates finer detail</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-neutral-400 mt-1">•</span>

                  <span>Higher pixel size gives a retro look</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-neutral-400 mt-1">•</span>

                  <span>Add noise for a vintage effect</span>

                </li>

                <li className="flex items-start gap-2.5">

                  <span className="text-neutral-400 mt-1">•</span>

                  <span>Export to SVG for scalable graphics</span>

                </li>

              </ul>

            </div>

          </div>

        </div>



        <div className="flex-1 overflow-auto bg-neutral-100/50">

          <div className="min-h-full flex items-center justify-center p-12">

            {!originalImage ? <motion.div initial={{

            opacity: 0,

            y: 10

          }} animate={{

            opacity: 1,

            y: 0

          }} className="text-center max-w-sm">

                <div className="w-20 h-20 mx-auto mb-5 bg-neutral-200 rounded-2xl flex items-center justify-center">

                  <Upload className="w-8 h-8 text-neutral-400" />

                </div>

                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Upload an Image</h2>

                <p className="text-sm text-neutral-500 mb-6 leading-relaxed">

                  Get started by uploading an image to transform it into pixel art

                </p>

                <motion.button whileHover={{

              scale: 1.02

            }} whileTap={{

              scale: 0.98

            }} onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm">

                  Choose Image

                </motion.button>

              </motion.div> : <motion.div initial={{

            opacity: 0,

            scale: 0.98

          }} animate={{

            opacity: 1,

            scale: 1

          }} className="relative">

                <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">

                  <canvas ref={canvasRef} className="max-w-full max-h-[calc(100vh-14rem)] w-auto h-auto rounded-lg" style={{

                imageRendering: 'pixelated'

              }} />

                </div>

                {processedCanvas && <div className="mt-5 text-center text-xs text-neutral-500 font-mono">

                    {processedCanvas.width} × {processedCanvas.height} pixels

                  </div>}

              </motion.div>}

          </div>

        </div>

      </div>

    </div>;

};

