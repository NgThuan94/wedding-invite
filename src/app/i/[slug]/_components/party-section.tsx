import Image from 'next/image';
import type { Tables } from '@/types/database';

interface PartySectionProps {
  members: Tables<'wedding_party'>[];
}

export function PartySection({ members }: PartySectionProps) {
  if (members.length === 0) return null;

  return (
    <section className="py-20 px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Những người thân yêu
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {members.map((member) => (
            <div key={member.id} className="text-center">
              {/* Avatar */}
              <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-2 border-accent/20 md:h-28 md:w-28">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary text-2xl text-muted-foreground">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-serif text-base font-medium text-foreground">{member.name}</p>
              {member.role && (
                <p className="mt-0.5 text-xs text-accent">{member.role}</p>
              )}
              {member.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {member.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
