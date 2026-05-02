import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { video as recordVideo } from '@/routes/record';
import { link as afterLink } from '@/routes/video/after';

export default function Dashboard() {
    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const user = auth.user;
    
    const [processingId, setProcessingId] = useState<number | null>(null);

    const updateLink = (videoId: number, linkUrl: string) => {
        setProcessingId(videoId);
        router.post(afterLink(videoId).url, { product_link: linkUrl }, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null)
        });
    };

    return (
        <>
            <Head title="Dasbor" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Pengguna</CardTitle>
                        <CardDescription>Informasi metrik fisik Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Nama</span>
                            <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Tinggi</span>
                            <span className="font-medium">{user.height} cm</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Berat</span>
                            <span className="font-medium">{user.weight} kg</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-muted-foreground">Umur</span>
                            <span className="font-medium">{user.age} tahun</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Video Before</CardTitle>
                            <CardDescription>Video menggunakan kaos ketat.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {user.video_before ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                        ✓ Video Before sudah direkam.
                                    </div>
                                    <video src={`/videos/${user.video_before.video_path}`} controls className="w-full rounded-lg" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                        Status: Belum Direkam
                                    </div>
                                    <Button asChild className="w-full">
                                        <Link href={recordVideo('before').url}>Rekam Video Before</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Video After</CardTitle>
                            <CardDescription>Video menggunakan kemeja.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={recordVideo('after').url}>Tambah Video After</Link>
                            </Button>

                            <div className="space-y-4">
                                {user.videos_after && user.videos_after.length > 0 ? (
                                    user.videos_after.map((video: any, index: number) => (
                                        <div key={video.id} className="space-y-3 rounded-lg border p-4">
                                            <div className="font-medium">Video {index + 1}</div>
                                            <video src={`/videos/${video.video_path}`} controls className="w-full rounded-lg" />
                                            <form 
                                                className="space-y-2"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    updateLink(video.id, formData.get('product_link') as string);
                                                }}
                                            >
                                                <Label>Link Belanja Kemeja</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        name="product_link"
                                                        defaultValue={video.product_link || ''} 
                                                        placeholder="https://..." 
                                                        required 
                                                    />
                                                    <Button type="submit" disabled={processingId === video.id}>Simpan</Button>
                                                </div>
                                            </form>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground">
                                        Belum ada video after.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: dashboard(),
        },
    ],
};
