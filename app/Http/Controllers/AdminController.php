<?php

namespace App\Http\Controllers;

use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Facades\Excel;
use ZipArchive;

class AdminController extends Controller
{
    public function index(): Response
    {
        $users = User::where('role', 'user')
            ->with(['videoBefore', 'videosAfter'])
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/dashboard', [
            'users' => $users,
        ]);
    }

    public function exportExcel()
    {
        // For simplicity we will create an anonymous class implementing FromCollection, WithHeadings
        $export = new class implements FromCollection, WithHeadings
        {
            public function collection()
            {
                return User::where('role', 'user')->get()->map(function ($user) {
                    return [
                        'ID' => $user->id,
                        'Nama' => $user->name,
                        'Tinggi (cm)' => $user->height,
                        'Berat (kg)' => $user->weight,
                        'Umur' => $user->age,
                        'Link Belanja Kemeja' => $user->videosAfter->pluck('product_link')->filter()->join(', '),
                    ];
                });
            }

            public function headings(): array
            {
                return ['ID', 'Nama', 'Tinggi (cm)', 'Berat (kg)', 'Umur', 'Link Belanja Kemeja'];
            }
        };

        return Excel::download($export, 'data_responden.xlsx');
    }

    public function exportPdf()
    {
        $users = User::where('role', 'user')->with('videosAfter')->get();

        $pdf = Pdf::loadHTML($this->generateHtmlForPdf($users));

        return $pdf->download('data_responden.pdf');
    }

    private function generateHtmlForPdf($users)
    {
        $html = '<h1>Data Responden VTON</h1><table border="1" cellpadding="5" cellspacing="0" style="width:100%">';
        $html .= '<thead><tr><th>ID</th><th>Nama</th><th>Tinggi (cm)</th><th>Berat (kg)</th><th>Umur</th><th>Link Belanja Kemeja</th></tr></thead><tbody>';

        foreach ($users as $user) {
            $links = $user->videosAfter->pluck('product_link')->filter()->join(', ');
            $html .= "<tr>
                <td>{$user->id}</td>
                <td>{$user->name}</td>
                <td>{$user->height}</td>
                <td>{$user->weight}</td>
                <td>{$user->age}</td>
                <td>{$links}</td>
            </tr>";
        }

        $html .= '</tbody></table>';

        return $html;
    }

    public function downloadBatch()
    {
        $zip = new ZipArchive;
        $fileName = 'videos_batch.zip';
        $path = public_path($fileName);

        if ($zip->open($path, ZipArchive::CREATE) === true) {
            $users = User::where('role', 'user')->with(['videoBefore', 'videosAfter'])->get();

            foreach ($users as $user) {
                if ($user->videoBefore && file_exists(public_path('videos/'.$user->videoBefore->video_path))) {
                    $zip->addFile(public_path('videos/'.$user->videoBefore->video_path), 'user_'.$user->id.'/'.basename($user->videoBefore->video_path));
                }
                foreach ($user->videosAfter as $after) {
                    if (file_exists(public_path('videos/'.$after->video_path))) {
                        $zip->addFile(public_path('videos/'.$after->video_path), 'user_'.$user->id.'/'.basename($after->video_path));
                    }
                }
            }
            $zip->close();
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }
}
