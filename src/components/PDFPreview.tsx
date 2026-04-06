import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Standard worker setup for Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    file: File | null;
    pageNumber: number;
}

export default function PDFPreview({ file, pageNumber }: Props) {
    const transformRef = useRef<ReactZoomPanPinchRef>(null);
    const [scalePercent, setScalePercent] = useState(50);

    if (!file) return null;

    return (
        <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl flex flex-col h-[600px] w-full relative">
            
            <TransformWrapper
                ref={transformRef}
                initialScale={0.5}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={false}
                onTransformed={(ref) => setScalePercent(Math.round(ref.state.scale * 100))}
                wheel={{ step: 0.1, smoothStep: 0.005 }} 
                pinch={{ step: 5 }} 
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        {/* TOOLBAR */}
                        <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center z-10 relative">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                                Source Chart: Page {pageNumber}
                            </span>
                            
                            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
                                <button onClick={() => zoomOut()} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white text-lg font-bold transition-colors">-</button>
                                <span className="text-emerald-400 text-xs font-mono w-14 text-center font-bold tracking-wider">
                                    {scalePercent}%
                                </span>
                                <button onClick={() => zoomIn()} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white text-lg font-bold transition-colors">+</button>
                                <button onClick={() => {
                                    resetTransform();
                                    transformRef.current?.centerView();
                                }} className="bg-gray-900 border border-gray-600 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 text-[10px] font-bold ml-2 transition-colors">RESET</button>
                            </div>
                        </div>

                        {/* PDF CONTAINER */}
                        <div className="flex-grow bg-black w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden">
                            <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                <Document file={file}>
                                    <Page 
                                        pageNumber={pageNumber || 1} 
                                        scale={1.5} 
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="shadow-2xl"
                                        onLoadSuccess={() => {
                                            // 1. Wait a tiny fraction of a second for React to paint the canvas
                                            // 2. Force the library to recalculate center and dimensions
                                            setTimeout(() => {
                                                if (transformRef.current) {
                                                    transformRef.current.centerView();
                                                }
                                            }, 50);
                                        }}
                                    />
                                </Document>
                            </TransformComponent>
                        </div>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}