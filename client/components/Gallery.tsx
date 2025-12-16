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
  // Check if this is a smaller card (col-span-4)
  const isSmallCard = spanClass?.includes("col-span-4");

  return (
    <div
      className={spanClass}
      style={isSmallCard ? { paddingBottom: "200px", marginBottom: "200px" } : {}}
    >
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
  showHeaderImage?: boolean;
  headerImageSrc?: string;
  showFooterImage?: boolean;
  footerImageSrc?: string;
}

export function Gallery({
  cards,
  showHeaderImage = false,
  headerImageSrc = "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1200 1200w",
  showFooterImage = false,
  footerImageSrc = "https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F72c80f114dc149019051b6852a9e3b7a?width=1200 1200w",
}: GalleryProps) {
  return (
    <section
      className="w-full bg-white"
      style={{ gap: "48px", marginTop: "31px", padding: "0 16px 35px" }}
    >
      <div className="w-full">
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
              {cards.length > 0 && showHeaderImage && (
                <div
                  style={{
                    gridArea: "auto / span 8 / auto / span 8",
                  }}
                >
                  <a href="#" className="block rounded-2xl">
                    <img
                      loading="lazy"
                      srcSet={headerImageSrc}
                      alt="Gallery header image"
                      style={{
                        aspectRatio: "1.69",
                        objectFit: "cover",
                        objectPosition: "center",
                        width: "100%",
                        marginTop: "7px",
                        minHeight: "20px",
                        minWidth: "20px",
                        overflow: "hidden",
                      }}
                    />
                  </a>
                </div>
              )}
              {cards.map((card, index) => (
                <GalleryCard
                  key={index}
                  {...card}
                  spanClass={
                    card.spanClass ||
                    (index === 0 ? "col-span-12 md:col-span-8" : "col-span-12 md:col-span-4")
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {showFooterImage && (
        <div style={{ maxWidth: "1230px", margin: "0 auto", width: "100%", paddingLeft: "16px", paddingRight: "16px" }}>
          <img
            loading="lazy"
            srcSet={footerImageSrc}
            alt="Gallery footer image"
            style={{
              aspectRatio: "3.3",
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              marginTop: "42px",
              minHeight: "20px",
              minWidth: "20px",
              overflow: "hidden",
              maxWidth: "1601px",
            }}
          />
        </div>
      )}
    </section>
  );
}
