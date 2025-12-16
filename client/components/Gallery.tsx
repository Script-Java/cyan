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
  spanClass = "col-span-1 md:col-span-8",
}: GalleryCardProps) {
  return (
    <div className={spanClass}>
      <a
        href={href}
        className="block rounded-2xl outline-blue-500"
      >
        <div
          className="relative w-full aspect-4/5 bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: "0 4px 4px 1.6px rgba(4, 4, 4, 0.08)",
          }}
        >
          {/* Image */}
          <img
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            fetchPriority="auto"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transitionDuration: "2.44s",
              transitionProperty: "transform",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
            }}
          />

          {/* Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 w-full h-1/2"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0, 0, 0, 0), rgb(21, 21, 21))",
            }}
          ></div>

          {/* Text Content Overlay */}
          <div
            className="absolute inset-0 flex flex-col justify-end rounded-2xl p-6"
            style={{
              pointerEvents: "none",
            }}
          >
            <div className="space-y-1">
              <h3
                className="font-black uppercase"
                style={{
                  color: "rgb(255, 219, 0)",
                  fontSize: "20px",
                  fontWeight: "800",
                  lineHeight: "28px",
                }}
              >
                {label}
              </h3>
              <div
                style={{
                  color: "rgb(255, 255, 255)",
                  fontSize: "32px",
                  fontWeight: "900",
                  lineHeight: "38px",
                }}
              >
                {handle}
              </div>
            </div>
            <div className="mt-2">
              <p
                style={{
                  color: "rgb(255, 255, 255)",
                  fontSize: "18px",
                  lineHeight: "28px",
                }}
              >
                {description}
              </p>
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
    <section className="w-full bg-white" style={{ gap: "48px" }}>
      <div
        className="px-4 w-full"
        style={{
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div
          className="h-full mx-auto w-full"
          style={{
            maxWidth: "1230px",
          }}
        >
          <div className="w-full">
            <div
              className="grid w-full"
              style={{
                gridTemplateColumns: "repeat(12, minmax(0px, 1fr))",
                gap: "32px",
              }}
            >
              {cards.map((card, index) => (
                <GalleryCard
                  key={index}
                  {...card}
                  spanClass={card.spanClass || (index === 0 ? "col-span-12 md:col-span-8" : "col-span-12 md:col-span-4")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
