import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');
    
    console.log('Received file:', file); // Debug log
    
    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      filename: file.name 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}