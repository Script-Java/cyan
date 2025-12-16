interface GalleryCardProps {
  href: string;
  imageSrc: string;
  imageAlt: string;
  label: string;
  handle: string;
  description: string;
  spanClass?: string;
}

function GalleryCard({
  href,
  imageSrc,
  imageAlt,
  label,
  handle,
  description,
  spanClass = "col-span-12 md:col-span-8",
}: GalleryCardProps) {
  return (
    <div className={spanClass}>
      <a
        href={href}
        className="block rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-105"
      >
        <div className="relative w-full aspect-4/5 bg-white shadow-md rounded-2xl overflow-hidden group">
          {/* Image */}
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2440ms] ease-in-out group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>

          {/* Text Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 rounded-2xl">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wide">
                {label}
              </h3>
              <div className="text-3xl font-black text-white">{handle}</div>
            </div>
            <div className="mt-2">
              <p className="text-base leading-relaxed text-white">{description}</p>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

interface GalleryProps {
  cards: GalleryCardProps[];
}

export function Gallery({ cards }: GalleryProps) {
  return (
    <section className="w-full bg-white py-12 sm:py-20 lg:py-24">
      <div className="px-4 sm:px-6 lg:px-8 w-full">
        <div className="h-full mx-auto max-w-6xl">
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {cards.map((card, index) => (
                <GalleryCard
                  key={index}
                  {...card}
                  spanClass={card.spanClass || (index === 0 ? "col-span-1 md:col-span-8" : "col-span-1 md:col-span-4")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
