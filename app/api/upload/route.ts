import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'NO_FILE_UPLOADED' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Primary: Upload directly to Supabase Storage (Persistent across all serverless/Vercel deployments)
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(safeName, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: pubData } = supabase.storage
          .from('uploads')
          .getPublicUrl(uploadData.path || safeName);

        if (pubData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: pubData.publicUrl,
            filename: safeName,
            size: buffer.length,
          });
        }
      }
    } catch (storageErr) {
      console.warn('Supabase storage upload failed, attempting local/base64 fallback:', storageErr);
    }

    // 2. Secondary: Try local directory if filesystem is writable
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeName}`,
        filename: safeName,
        size: buffer.length,
      });
    } catch (fsErr) {
      // 3. Ultimate Fallback: Base64 Data URL (guaranteed to work in serverless read-only environments)
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Data,
        filename: safeName,
        size: buffer.length,
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
