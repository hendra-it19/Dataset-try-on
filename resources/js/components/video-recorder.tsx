import { X } from 'lucide-react';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';

export default function VideoRecorder({ onRecordingComplete, onClose }: { onRecordingComplete: (blob: Blob) => void; onClose: () => void }) {
    const webcamRef = useRef<Webcam>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    type Status = 'idle' | 'preparing' | 'recording';
    const [status, setStatus] = useState<Status>('idle');
    const [timeLeft, setTimeLeft] = useState(0);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

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
                {status === 'idle' && (
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
                    <div className="flex-1 bg-black/50" />
                    <div className="flex justify-between">
                        <div className="w-12 bg-black/50 sm:w-20" />
                        <div className="relative aspect-9/16 w-64 border-2 border-dashed border-green-500">
                            {/* Batas Kepala Line */}
                            <div className="absolute left-0 top-1/6 w-full border-t border-dashed border-green-500/50">
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-green-500 drop-shadow-md">
                                    Batas Kepala
                                </span>
                            </div>
                            {/* Batas Paha/Lutut Line */}
                            <div className="absolute bottom-1/6 left-0 w-full border-t border-dashed border-green-500/50">
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-green-500 drop-shadow-md">
                                    Batas Paha/Lutut
                                </span>
                            </div>
                        </div>
                        <div className="w-12 bg-black/50 sm:w-20" />
                    </div>
                    <div className="flex-1 bg-black/50" />
                </div>

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
