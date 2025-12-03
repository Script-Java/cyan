import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  description?: string;
  image: string;
  itemCount?: number;
}

export default function ProductCategoryCard({
  id,
  name,
  description,
  image,
  itemCount,
}: CategoryCardProps) {
  return (
    <Link to={`/products?category=${id}`}>
      <div className="group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 flex flex-col h-full cursor-pointer">
        {/* Category Image */}
        <div className="relative bg-white/10 aspect-square overflow-hidden flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 group-hover:to-black/60 transition-all duration-300"></div>
        </div>

        {/* Category Info */}
        <div className="p-4 flex flex-col flex-grow justify-end">
          <h3 className="font-bold text-white text-base mb-1 group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          {description && (
            <p className="text-xs text-white/60 mb-2 group-hover:text-white/80 transition-colors line-clamp-2">
              {description}
            </p>
          )}
          {itemCount !== undefined && (
            <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors mb-2">
              {itemCount} {itemCount === 1 ? "product" : "products"}
            </p>
          )}
          <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
            <span className="text-xs font-semibold">Shop Now</span>
            <span className="ml-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
