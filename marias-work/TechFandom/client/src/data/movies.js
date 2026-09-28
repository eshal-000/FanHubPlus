export const MOVIES = [
  {
    id: 'winnie-the-pooh-2011',
    slug: 'winnie-the-pooh-2011',
    title: 'Winnie the Pooh',
    country: 'USA',
    releaseYear: 2011,
    runtime: '63 min',
    genres: ['Animation', 'Adventure', 'Family'],
    language: 'English',
    director: 'Stephen J. Anderson',
    directorPhoto: null,
    poster: null,
    synopsis:
      'Winnie the Pooh and his friends in the Hundred Acre Wood embark on a gentle adventure when Eeyore loses his tail and Christopher Robin goes missing. A warm, hand-drawn tale about friendship and helping one another.',
    cast: [
      { name: 'Jim Cummings', characterName: 'Winnie the Pooh / Tigger', photo: null },
      { name: 'Bud Luckey', characterName: 'Eeyore', photo: null },
      { name: 'Craig Ferguson', characterName: 'Owl', photo: null },
      { name: 'Travis Oates', characterName: 'Piglet', photo: null },
    ],
    trailerUrl: null, // No approved trailer provided
    relatedIds: ['little-forest-2018', 'taare-zameen-par-2007'],
    categorySlug: 'movies',
    color: '#F59E0B',
  },
  {
    id: 'little-forest-2018',
    slug: 'little-forest-2018',
    title: 'Little Forest',
    country: 'South Korea',
    releaseYear: 2018,
    runtime: '103 min',
    genres: ['Drama', 'Slice of Life'],
    language: 'Korean',
    director: 'Yim Soon-rye',
    directorPhoto: null,
    poster: null,
    synopsis:
      'A young woman returns to her rural hometown after growing tired of city life. Through cooking, farming, and reconnecting with old friends, she rediscovers the simple rhythms that make a life worth living.',
    cast: [
      { name: 'Kim Tae-ri', characterName: 'Hye-won', photo: null },
      { name: 'Ryu Jun-yeol', characterName: 'Jae-ha', photo: null },
      { name: 'Jin Ki-joo', characterName: 'Eun-sook', photo: null },
      { name: 'Moon So-ri', characterName: 'Mother', photo: null },
    ],
    trailerUrl: null,
    relatedIds: ['winnie-the-pooh-2011', 'taare-zameen-par-2007'],
    categorySlug: 'movies',
    color: '#F59E0B',
  },
  {
    id: 'taare-zameen-par-2007',
    slug: 'taare-zameen-par-2007',
    title: 'Taare Zameen Par',
    country: 'India',
    releaseYear: 2007,
    runtime: '165 min',
    genres: ['Drama', 'Family'],
    language: 'Hindi',
    director: 'Aamir Khan',
    directorPhoto: null,
    poster: null,
    synopsis:
      'Ishaan is a young boy whose struggles with dyslexia are misunderstood as laziness by his family and teachers. When an unconventional art teacher enters his life, he begins to see the world — and himself — in a new light.',
    cast: [
      { name: 'Darsheel Safary', characterName: 'Ishaan Awasthi', photo: null },
      { name: 'Aamir Khan', characterName: 'Ram Shankar Nikumbh', photo: null },
      { name: 'Tisca Chopra', characterName: 'Maya Awasthi', photo: null },
      { name: 'Vipin Sharma', characterName: 'Nandkishore Awasthi', photo: null },
    ],
    trailerUrl: null,
    relatedIds: ['winnie-the-pooh-2011', 'little-forest-2018'],
    categorySlug: 'movies',
    color: '#F59E0B',
  },
];

export const getMovieBySlug = (slug) =>
  MOVIES.find((m) => m.slug === slug || m.id === slug);

export const getRelatedMovies = (movie) => {
  if (!movie?.relatedIds?.length) return [];
  return movie.relatedIds
    .map((id) => MOVIES.find((m) => m.id === id))
    .filter(Boolean);
};

// Cards shown in ExploreCategory for "movies" category
export const MOVIE_CARDS = MOVIES.map((m) => ({
  id: m.id,
  slug: m.slug,
  title: m.title,
  type: 'Movie',
  description: m.synopsis,
  imageUrl: m.poster, // null for now — ContentCard will show placeholder
  rating: 0,
  likes: 0,
  releaseYear: m.releaseYear,
  popularity: 100,
  categorySlug: 'movies',
  isMovieDetail: true, // <-- signal for ContentCard to route to /movies/:slug
}));