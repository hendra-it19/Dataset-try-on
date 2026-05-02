<?php

namespace App\Http\Controllers;

use App\Models\VideoAfter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class VideoController extends Controller
{
    public function storeBefore(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimetypes:video/webm,video/mp4,video/x-matroska',
        ]);

        $file = $request->file('video');
        $filename = 'before_'.$request->user()->id.'_'.time().'.'.$file->getClientOriginalExtension();

        try {
            DB::beginTransaction();

            $path = $file->storeAs('', $filename, 'public_videos');

            $request->user()->videoBefore()->updateOrCreate(
                ['user_id' => $request->user()->id],
                ['video_path' => $path]
            );

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'Video Before berhasil disimpan.');
        } catch (Throwable $e) {
            DB::rollBack();
            if (isset($path)) {
                Storage::disk('public_videos')->delete($path);
            }
            return back()->withErrors(['video' => 'Gagal menyimpan video ke database. Silakan coba lagi.']);
        }
    }

    public function storeAfter(Request $request)
    {
        $request->validate([
            'video' => 'required|file|mimetypes:video/webm,video/mp4,video/x-matroska',
        ]);

        $file = $request->file('video');
        $filename = 'after_'.$request->user()->id.'_'.time().'.'.$file->getClientOriginalExtension();

        try {
            DB::beginTransaction();

            $path = $file->storeAs('', $filename, 'public_videos');

            $request->user()->videosAfter()->create([
                'video_path' => $path,
            ]);

            DB::commit();

            return redirect()->route('dashboard')->with('success', 'Video After berhasil disimpan.');
        } catch (Throwable $e) {
            DB::rollBack();
            if (isset($path)) {
                Storage::disk('public_videos')->delete($path);
            }
            return back()->withErrors(['video' => 'Gagal menyimpan video ke database. Silakan coba lagi.']);
        }
    }

    public function updateAfterLink(Request $request, VideoAfter $video)
    {
        if ($video->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'product_link' => 'required|url',
        ]);

        $video->update([
            'product_link' => $request->product_link,
        ]);

        return redirect()->back()->with('success', 'Link produk berhasil disimpan.');
    }
}
