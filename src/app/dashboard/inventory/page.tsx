import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { InventoryTable } from '@/components/InventoryTable';

export default async function InventoryPage() {
  const session = await requireRole(['CLINIC_ADMIN']);
  const products = await prisma.product.findMany({
    where: { clinicId: session.user.clinicId! },
    orderBy: { name: 'asc' },
  });

  return <InventoryTable initialProducts={products} />;
}
