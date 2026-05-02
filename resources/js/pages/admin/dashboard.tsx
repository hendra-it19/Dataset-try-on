import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { batch } from '@/routes/admin/download';
import { excel, pdf } from '@/routes/admin/export';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminDashboard({ users }: { users: any }) {
    return (
        <>
            <Head title="Dasbor Admin" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Dasbor Admin</CardTitle>
                        <CardDescription>Kelola data responden VTON.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <a href={excel().url}>Ekspor Excel</a>
                            </Button>
                            <Button asChild variant="outline">
                                <a href={pdf().url}>Ekspor PDF</a>
                            </Button>
                            <Button asChild variant="outline">
                                <a href={batch().url}>Unduh Semua Video</a>
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Metrik</TableHead>
                                        <TableHead>Video Before</TableHead>
                                        <TableHead>Video After</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>
                                                T: {user.height}cm, B: {user.weight}kg, U: {user.age}
                                            </TableCell>
                                            <TableCell>
                                                {user.video_before ? (
                                                    <a href={`/videos/${user.video_before.video_path}`} target="_blank" className="text-blue-500 hover:underline">
                                                        Lihat
                                                    </a>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.videos_after && user.videos_after.length > 0 ? (
                                                    <ul className="list-inside list-disc">
                                                        {user.videos_after.map((v: any, i: number) => (
                                                            <li key={v.id}>
                                                                <a href={`/videos/${v.video_path}`} target="_blank" className="text-blue-500 hover:underline">
                                                                    Video {i + 1}
                                                                </a>
                                                                {v.product_link && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                                        (<a href={v.product_link} target="_blank" className="hover:underline">Link</a>)
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.data.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">Belum ada data responden.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dasbor Admin',
            href: dashboard(),
        },
    ],
};
