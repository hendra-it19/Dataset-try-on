import { Head, router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import VideoRecorder from '@/components/video-recorder';
import { dashboard } from '@/routes';
import { store as storeAfter } from '@/routes/video/after';
import { store as storeBefore } from '@/routes/video/before';

export default function RecordVideo({ type }: { type: 'before' | 'after' }) {
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Prevent accidental tab closure during upload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (uploading) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploading]);

    const handleRecordingComplete = (blob: Blob) => {
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setUploadError(null);
    };

    const handleUploadClick = () => {
        if (!navigator.onLine) {
            setUploadError("Koneksi internet terputus. Pastikan Anda online lalu coba lagi.");

            return;
        }

        if (recordedBlob) {
            setUploading(true);
            setUploadError(null);
            const endpoint = type === 'before' ? storeBefore().url : storeAfter().url;
            
            router.post(endpoint, {
                video: recordedBlob
            }, {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    setUploading(false);
                    setUploadError(errors.video || "Terjadi kesalahan saat mengunggah video. Silakan coba lagi.");
                },
                onFinish: () => {
                    // if it didn't transition away, it means it failed or finished with no redirect
                    // but usually inertia redirects on success.
                    setUploading(false);
                }
            });
        }
    };

    const handleRetakeClick = () => {
        setRecordedBlob(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setUploadError(null);
    };

    return (
        <>
            <Head title={`Rekam Video ${type === 'before' ? 'Before' : 'After'}`} />
            
            <div className="flex flex-col gap-6 p-4">
                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <CardTitle>Rekam Video {type === 'before' ? 'Before' : 'After'}</CardTitle>
                        <CardDescription>
                            {type === 'before' 
                                ? 'Harap gunakan pakaian ketat/fitting (seperti kaos dalam) untuk mengambil video Before.' 
                                : 'Harap gunakan pakaian kemeja untuk mengambil video After.'}
                            <br />
                            Pastikan tubuh Anda berada di dalam area garis putus-putus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {uploading ? (
                            <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-xl border bg-muted">
                                <Spinner />
                                <div className="text-sm font-medium">Mengunggah video... mohon tunggu.</div>
                                <div className="text-xs text-muted-foreground">Jangan tutup halaman ini.</div>
                            </div>
                        ) : recordedBlob && previewUrl ? (
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border bg-black">
                                    <video 
                                        src={previewUrl} 
                                        controls 
                                        autoPlay 
                                        loop
                                        className="mx-auto aspect-9/16 h-[60vh] max-h-[500px] bg-black object-cover"
                                    />
                                </div>
                                
                                {uploadError && (
                                    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle className="size-4" />
                                        <span>{uploadError}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" size="lg" onClick={handleRetakeClick}>
                                        Rekam Ulang
                                    </Button>
                                    <Button size="lg" onClick={handleUploadClick}>
                                        {uploadError ? "Coba Unggah Lagi" : "Unggah Video"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <VideoRecorder 
                                onRecordingComplete={handleRecordingComplete} 
                                onClose={() => router.visit(dashboard().url)}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RecordVideo.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: dashboard(),
        },
        {
            title: 'Rekam Video',
        }
    ],
};
