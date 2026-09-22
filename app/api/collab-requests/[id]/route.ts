import { NextResponse } from 'next/server';
import { 
  updateCollabRequestAsync,
  updateCollabRequestStatusAsync, 
  deleteCollabRequestAsync, 
  approveAndPublishCollabRequestAsync 
} from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    if (body.action === 'approve_and_publish') {
      const liveRaffle = await approveAndPublishCollabRequestAsync(id);
      if (!liveRaffle) {
        return NextResponse.json({ success: false, error: 'Collab request not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, raffle: liveRaffle });
    }

    if (body.status && Object.keys(body).length === 1) {
      await updateCollabRequestStatusAsync(id, body.status);
      return NextResponse.json({ success: true, status: body.status });
    }

    const updated = await updateCollabRequestAsync(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Collab request not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, collabRequest: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const deleted = await deleteCollabRequestAsync(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
