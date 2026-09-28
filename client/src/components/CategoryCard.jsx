import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/explore/${category.slug}`}
      className="group relative rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)]/70 transition-all duration-300 aspect-[4/5] shadow-lg hover:shadow-[0_0_40px_var(--glow)]"
    >

      <img
        src={category.image}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />


      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />


      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${category.color}, transparent)`,
        }}
      />


      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-orbitron text-xl md:text-2xl font-extrabold text-[var(--cream)] leading-tight drop-shadow-lg">
          {category.name}
        </h3>

        <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-1">
          {category.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {category.totalContent}+ items
          </span>
          <span
            className="text-sm font-bold opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300"
            style={{ color: category.color }}
          >
            Explore →
          </span>
        </div>
      </div>


      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: category.color }}
      />
    </Link>
  );
};

export default CategoryCard;
