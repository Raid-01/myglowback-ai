import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function PublicPortalPage({ params }: { params: { clinicId: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: params.clinicId },
    include: { locations: { where: { isActive: true } } },
  });

  if (!clinic) notFound();

  if (!clinic.isActive) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory-100 px-6">
        <div className="max-w-sm rounded-card border border-clinical-border bg-white p-8 text-center shadow-soft">
          <h1 className="font-display text-xl font-medium text-clinical-text">
            Clinic unavailable
          </h1>
          <p className="mt-2 text-sm text-clinical-muted">
            {clinic.name} isn&apos;t currently accepting bookings. Please check back later.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-16">
      <h1 className="font-display text-2xl font-medium text-clinical-text">{clinic.name}</h1>
      <p className="mt-1 text-sm text-clinical-muted">Choose a location to book a visit.</p>

      <div className="mt-6 space-y-3">
        {clinic.locations.map((loc) => (
          <div key={loc.id} className="rounded-card border border-clinical-border bg-white p-5">
            <p className="font-medium text-clinical-text">{loc.name}</p>
            <p className="text-sm text-clinical-muted">{loc.address}</p>
            {loc.phone && <p className="text-sm text-clinical-muted">{loc.phone}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
