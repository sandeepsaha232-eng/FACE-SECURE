import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { statsService } from '../../services/statsService';

interface CameraStreamProps {
    onStreamReady?: (stream: MediaStream) => void;
    onError?: (error: string) => void;
    onLivenessResult?: (isLive: boolean, score: number, imageData: string) => void;
}

export function CameraStream({ onStreamReady, onError, onLivenessResult }: CameraStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'requesting' | 'active' | 'error'>('requesting');
    const [errorMessage, setErrorMessage] = useState('');
    const [livenessStatus, setLivenessStatus] = useState<'none' | 'real' | 'fake'>('none');
    const [isLowLight, setIsLowLight] = useState(false);

    useEffect(() => {
        async function setupCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 }, // Lower res for faster processing
                        height: { ideal: 480 }
                    },
                    audio: false
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setStatus('active');
                        onStreamReady?.(stream);
                    };
                }
            } catch (err: any) {
                console.error('Camera access error:', err);
                const msg = err.name === 'NotAllowedError'
                    ? 'Camera permission denied. Please enable it to continue.'
                    : 'Could not access camera. Please ensure it is connected.';
                setErrorMessage(msg);
                setStatus('error');
                onError?.(msg);
            }
        }

        setupCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, [onStreamReady, onError]);

    // Real-time liveness check
    useEffect(() => {
        if (status !== 'active') return;

        const captureAndVerify = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Draw current frame to canvas
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.6);

            try {
                const result = await statsService.verifyLiveness(imageData);
                if (result.faceDetected) {
                    const status = result.isLive ? 'real' : 'fake';
                    setLivenessStatus(status);
                    setIsLowLight(result.lowLight || false);
                    onLivenessResult?.(result.isLive, result.score, imageData);
                } else {
                    setLivenessStatus('none');
                    setIsLowLight(false);
                }
            } catch (error) {
                console.error('Liveness check error:', error);
            }
        };

        const interval = setInterval(captureAndVerify, 2000); // Check every 2 seconds
        return () => clearInterval(interval);
    }, [status, onLivenessResult]);

    return (
        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-[#051322] border-4 transition-all duration-300 shadow-[0_0_30px_rgba(31,182,201,0.2)] ${livenessStatus === 'real' ? 'border-emerald-500 shadow-emerald-500/20' :
            livenessStatus === 'fake' ? 'border-red-500 shadow-red-500/20' :
                'border-[#2ECFFF]/30'
            }`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover scale-x-[-1] ${status === 'active' ? 'opacity-100' : 'opacity-0'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {status === 'requesting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0B1C2D]">
                    <Loader2 className="w-12 h-12 text-[#2ECFFF] animate-spin" />
                    <p className="text-[#2ECFFF] animate-pulse">Requesting Camera Permission...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0B1C2D] p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                        <CameraOff className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">Camera Error</h4>
                        <p className="text-[#8FAEC6]">{errorMessage}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#2ECFFF] hover:bg-[#2ECFFF] text-[#0B1C2D] font-bold py-2 px-6 rounded-lg transition-all"
                    >
                        Retry Access
                    </button>
                </div>
            )}

            {/* Low Light Warning */}
            {status === 'active' && isLowLight && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 px-4 py-2 rounded-lg bg-amber-500/90 backdrop-blur-md border border-amber-400/50 flex items-center gap-3 z-20 shadow-lg">
                    <AlertCircle className="w-5 h-5 text-[#0B1C2D] shrink-0" />
                    <p className="text-[#0B1C2D] text-xs font-bold leading-tight">
                        Environment too dark. Please light up your area for accurate verification.
                    </p>
                </div>
            )}

            {/* Scanning Overlay Effect */}
            {status === 'active' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#2ECFFF] opacity-40 blur-sm animate-scan" />
                    <div className="absolute inset-0 border-[20px] border-[#0B1C2D]/20" />
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#2ECFFF] rounded-tl-xl" />
                    <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#2ECFFF] rounded-tr-xl" />
                    <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#2ECFFF] rounded-bl-xl" />
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#2ECFFF] rounded-br-xl" />

                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1C2D]/60 backdrop-blur-md border border-[#2ECFFF]/30">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-[#2ECFFF] font-mono tracking-widest uppercase">Live Link Active</span>
                    </div>
                </div>
            )}
        </div>
    );
}
