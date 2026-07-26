import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { renderInvoicePdf } from '@/lib/pdf';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { clinic: true },
  });

  if (!invoice || (session.user.role !== 'SUPER_ADMIN' && invoice.clinicId !== session.user.clinicId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const pdfBuffer = await renderInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    clinicName: invoice.clinic.name,
    amount: invoice.amount,
    status: invoice.status,
    dueDate: invoice.dueDate.toLocaleDateString('en-NG'),
    paidAt: invoice.paidAt?.toLocaleDateString('en-NG'),
  });

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
