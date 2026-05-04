import { X } from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

/**
 * Animated SVG human silhouette that demonstrates the correct standing position
 * within the camera bounding box.
 */
function HumanSilhouetteGuide({ onFinished }: { onFinished: () => void }) {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        // Fade in
        const fadeInTimer = setTimeout(() => setOpacity(1), 100);
        // Start fade out after 2.5s
        const fadeOutTimer = setTimeout(() => setOpacity(0), 2500);
        // Notify parent after 3s
        const doneTimer = setTimeout(() => onFinished(), 3200);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(doneTimer);
        };
    }, [onFinished]);

    return (
        <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center"
            style={{
                opacity,
                transition: 'opacity 0.6s ease-in-out',
            }}
        >
            {/* Semi-transparent backdrop */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Animated human figure SVG */}
                <div className="animate-pulse">
                    <svg
                        width="120"
                        height="260"
                        viewBox="0 0 120 260"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="drop-shadow-lg"
                    >
                        {/* Head */}
                        <circle cx="60" cy="25" r="18" stroke="#22c55e" strokeWidth="2.5" fill="#22c55e20" />
                        {/* Neck */}
                        <line x1="60" y1="43" x2="60" y2="55" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Body / Torso */}
                        <line x1="60" y1="55" x2="60" y2="140" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Shoulders */}
                        <line x1="30" y1="65" x2="90" y2="65" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Left arm */}
                        <line x1="30" y1="65" x2="22" y2="120" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Right arm */}
                        <line x1="90" y1="65" x2="98" y2="120" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Hips */}
                        <line x1="42" y1="140" x2="78" y2="140" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Left leg */}
                        <line x1="42" y1="140" x2="38" y2="215" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Right leg */}
                        <line x1="78" y1="140" x2="82" y2="215" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Left foot */}
                        <line x1="38" y1="215" x2="28" y2="220" stroke="#22c55e" strokeWidth="2.5" />
                        {/* Right foot */}
                        <line x1="82" y1="215" x2="92" y2="220" stroke="#22c55e" strokeWidth="2.5" />

                        {/* Bounding box around figure */}
                        <rect
                            x="10"
                            y="2"
                            width="100"
                            height="225"
                            rx="6"
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                            fill="none"
                            opacity="0.5"
                        />

                        {/* Head boundary line */}
                        <line x1="10" y1="6" x2="110" y2="6" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />

                        {/* Feet boundary line */}
                        <line x1="10" y1="225" x2="110" y2="225" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
                    </svg>
                </div>

                {/* Instruction text */}
                <div className="max-w-[240px] space-y-1.5 text-center">
                    <p className="text-sm font-bold text-green-400">
                        Posisikan tubuh seperti ini
                    </p>
                    <p className="text-xs text-green-300/80">
                        Pastikan seluruh tubuh dari kepala hingga kaki masuk dalam area garis putus-putus
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VideoRecorder({ onRecordingComplete, onClose }: { onRecordingComplete: (blob: Blob) => void; onClose: () => void }) {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    type Status = 'guide' | 'idle' | 'preparing' | 'recording';
    const [status, setStatus] = useState<Status>('guide');
    const [timeLeft, setTimeLeft] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    const handleGuideFinished = useCallback(() => {
        setStatus('idle');
    }, []);

    const handleDataAvailable = useCallback(
        ({ data }: BlobEvent) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => prev.concat(data));
            }
        },
        []
    );

    const handleStopCaptureClick = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        setStatus('idle');
    }, []);

    useEffect(() => {
        if (status === 'preparing') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);

                return () => clearTimeout(timer);
            } else {
                // Prep finished, start recording
                const timer = setTimeout(() => {
                    setStatus('recording');
                    setTimeLeft(10);
                    setRecordedChunks([]);

                    if (webcamRef.current?.stream) {
                        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                            mimeType: 'video/webm'
                        });
                        mediaRecorderRef.current.addEventListener(
                            "dataavailable",
                            handleDataAvailable
                        );
                        mediaRecorderRef.current.start();
                    }
                }, 0);

                return () => clearTimeout(timer);
            }
        } else if (status === 'recording') {
            if (timeLeft > 0) {
                const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);

                return () => clearTimeout(timer);
            } else {
                // Recording finished
                const timer = setTimeout(() => handleStopCaptureClick(), 0);

                return () => clearTimeout(timer);
            }
        }
    }, [status, timeLeft, handleDataAvailable, handleStopCaptureClick]);

    useEffect(() => {
        if (status === 'idle' && recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            onRecordingComplete(blob);

            // Wait for next tick to avoid cascading render warning
            setTimeout(() => setRecordedChunks([]), 0);
        }
    }, [status, recordedChunks, onRecordingComplete]);

    const handleStartCaptureClick = () => {
        setStatus('preparing');
        setTimeLeft(4); // 4 seconds prep
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative h-full w-full max-w-md overflow-hidden bg-black shadow-2xl sm:h-[85vh] sm:rounded-2xl sm:border sm:border-zinc-800">

                {/* Close Button */}
                {(status === 'idle' || status === 'guide') && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/80"
                        onClick={onClose}
                    >
                        <X className="size-6" />
                        <span className="sr-only">Tutup</span>
                    </Button>
                )}

                {/* Webcam Stream */}
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    className="h-full w-full object-cover"
                    videoConstraints={{
                        facingMode: "user",
                        aspectRatio: 9 / 16
                    }}
                />

                {/* Bounding Box Overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
                    <div className="flex-[0.5] bg-black/50" />
                    <div className="flex justify-between">
                        <div className="w-8 bg-black/50 sm:w-16" />
                        <div className="relative aspect-9/16 w-72 border-2 border-dashed border-green-500">
                            {/* Batas Kepala Line */}
                            <div className="absolute left-0 top-[5%] w-full border-t border-dashed border-green-500/50">
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-green-500 drop-shadow-md">
                                    Batas Kepala
                                </span>
                            </div>
                            {/* Batas Bawah Kaki Line — positioned near the very bottom */}
                            <div className="absolute bottom-[3%] left-0 w-full border-t border-dashed border-green-500/50">
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-green-500 drop-shadow-md">
                                    Batas Bawah Kaki
                                </span>
                            </div>
                        </div>
                        <div className="w-8 bg-black/50 sm:w-16" />
                    </div>
                    <div className="flex-[0.5] bg-black/50" />
                </div>

                {/* Camera placement info banner */}
                {(status === 'idle' || status === 'guide') && (
                    <div className="absolute left-0 top-4 z-20 flex w-full justify-center px-4">
                        <div className="rounded-full bg-green-600/80 px-4 py-1.5 text-center text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                            📱 Simpan kamera sejajar tinggi perut Anda
                        </div>
                    </div>
                )}

                {/* 3D Human Silhouette Guide Animation */}
                {status === 'guide' && (
                    <HumanSilhouetteGuide onFinished={handleGuideFinished} />
                )}

                {/* Controls */}
                <div className="absolute bottom-10 left-0 z-20 flex w-full justify-center">
                    {status === 'preparing' && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex size-16 items-center justify-center rounded-full bg-yellow-500 text-2xl font-bold text-white shadow animate-bounce">
                                {timeLeft}
                            </div>
                            <span className="text-sm font-bold text-yellow-400 shadow-black drop-shadow-md">Bersiap...</span>
                        </div>
                    )}

                    {status === 'recording' && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex size-12 items-center justify-center rounded-full bg-red-600 font-bold text-white shadow animate-pulse">
                                {timeLeft}s
                            </div>
                            <span className="text-xs font-medium text-white shadow-black drop-shadow-md">Merekam...</span>
                        </div>
                    )}

                    {status === 'idle' && (
                        <Button onClick={handleStartCaptureClick} size="lg" className="rounded-full px-8 shadow-lg">
                            Mulai Rekam
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
