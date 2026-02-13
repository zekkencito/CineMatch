// Datos mock para modo de desarrollo/prueba

export const mockUsers = [
  {
    id: 2,
    name: 'Sarah Johnson',
    age: 27,
    email: 'sarah@example.com',
    bio: 'Horror movies are my passion! 👻 Also love sci-fi and thrillers.',
    profile_photo: 'https://i.pravatar.cc/400?img=5',
    favorite_genres: [
      { id: 1, name: 'Horror' },
      { id: 2, name: 'Sci-Fi' },
      { id: 3, name: 'Thriller' },
    ],
  },
  {
    id: 3,
    name: 'Michael Chen',
    age: 30,
    email: 'michael@example.com',
    bio: 'Action and adventure movies enthusiast 🎬 Marvel fan!',
    profile_photo: 'https://i.pravatar.cc/400?img=8',
    favorite_genres: [
      { id: 4, name: 'Action' },
      { id: 5, name: 'Adventure' },
      { id: 6, name: 'Superhero' },
    ],
  },
  {
    id: 4,
    name: 'Emma Davis',
    age: 24,
    email: 'emma@example.com',
    bio: 'Romantic comedies and drama lover ❤️ Classics are the best!',
    profile_photo: 'https://i.pravatar.cc/400?img=9',
    favorite_genres: [
      { id: 7, name: 'Romance' },
      { id: 8, name: 'Comedy' },
      { id: 9, name: 'Drama' },
    ],
  },
  {
    id: 5,
    name: 'James Wilson',
    age: 29,
    email: 'james@example.com',
    bio: 'Documentary and indie film buff 🎥 Real stories matter!',
    profile_photo: 'https://i.pravatar.cc/400?img=13',
    favorite_genres: [
      { id: 10, name: 'Documentary' },
      { id: 11, name: 'Indie' },
      { id: 9, name: 'Drama' },
    ],
  },
  {
    id: 6,
    name: 'Olivia Martinez',
    age: 26,
    email: 'olivia@example.com',
    bio: 'Anime and fantasy movies are life! ⚔️ Studio Ghibli forever!',
    profile_photo: 'https://i.pravatar.cc/400?img=10',
    favorite_genres: [
      { id: 12, name: 'Animation' },
      { id: 13, name: 'Fantasy' },
      { id: 14, name: 'Anime' },
    ],
  },
];

export const mockMatches = [
  {
    id: 1,
    name: 'Sarah Johnson',
    profile_photo: 'https://i.pravatar.cc/80?img=5',
    matched_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Emma Davis',
    profile_photo: 'https://i.pravatar.cc/80?img=9',
    matched_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockGenres = [
  { id: 1, name: 'Horror' },
  { id: 2, name: 'Sci-Fi' },
  { id: 3, name: 'Thriller' },
  { id: 4, name: 'Action' },
  { id: 5, name: 'Adventure' },
  { id: 6, name: 'Superhero' },
  { id: 7, name: 'Romance' },
  { id: 8, name: 'Comedy' },
  { id: 9, name: 'Drama' },
  { id: 10, name: 'Documentary' },
  { id: 11, name: 'Indie' },
  { id: 12, name: 'Animation' },
  { id: 13, name: 'Fantasy' },
  { id: 14, name: 'Anime' },
  { id: 15, name: 'Mystery' },
  { id: 16, name: 'Crime' },
];

export const mockMovies = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    release_year: 1994,
    poster_url: 'https://via.placeholder.com/200x300/1a1a1a/E50914?text=Shawshank',
    genres: [{ id: 9, name: 'Drama' }],
  },
  {
    id: 2,
    title: 'The Dark Knight',
    release_year: 2008,
    poster_url: 'https://via.placeholder.com/200x300/1a1a1a/E50914?text=Dark+Knight',
    genres: [{ id: 4, name: 'Action' }, { id: 6, name: 'Superhero' }],
  },
  {
    id: 3,
    title: 'Inception',
    release_year: 2010,
    poster_url: 'https://via.placeholder.com/200x300/1a1a1a/E50914?text=Inception',
    genres: [{ id: 2, name: 'Sci-Fi' }, { id: 3, name: 'Thriller' }],
  },
];
