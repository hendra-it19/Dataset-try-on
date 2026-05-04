import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { video as recordVideo } from '@/routes/record';
import { link as afterLink } from '@/routes/video/after';

function VideoAfterItem({ video, index }: { video: any; index: number }) {
    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        product_link: video.product_link || '',
    });

    const [isEditing, setIsEditing] = useState(!video.product_link);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(afterLink(video.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Link produk berhasil disimpan.');
                setIsEditing(false);
            },
            onError: (errs) => {
                toast.error(errs.product_link || 'Gagal menyimpan link. Pastikan link valid.');
            }
        });
    };

    return (
        <div className="space-y-3 rounded-lg border p-4">
            <div className="font-medium">Video {index + 1}</div>
            <video src={`/videos/${video.video_path}`} controls className="w-full rounded-lg" />
            <form className="space-y-2" onSubmit={submit}>
                <Label>Link Belanja Kemeja</Label>
                <div className="flex gap-2">
                    <Input
                        type="url"
                        value={data.product_link}
                        onChange={(e) => setData('product_link', e.target.value)}
                        placeholder="https://..."
                        required
                        disabled={!isEditing}
                    />
                    {isEditing ? (
                        <Button type="submit" disabled={processing}>
                            {recentlySuccessful ? (
                                <><Check className="size-4 mr-1" /> Tersimpan</>
                            ) : processing ? (
                                'Menyimpan...'
                            ) : video.product_link ? (
                                'Update'
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </div>
                {errors.product_link && <div className="text-sm text-red-500">{errors.product_link}</div>}
            </form>
        </div>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const user = auth.user;

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
                                        <VideoAfterItem key={video.id} video={video} index={index} />
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
