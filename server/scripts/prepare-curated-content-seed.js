
require('dotenv').config()
const mongoose = require('mongoose')
const Category = require('../models/Category')
const Content = require('../models/Content')
const connectDB = require('../config/db')

const WRITE_FLAGS = ['--execute', '--i-understand-this-writes-to-fanhubplus']
const SHOULD_EXECUTE = WRITE_FLAGS.every((flag) => process.argv.includes(flag))
const ALLOW_UPDATES = process.argv.includes('--allow-updates')
const CHECK_LIVE_CONFLICTS = process.argv.includes('--check-live-conflicts')

const CATEGORIES = [
  {
    color: '#FF006B',
    description: 'Japanese animation, series, films and character worlds.',
    heroImage: '/images/categories/category-anime.png',
    icon: 'anime',
    image: '/images/categories/category-anime.png',
    name: 'Anime',
    shortDescription: 'Japanese animation and films',
    slug: 'anime',
    sortOrder: 1,
    status: 'active',
  },
  {
    color: '#8B5CF6',
    description: 'Games, cozy worlds, sandbox creativity and community play.',
    heroImage: '/images/categories/category-gaming.png',
    icon: 'gaming',
    image: '/images/categories/category-gaming.png',
    name: 'Gaming',
    shortDescription: 'Games and playable worlds',
    slug: 'gaming',
    sortOrder: 2,
    status: 'active',
  },
  {
    color: '#F59E0B',
    description: 'Films, directors, casts, posters, trailers and cinematic details.',
    heroImage: '/images/categories/category-movies.png',
    icon: 'movies',
    image: '/images/categories/category-movies.png',
    name: 'Movies',
    shortDescription: 'Films and cinematic stories',
    slug: 'movies',
    sortOrder: 3,
    status: 'active',
  },
  {
    color: '#06B6D4',
    description: 'Television series, animated shows, sitcoms and drama fandoms.',
    heroImage: '/images/categories/category-tvshows.png',
    icon: 'tv',
    image: '/images/categories/category-tvshows.png',
    name: 'TV Shows',
    shortDescription: 'Series and dramas',
    slug: 'tv-shows',
    sortOrder: 4,
    status: 'active',
  },
  {
    color: '#EC4899',
    description: 'K-Pop groups, debuts, members, music eras and fandom moments.',
    heroImage: '/images/categories/category-kpop.png',
    icon: 'kpop',
    image: '/images/categories/category-kpop.png',
    name: 'K-Pop',
    shortDescription: 'Korean pop groups and eras',
    slug: 'k-pop',
    sortOrder: 5,
    status: 'active',
  },
  {
    color: '#10B981',
    description: 'Comic strips, European albums and graphic storytelling classics.',
    heroImage: '/images/categories/category-comics.jfif',
    icon: 'comics',
    image: '/images/categories/category-comics.jfif',
    name: 'Comics',
    shortDescription: 'Classic comics and albums',
    slug: 'comics',
    sortOrder: 6,
    status: 'active',
  },
  {
    color: '#F472B6',
    description: 'Manga series, creators, publishers and slice-of-life favorites.',
    heroImage: '/images/categories/category-manga.png',
    icon: 'manga',
    image: '/images/categories/category-manga.png',
    name: 'Manga',
    shortDescription: 'Japanese manga series',
    slug: 'manga',
    sortOrder: 7,
    status: 'active',
  },
  {
    color: '#A855F7',
    description: 'Modest cosplay concepts, materials, palettes and styling notes.',
    heroImage: '/images/categories/category-cosplay.png',
    icon: 'cosplay',
    image: '/images/categories/category-cosplay.png',
    name: 'Cosplay',
    shortDescription: 'Costume concepts and styling',
    slug: 'cosplay',
    sortOrder: 8,
    status: 'active',
  },
]

const categoryImage = {
  anime: '/images/categories/category-anime.png',
  comics: '/images/categories/category-comics.jfif',
  cosplay: '/images/categories/category-cosplay.png',
  gaming: '/images/categories/category-gaming.png',
  'k-pop': '/images/categories/category-kpop.png',
  manga: '/images/categories/category-manga.png',
  movies: '/images/categories/category-movies.png',
  'tv-shows': '/images/categories/category-tvshows.png',
}

function link(label, url, type = 'reference') {
  return { label, type, url }
}

function people(rows) {
  return rows.map(([name, role, characterName = '', bio = '']) => ({
    bio,
    characterName,
    imageUrl: '',
    name,
    role,
  }))
}

const CONTENT = [
  {
    body: 'Pokemon is a long-running Japanese anime series tied to the wider Pokemon media franchise. The record focuses on the television anime, its adventure structure, and its place as a gateway fandom for many viewers.',
    categorySlug: 'anime',
    contributors: people([
      ['OLM', 'Animation studio'],
      ['TV Tokyo', 'Original broadcaster'],
      ['The Pokemon Company', 'Franchise owner'],
    ]),
    description: 'A Japanese anime series following trainers, creatures and an evolving adventure franchise.',
    details: {
      creators: ['The Pokemon Company', 'Satoshi Tajiri', 'Ken Sugimori'],
      formats: ['TV anime', 'Films', 'Specials'],
      origin: 'Japan',
      platforms: ['TV Tokyo'],
      sourceNotes: 'Public references identify the TV anime as premiering on TV Tokyo in April 1997 with animation by OLM.',
      studios: ['OLM'],
      websiteUrl: 'https://www.pokemon.co.jp/tv_movie/anime/',
      yearLabel: '1997-present',
    },
    externalLinks: [
      link('Official Pokemon anime site', 'https://www.pokemon.co.jp/tv_movie/anime/', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Pok%C3%A9mon_(TV_series)'),
      link('Bulbapedia', 'https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_TV_anime'),
    ],
    imageUrl: categoryImage.anime,
    imageUrls: [categoryImage.anime],
    popularity: 95,
    relatedSlugs: ['doraemon', 'my-neighbor-totoro'],
    releaseYear: 1997,
    slug: 'pokemon',
    status: 'published',
    tags: ['anime', 'adventure', 'family'],
    title: 'Pokemon',
    type: 'anime',
  },
  {
    body: 'Doraemon follows a robotic cat from the future who helps Nobita with gadgets that often create comic, heartfelt lessons.',
    categorySlug: 'anime',
    contributors: people([
      ['Fujiko F. Fujio', 'Creator'],
      ['Shogakukan', 'Original manga publisher'],
    ]),
    description: 'A Japanese manga and anime classic centered on Doraemon, Nobita and futuristic gadgets.',
    details: {
      creators: ['Fujiko F. Fujio'],
      formats: ['Manga', 'Anime series', 'Animated films'],
      origin: 'Japan',
      publisher: 'Shogakukan',
      sourceNotes: 'References identify Doraemon as created by Fujiko F. Fujio and first published in 1969/1970 depending on publication framing.',
      yearLabel: '1969/1970-present',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Doraemon'),
      link('AP obituary context', 'https://apnews.com/article/bc30a07500453c78a854339ba1d49667'),
    ],
    imageUrl: categoryImage.anime,
    imageUrls: [categoryImage.anime],
    popularity: 90,
    relatedSlugs: ['pokemon', 'my-neighbor-totoro'],
    releaseYear: 1970,
    slug: 'doraemon',
    status: 'published',
    tags: ['anime', 'manga', 'family'],
    title: 'Doraemon',
    type: 'anime',
  },
  {
    body: 'My Neighbor Totoro is a gentle Studio Ghibli fantasy about childhood, rural Japan, family anxiety and encounters with forest spirits.',
    categorySlug: 'anime',
    contributors: people([
      ['Hayao Miyazaki', 'Writer-director'],
      ['Studio Ghibli', 'Animation studio'],
      ['Joe Hisaishi', 'Composer'],
    ]),
    description: 'Hayao Miyazaki and Studio Ghibli’s 1988 animated fantasy film.',
    details: {
      country: 'Japan',
      creators: ['Hayao Miyazaki'],
      director: 'Hayao Miyazaki',
      formats: ['Animated feature film'],
      genres: ['Fantasy', 'Family'],
      origin: 'Japan',
      runtimeMinutes: 86,
      studios: ['Studio Ghibli'],
      yearLabel: '1988',
    },
    externalLinks: [
      link('Studio Ghibli', 'https://www.ghibli.jp/works/totoro/', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/My_Neighbor_Totoro'),
    ],
    imageUrl: categoryImage.anime,
    imageUrls: [categoryImage.anime],
    popularity: 92,
    relatedSlugs: ['pokemon', 'doraemon'],
    releaseYear: 1988,
    slug: 'my-neighbor-totoro',
    status: 'published',
    tags: ['anime', 'ghibli', 'film'],
    title: 'My Neighbor Totoro',
    type: 'anime',
  },
  {
    body: 'Minecraft is a sandbox game about exploration, survival, construction and player-made worlds. Its flexible rules make it a strong hub for fan creativity.',
    categorySlug: 'gaming',
    contributors: people([
      ['Mojang Studios', 'Developer'],
      ['Markus Persson', 'Original creator'],
      ['Microsoft', 'Current owner'],
    ]),
    description: 'A sandbox game built around blocks, survival, building and creative play.',
    details: {
      creators: ['Markus Persson'],
      formats: ['Video game'],
      genres: ['Sandbox', 'Survival', 'Creative'],
      platforms: ['PC', 'Console', 'Mobile'],
      publisher: 'Mojang Studios / Microsoft',
      sourceNotes: 'Microsoft and Xbox references identify Mojang Studios as Minecraft developer and Microsoft as the current owner.',
      websiteUrl: 'https://www.minecraft.net/',
      yearLabel: '2009 public alpha / 2011 full release',
    },
    externalLinks: [
      link('Official Minecraft', 'https://www.minecraft.net/', 'official'),
      link('Xbox fact sheet', 'https://xboxwire.thesourcemediaassets.com/sites/2/2021/04/Minecraft-Franchise-Fact-Sheet_Oct.-2021.pdf'),
      link('Microsoft acquisition announcement', 'https://news.microsoft.com/2014/09/15/minecraft-to-join-microsoft/'),
    ],
    imageUrl: categoryImage.gaming,
    imageUrls: [categoryImage.gaming],
    popularity: 98,
    relatedSlugs: ['stardew-valley', 'animal-crossing', 'modest-minecraft-inspired-cosplay'],
    releaseYear: 2011,
    slug: 'minecraft',
    status: 'published',
    tags: ['gaming', 'sandbox', 'creative'],
    title: 'Minecraft',
    type: 'game',
  },
  {
    body: 'Stardew Valley is a farming and life simulation game about restoring a farm, meeting villagers, mining, fishing and building a slower rhythm of play.',
    categorySlug: 'gaming',
    contributors: people([
      ['Eric Barone / ConcernedApe', 'Creator and developer'],
    ]),
    description: 'A cozy farming and community simulation created by ConcernedApe.',
    details: {
      creators: ['Eric Barone'],
      formats: ['Video game'],
      genres: ['Farming sim', 'Life sim', 'Role-playing'],
      platforms: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox', 'iOS', 'Android'],
      publisher: 'ConcernedApe',
      sourceNotes: 'The official wiki identifies the first PC release date as February 26, 2016.',
      websiteUrl: 'https://www.stardewvalley.net/',
      yearLabel: '2016',
    },
    externalLinks: [
      link('Official Stardew Valley', 'https://www.stardewvalley.net/', 'official'),
      link('Official wiki', 'https://wiki.stardewvalley.net/Stardew_Valley'),
      link('Version history', 'https://wiki.stardewvalley.net/Version_history'),
    ],
    imageUrl: categoryImage.gaming,
    imageUrls: [categoryImage.gaming],
    popularity: 88,
    relatedSlugs: ['minecraft', 'animal-crossing'],
    releaseYear: 2016,
    slug: 'stardew-valley',
    status: 'published',
    tags: ['gaming', 'cozy', 'farming'],
    title: 'Stardew Valley',
    type: 'game',
  },
  {
    body: 'Animal Crossing is a social simulation series built around daily routines, real-time village life and gentle customization.',
    categorySlug: 'gaming',
    contributors: people([
      ['Nintendo', 'Developer and publisher'],
      ['Katsuya Eguchi', 'Series creator'],
      ['Hisashi Nogami', 'Series creator'],
    ]),
    description: 'Nintendo’s social simulation series about village life, friends and daily rituals.',
    details: {
      creators: ['Katsuya Eguchi', 'Hisashi Nogami'],
      formats: ['Video game series'],
      genres: ['Social simulation', 'Life simulation'],
      platforms: ['Nintendo 64', 'GameCube', 'Nintendo DS', 'Wii', 'Nintendo 3DS', 'Nintendo Switch'],
      publisher: 'Nintendo',
      sourceNotes: 'Nookipedia and public references identify the series as created by Katsuya Eguchi and Hisashi Nogami and developed/published by Nintendo.',
      websiteUrl: 'https://animal-crossing.com/',
      yearLabel: '2001-present',
    },
    externalLinks: [
      link('Official Animal Crossing', 'https://animal-crossing.com/', 'official'),
      link('Nookipedia', 'https://nookipedia.com/wiki/Animal_Crossing_(series)'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Animal_Crossing'),
    ],
    imageUrl: categoryImage.gaming,
    imageUrls: [categoryImage.gaming],
    popularity: 86,
    relatedSlugs: ['minecraft', 'stardew-valley', 'modest-animal-crossing-inspired-cozy-villager-cosplay'],
    releaseYear: 2001,
    slug: 'animal-crossing',
    status: 'published',
    tags: ['gaming', 'cozy', 'nintendo'],
    title: 'Animal Crossing',
    type: 'game',
  },
  {
    body: 'Winnie the Pooh is a 2011 Walt Disney Animation Studios feature that returns to a hand-drawn Hundred Acre Wood adventure.',
    categorySlug: 'movies',
    contributors: people([
      ['Stephen Anderson', 'Director'],
      ['Don Hall', 'Director'],
      ['Jim Cummings', 'Voice cast', 'Winnie the Pooh / Tigger'],
      ['Craig Ferguson', 'Voice cast', 'Owl'],
      ['John Cleese', 'Voice cast', 'Narrator'],
    ]),
    description: 'The 2011 American animated musical comedy film from Walt Disney Animation Studios.',
    details: {
      country: 'United States',
      director: 'Stephen Anderson, Don Hall',
      distributor: 'Walt Disney Studios Motion Pictures',
      genres: ['Animation', 'Family', 'Musical comedy'],
      languages: ['English'],
      runtimeMinutes: 63,
      studios: ['Walt Disney Animation Studios'],
      yearLabel: '2011',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Winnie_the_Pooh_(2011_film)'),
      link('IMDb', 'https://www.imdb.com/title/tt1449283/'),
    ],
    imageUrl: categoryImage.movies,
    imageUrls: [categoryImage.movies],
    popularity: 77,
    relatedSlugs: ['little-forest-2018', 'taare-zameen-par'],
    releaseYear: 2011,
    slug: 'winnie-the-pooh-2011',
    status: 'published',
    tags: ['movie', 'animation', 'disney'],
    title: 'Winnie the Pooh',
    type: 'movie',
  },
  {
    body: 'Little Forest follows Hye-won as she returns to her rural home and rediscovers seasonal cooking, friendship and rest.',
    categorySlug: 'movies',
    contributors: people([
      ['Yim Soon-rye', 'Director'],
      ['Kim Tae-ri', 'Cast', 'Hye-won'],
      ['Ryu Jun-yeol', 'Cast', 'Jae-ha'],
      ['Jin Ki-joo', 'Cast', 'Eun-sook'],
      ['Moon So-ri', 'Cast', 'Mother'],
    ]),
    description: 'A 2018 South Korean drama film directed by Yim Soon-rye.',
    details: {
      country: 'South Korea',
      director: 'Yim Soon-rye',
      genres: ['Drama', 'Slice of life'],
      languages: ['Korean'],
      runtimeMinutes: 103,
      sourceNotes: 'Korean Film Council and public references identify Little Forest as a 2018 South Korean film directed by Yim Soon-rye.',
      yearLabel: '2018',
    },
    externalLinks: [
      link('Korean Film Council', 'https://www.koreanfilm.or.kr/eng/films/index/filmsView.jsp?movieCd=20170841', 'official database'),
      link('AsianWiki', 'https://asianwiki.com/Little_Forest_(Korean_Movie)'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Little_Forest_(film)'),
    ],
    imageUrl: categoryImage.movies,
    imageUrls: [categoryImage.movies],
    popularity: 81,
    relatedSlugs: ['winnie-the-pooh-2011', 'taare-zameen-par'],
    releaseYear: 2018,
    slug: 'little-forest-2018',
    status: 'published',
    tags: ['movie', 'korean-film', 'slice-of-life'],
    title: 'Little Forest',
    type: 'movie',
  },
  {
    body: 'Taare Zameen Par centers on Ishaan, an imaginative child misunderstood at school, and the teacher who recognizes his learning differences and artistic gifts.',
    categorySlug: 'movies',
    contributors: people([
      ['Aamir Khan', 'Director / Cast', 'Ram Shankar Nikumbh'],
      ['Darsheel Safary', 'Cast', 'Ishaan Awasthi'],
      ['Tisca Chopra', 'Cast', 'Maya Awasthi'],
      ['Vipin Sharma', 'Cast', 'Nandkishore Awasthi'],
    ]),
    description: 'A 2007 Indian Hindi-language drama film directed by Aamir Khan.',
    details: {
      country: 'India',
      director: 'Aamir Khan',
      genres: ['Drama', 'Family'],
      languages: ['Hindi'],
      runtimeMinutes: 165,
      sourceNotes: 'Public references identify the film internationally as Like Stars on Earth.',
      yearLabel: '2007',
    },
    externalLinks: [
      link('IMDb', 'https://www.imdb.com/title/tt0986264/'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Taare_Zameen_Par'),
    ],
    imageUrl: categoryImage.movies,
    imageUrls: [categoryImage.movies],
    popularity: 84,
    relatedSlugs: ['winnie-the-pooh-2011', 'little-forest-2018'],
    releaseYear: 2007,
    slug: 'taare-zameen-par',
    status: 'published',
    tags: ['movie', 'india', 'drama'],
    title: 'Taare Zameen Par',
    type: 'movie',
  },
  {
    body: 'Zanjeerain is prepared as a Pakistani TV drama record using currently available public listings. Verify broadcaster metadata before live import execution.',
    categorySlug: 'tv-shows',
    contributors: people([
      ['Shahzad Kashmiri', 'Director'],
      ['Sajal Ali', 'Cast'],
      ['Ameer Gilani', 'Cast'],
      ['Danyal Zafar', 'Cast'],
    ]),
    description: 'A Pakistani television drama series record prepared from public listings.',
    details: {
      country: 'Pakistan',
      director: 'Shahzad Kashmiri',
      formats: ['Television drama'],
      sourceNotes: 'Limited public metadata was available during preparation; IMDb and entertainment listings show a 2026 Pakistani TV series with listed cast/director.',
      yearLabel: '2026',
    },
    externalLinks: [
      link('IMDb', 'https://www.imdb.com/title/tt42211778/'),
      link('WeGreen listing', 'https://wegreenkw.com/entertainment/zanjeerein/cast/'),
    ],
    imageUrl: categoryImage['tv-shows'],
    imageUrls: [categoryImage['tv-shows']],
    popularity: 60,
    relatedSlugs: ['pororo-the-little-penguin', 'taarak-mehta-ka-ooltah-chashmah'],
    releaseYear: 2026,
    slug: 'zanjeerain',
    status: 'published',
    tags: ['tv', 'pakistan', 'drama'],
    title: 'Zanjeerain',
    type: 'tv-show',
  },
  {
    body: 'Pororo the Little Penguin is a South Korean children’s animated series about Pororo and friends in a snowy village.',
    categorySlug: 'tv-shows',
    contributors: people([
      ['Iconix Entertainment', 'Production company'],
      ['Ocon Animation Studios', 'Production company'],
      ['EBS', 'Original broadcaster'],
      ['Choi Jong-il', 'Creator'],
    ]),
    description: 'A South Korean 3D animated children’s television series.',
    details: {
      country: 'South Korea',
      formats: ['Animated TV series'],
      genres: ['Children', 'Comedy', 'Adventure'],
      languages: ['Korean'],
      runtimeMinutes: 11,
      studios: ['Iconix Entertainment', 'Ocon Animation Studios'],
      yearLabel: '2003-present',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Pororo_the_Little_Penguin'),
      link('KBS World profile', 'https://world.kbs.co.kr/service/contents_view.htm?board_seq=276743&id=&lang=e&menu_cate=business'),
      link('Iconix history', 'https://www.iconix.co.kr/en/company/history.php', 'official'),
    ],
    imageUrl: categoryImage['tv-shows'],
    imageUrls: [categoryImage['tv-shows']],
    popularity: 78,
    relatedSlugs: ['zanjeerain', 'taarak-mehta-ka-ooltah-chashmah'],
    releaseYear: 2003,
    slug: 'pororo-the-little-penguin',
    status: 'published',
    tags: ['tv', 'animation', 'korea'],
    title: 'Pororo',
    type: 'tv-show',
  },
  {
    body: 'Taarak Mehta Ka Ooltah Chashmah is an Indian sitcom centered on Gokuldham Society and everyday community comedy.',
    categorySlug: 'tv-shows',
    contributors: people([
      ['Asit Kumarr Modi', 'Creator / producer'],
      ['Dilip Joshi', 'Cast', 'Jethalal Champaklal Gada'],
      ['Disha Vakani', 'Cast', 'Daya Jethalal Gada'],
      ['Amit Bhatt', 'Cast', 'Champaklal Gada'],
    ]),
    description: 'A long-running Indian Hindi-language sitcom.',
    details: {
      country: 'India',
      creators: ['Asit Kumarr Modi'],
      formats: ['Sitcom'],
      languages: ['Hindi'],
      runtimeMinutes: 22,
      sourceNotes: 'Public references identify the show as beginning in 2008 and based on Taarak Mehta’s Duniya Ne Undha Chashma column.',
      yearLabel: '2008-present',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Taarak_Mehta_Ka_Ooltah_Chashmah'),
      link('Official site', 'https://www.tmkoc.com/', 'official'),
    ],
    imageUrl: categoryImage['tv-shows'],
    imageUrls: [categoryImage['tv-shows']],
    popularity: 83,
    relatedSlugs: ['zanjeerain', 'pororo-the-little-penguin'],
    releaseYear: 2008,
    slug: 'taarak-mehta-ka-ooltah-chashmah',
    status: 'published',
    tags: ['tv', 'india', 'sitcom'],
    title: 'Taarak Mehta Ka Ooltah Chashmah',
    type: 'tv-show',
  },
  {
    body: 'BTS is a seven-member South Korean group whose music and fandom helped push K-Pop into a larger global mainstream.',
    categorySlug: 'k-pop',
    contributors: people([
      ['RM', 'Member'],
      ['Jin', 'Member'],
      ['SUGA', 'Member'],
      ['j-hope', 'Member'],
      ['Jimin', 'Member'],
      ['V', 'Member'],
      ['Jung Kook', 'Member'],
    ]),
    description: 'A seven-member South Korean group formed by Big Hit Entertainment.',
    details: {
      country: 'South Korea',
      creators: ['Big Hit Entertainment'],
      formats: ['Music group'],
      genres: ['K-Pop', 'Hip hop', 'Pop'],
      origin: 'Seoul, South Korea',
      yearLabel: '2013-present',
    },
    externalLinks: [
      link('Official BTS', 'https://ibighit.com/bts/eng/', 'official'),
      link('AP overview', 'https://apnews.com/article/a0fd2487c9859805f50a891b7f2b93a0'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/BTS'),
    ],
    imageUrl: categoryImage['k-pop'],
    imageUrls: [categoryImage['k-pop']],
    popularity: 98,
    relatedSlugs: ['blackpink', 'twice'],
    releaseYear: 2013,
    slug: 'bts',
    status: 'published',
    tags: ['k-pop', 'music', 'south-korea'],
    title: 'BTS',
    type: 'k-pop',
  },
  {
    body: 'BLACKPINK is a four-member South Korean girl group known for global pop releases, performance styling and large-scale tours.',
    categorySlug: 'k-pop',
    contributors: people([
      ['Jisoo', 'Member'],
      ['Jennie', 'Member'],
      ['Rosé', 'Member'],
      ['Lisa', 'Member'],
    ]),
    description: 'A South Korean girl group formed by YG Entertainment.',
    details: {
      country: 'South Korea',
      creators: ['YG Entertainment'],
      formats: ['Music group'],
      genres: ['K-Pop', 'Pop', 'Hip hop'],
      origin: 'Seoul, South Korea',
      yearLabel: '2016-present',
    },
    externalLinks: [
      link('YG profile', 'https://www.ygfamily.com/en/artists/blackpink/profile', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Blackpink'),
    ],
    imageUrl: categoryImage['k-pop'],
    imageUrls: [categoryImage['k-pop']],
    popularity: 94,
    relatedSlugs: ['bts', 'twice'],
    releaseYear: 2016,
    slug: 'blackpink',
    status: 'published',
    tags: ['k-pop', 'music', 'south-korea'],
    title: 'BLACKPINK',
    type: 'k-pop',
  },
  {
    body: 'TWICE is a nine-member South Korean girl group formed by JYP Entertainment, known for bright pop hooks and strong fan engagement.',
    categorySlug: 'k-pop',
    contributors: people([
      ['Nayeon', 'Member'],
      ['Jeongyeon', 'Member'],
      ['Momo', 'Member'],
      ['Sana', 'Member'],
      ['Jihyo', 'Member'],
      ['Mina', 'Member'],
      ['Dahyun', 'Member'],
      ['Chaeyoung', 'Member'],
      ['Tzuyu', 'Member'],
    ]),
    description: 'A nine-member South Korean girl group formed by JYP Entertainment.',
    details: {
      country: 'South Korea',
      creators: ['JYP Entertainment'],
      formats: ['Music group'],
      genres: ['K-Pop', 'Dance-pop'],
      origin: 'Seoul, South Korea',
      yearLabel: '2015-present',
    },
    externalLinks: [
      link('Official TWICE', 'https://twice.jype.com/', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Twice'),
    ],
    imageUrl: categoryImage['k-pop'],
    imageUrls: [categoryImage['k-pop']],
    popularity: 89,
    relatedSlugs: ['bts', 'blackpink'],
    releaseYear: 2015,
    slug: 'twice',
    status: 'published',
    tags: ['k-pop', 'music', 'south-korea'],
    title: 'TWICE',
    type: 'k-pop',
  },
  {
    body: 'The Adventures of Tintin follows a young reporter and his dog Snowy through globe-spanning mystery-adventures.',
    categorySlug: 'comics',
    contributors: people([
      ['Hergé', 'Creator'],
      ['Casterman', 'Publisher'],
    ]),
    description: 'The Belgian comic album series created by Hergé.',
    details: {
      country: 'Belgium',
      creators: ['Hergé'],
      formats: ['Comic albums'],
      genres: ['Adventure', 'Mystery'],
      publisher: 'Casterman',
      yearLabel: '1929-1986',
    },
    externalLinks: [
      link('Official Tintin', 'https://www.tintin.com/en/herge', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/The_Adventures_of_Tintin'),
    ],
    imageUrl: categoryImage.comics,
    imageUrls: [categoryImage.comics],
    popularity: 86,
    relatedSlugs: ['asterix', 'peanuts'],
    releaseYear: 1929,
    slug: 'tintin',
    status: 'published',
    tags: ['comics', 'belgium', 'classic'],
    title: 'Tintin',
    type: 'comic',
  },
  {
    body: 'Asterix is a French comic series about an indomitable Gaul village resisting Roman occupation with wit, wordplay and slapstick adventure.',
    categorySlug: 'comics',
    contributors: people([
      ['René Goscinny', 'Writer / co-creator'],
      ['Albert Uderzo', 'Artist / co-creator'],
    ]),
    description: 'The French comic album series created by René Goscinny and Albert Uderzo.',
    details: {
      country: 'France',
      creators: ['René Goscinny', 'Albert Uderzo'],
      formats: ['Comic albums'],
      genres: ['Comedy', 'Adventure'],
      publisher: 'Dargaud / Hachette / Les Éditions Albert René',
      yearLabel: '1959-present',
    },
    externalLinks: [
      link('Official Asterix', 'https://asterix.com/en/albums/the-comics/asterix-the-gaul/', 'official'),
      link('Institut René Goscinny', 'https://www.institut-goscinny.org/bibliographie/asterix-le-gaulois/'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Asterix'),
    ],
    imageUrl: categoryImage.comics,
    imageUrls: [categoryImage.comics],
    popularity: 84,
    relatedSlugs: ['tintin', 'peanuts'],
    releaseYear: 1959,
    slug: 'asterix',
    status: 'published',
    tags: ['comics', 'france', 'classic'],
    title: 'Asterix',
    type: 'comic',
  },
  {
    body: 'Peanuts is Charles M. Schulz’s influential American comic strip about Charlie Brown, Snoopy and a cast of philosophically funny children.',
    categorySlug: 'comics',
    contributors: people([
      ['Charles M. Schulz', 'Creator'],
      ['United Feature Syndicate', 'Original syndicate'],
    ]),
    description: 'The American comic strip created by Charles M. Schulz.',
    details: {
      country: 'United States',
      creators: ['Charles M. Schulz'],
      formats: ['Newspaper comic strip'],
      genres: ['Comedy', 'Slice of life'],
      publisher: 'United Feature Syndicate',
      yearLabel: '1950-2000 original run',
    },
    externalLinks: [
      link('Charles M. Schulz Museum timeline', 'https://schulzmuseum.org/timeline/', 'official'),
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Peanuts'),
    ],
    imageUrl: categoryImage.comics,
    imageUrls: [categoryImage.comics],
    popularity: 88,
    relatedSlugs: ['tintin', 'asterix'],
    releaseYear: 1950,
    slug: 'peanuts',
    status: 'published',
    tags: ['comics', 'comic-strip', 'classic'],
    title: 'Peanuts',
    type: 'comic',
  },
  {
    body: 'Yotsuba&! is a slice-of-life manga about Yotsuba Koiwai experiencing ordinary days with exuberant curiosity.',
    categorySlug: 'manga',
    contributors: people([
      ['Kiyohiko Azuma', 'Creator'],
      ['ASCII Media Works', 'Publisher'],
    ]),
    description: 'Kiyohiko Azuma’s ongoing slice-of-life manga series.',
    details: {
      country: 'Japan',
      creators: ['Kiyohiko Azuma'],
      formats: ['Manga'],
      genres: ['Slice of life', 'Comedy'],
      publisher: 'ASCII Media Works',
      yearLabel: '2003-present',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Yotsuba%26!'),
      link('EBSCO overview', 'https://www.ebsco.com/research-starters/literature-and-writing/yotsuba'),
    ],
    imageUrl: categoryImage.manga,
    imageUrls: [categoryImage.manga],
    popularity: 82,
    relatedSlugs: ['chis-sweet-home', 'barakamon'],
    releaseYear: 2003,
    slug: 'yotsuba-and',
    status: 'published',
    tags: ['manga', 'slice-of-life', 'japan'],
    title: 'Yotsuba&!',
    type: 'manga',
  },
  {
    body: 'Chi’s Sweet Home follows a kitten named Chi through small domestic adventures and everyday discoveries.',
    categorySlug: 'manga',
    contributors: people([
      ['Konami Kanata', 'Creator'],
      ['Kodansha', 'Publisher'],
    ]),
    description: 'Konami Kanata’s cat-centered slice-of-life manga.',
    details: {
      country: 'Japan',
      creators: ['Konami Kanata'],
      formats: ['Manga'],
      genres: ['Slice of life', 'Comedy'],
      publisher: 'Kodansha',
      yearLabel: '2004-2015',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Chi%27s_Sweet_Home'),
    ],
    imageUrl: categoryImage.manga,
    imageUrls: [categoryImage.manga],
    popularity: 76,
    relatedSlugs: ['yotsuba-and', 'barakamon'],
    releaseYear: 2004,
    slug: 'chis-sweet-home',
    status: 'published',
    tags: ['manga', 'cats', 'slice-of-life'],
    title: "Chi's Sweet Home",
    type: 'manga',
  },
  {
    body: 'Barakamon follows calligrapher Seishu Handa as island life and local friendships reshape his art and his sense of self.',
    categorySlug: 'manga',
    contributors: people([
      ['Satsuki Yoshino', 'Creator'],
      ['Square Enix', 'Publisher'],
    ]),
    description: 'Satsuki Yoshino’s manga about calligraphy, community and rural island life.',
    details: {
      country: 'Japan',
      creators: ['Satsuki Yoshino'],
      formats: ['Manga'],
      genres: ['Slice of life', 'Comedy'],
      publisher: 'Square Enix',
      yearLabel: '2008-2018',
    },
    externalLinks: [
      link('Wikipedia', 'https://en.wikipedia.org/wiki/Barakamon'),
    ],
    imageUrl: categoryImage.manga,
    imageUrls: [categoryImage.manga],
    popularity: 79,
    relatedSlugs: ['yotsuba-and', 'chis-sweet-home'],
    releaseYear: 2008,
    slug: 'barakamon',
    status: 'published',
    tags: ['manga', 'slice-of-life', 'calligraphy'],
    title: 'Barakamon',
    type: 'manga',
  },
  {
    body: 'A modest Minecraft-inspired cosplay concept using layered earth-tone clothing, block-pattern accessories and a crafted tool prop while keeping the silhouette comfortable and covered.',
    categorySlug: 'cosplay',
    contributors: people([
      ['Fan Hub Plus', 'Original concept'],
    ]),
    description: 'A modest, block-world styling concept inspired by Minecraft.',
    details: {
      availability: 'Original Fan Hub Plus concept, not an official costume.',
      colors: ['grass green', 'soil brown', 'stone gray'],
      formats: ['Cosplay concept'],
      materials: ['Long tunic or jacket', 'Straight-leg trousers', 'Foam or cardboard block accessories', 'Comfortable boots'],
      sourceNotes: 'Concept references Minecraft as inspiration and should avoid official logo use unless licensed.',
      yearLabel: 'Original concept',
    },
    externalLinks: [
      link('Official Minecraft', 'https://www.minecraft.net/', 'official inspiration'),
    ],
    imageUrl: categoryImage.cosplay,
    imageUrls: [categoryImage.cosplay],
    popularity: 70,
    relatedSlugs: ['minecraft', 'modest-pokemon-inspired-cosplay'],
    slug: 'modest-minecraft-inspired-cosplay',
    status: 'published',
    tags: ['cosplay', 'modest', 'gaming'],
    title: 'Modest Minecraft-inspired cosplay',
    type: 'cosplay',
  },
  {
    body: 'A modest Pokemon-inspired cosplay concept using a trainer-style jacket, cap, long skirt or trousers, and small themed accessories without copying a specific protected costume exactly.',
    categorySlug: 'cosplay',
    contributors: people([
      ['Fan Hub Plus', 'Original concept'],
    ]),
    description: 'A modest trainer-inspired cosplay concept for Pokemon fans.',
    details: {
      availability: 'Original Fan Hub Plus concept, not an official costume.',
      colors: ['red', 'cream', 'navy', 'yellow accent'],
      formats: ['Cosplay concept'],
      materials: ['Long jacket', 'Cap or scarf', 'Layered top', 'Trousers or long skirt', 'Small themed bag charm'],
      sourceNotes: 'Concept references Pokemon as inspiration and should avoid official logo use unless licensed.',
      yearLabel: 'Original concept',
    },
    externalLinks: [
      link('Official Pokemon', 'https://www.pokemon.com/', 'official inspiration'),
    ],
    imageUrl: categoryImage.cosplay,
    imageUrls: [categoryImage.cosplay],
    popularity: 72,
    relatedSlugs: ['pokemon', 'modest-minecraft-inspired-cosplay'],
    slug: 'modest-pokemon-inspired-cosplay',
    status: 'published',
    tags: ['cosplay', 'modest', 'anime'],
    title: 'Modest Pokemon-inspired cosplay',
    type: 'cosplay',
  },
  {
    body: 'A modest Animal Crossing-inspired cozy villager cosplay using soft layers, a cardigan, roomy trousers or long skirt, leaf motifs and a handmade satchel.',
    categorySlug: 'cosplay',
    contributors: people([
      ['Fan Hub Plus', 'Original concept'],
    ]),
    description: 'A modest cozy villager concept inspired by Animal Crossing.',
    details: {
      availability: 'Original Fan Hub Plus concept, not an official costume.',
      colors: ['sky blue', 'leaf green', 'warm beige'],
      formats: ['Cosplay concept'],
      materials: ['Cardigan', 'Layered shirt', 'Long skirt or relaxed trousers', 'Leaf applique', 'Canvas satchel'],
      sourceNotes: 'Concept references Animal Crossing as inspiration and should avoid official logo use unless licensed.',
      yearLabel: 'Original concept',
    },
    externalLinks: [
      link('Official Animal Crossing', 'https://animal-crossing.com/', 'official inspiration'),
    ],
    imageUrl: categoryImage.cosplay,
    imageUrls: [categoryImage.cosplay],
    popularity: 74,
    relatedSlugs: ['animal-crossing', 'modest-minecraft-inspired-cosplay'],
    slug: 'modest-animal-crossing-inspired-cozy-villager-cosplay',
    status: 'published',
    tags: ['cosplay', 'modest', 'cozy'],
    title: 'Modest Animal Crossing-inspired cozy villager cosplay',
    type: 'cosplay',
  },
]

function duplicates(values) {
  const seen = new Set()
  const dupes = new Set()
  for (const value of values) {
    if (seen.has(value)) dupes.add(value)
    seen.add(value)
  }
  return [...dupes]
}

function validateSeeds() {
  const categorySlugs = CATEGORIES.map((category) => category.slug)
  const contentSlugs = CONTENT.map((content) => content.slug)
  const errors = []

  const duplicateCategorySlugs = duplicates(categorySlugs)
  const duplicateContentSlugs = duplicates(contentSlugs)
  if (duplicateCategorySlugs.length) errors.push(`Duplicate category slugs: ${duplicateCategorySlugs.join(', ')}`)
  if (duplicateContentSlugs.length) errors.push(`Duplicate content slugs: ${duplicateContentSlugs.join(', ')}`)

  const categorySet = new Set(categorySlugs)
  const contentSet = new Set(contentSlugs)
  const missingCategories = CONTENT.filter((content) => !categorySet.has(content.categorySlug)).map((content) => content.slug)
  if (missingCategories.length) errors.push(`Content with unknown categories: ${missingCategories.join(', ')}`)

  for (const content of CONTENT) {
    for (const relatedSlug of content.relatedSlugs || []) {
      if (!contentSet.has(relatedSlug)) {
        errors.push(`${content.slug} has unresolved related slug ${relatedSlug}`)
      }
    }
  }

  const counts = CONTENT.reduce((acc, content) => {
    acc[content.categorySlug] = (acc[content.categorySlug] || 0) + 1
    return acc
  }, {})

  for (const category of CATEGORIES) {
    if (counts[category.slug] !== 3) {
      errors.push(`${category.slug} has ${counts[category.slug] || 0} records; expected 3`)
    }
  }

  return { counts, errors }
}

function toContentDocument(seed) {
  const { relatedSlugs, ...content } = seed
  return content
}

async function executeImport() {
  const existingCategories = await Category.find({ slug: { $in: CATEGORIES.map((item) => item.slug) } }).lean()
  const existingContents = await Content.find({ slug: { $in: CONTENT.map((item) => item.slug) } }).lean()

  if (!ALLOW_UPDATES && (existingCategories.length || existingContents.length)) {
    console.log(JSON.stringify({
      conflictReport: {
        existingCategorySlugs: existingCategories.map((item) => item.slug),
        existingContentSlugs: existingContents.map((item) => item.slug),
      },
      message: 'Existing slugs found. Re-run with --allow-updates only after reviewing conflicts.',
    }, null, 2))
    process.exitCode = 1
    return
  }

  for (const category of CATEGORIES) {
    await Category.findOneAndUpdate(
      { slug: category.slug },
      ALLOW_UPDATES ? { $set: category } : { $setOnInsert: category },
      { new: true, upsert: true },
    )
  }

  for (const seed of CONTENT) {
    await Content.findOneAndUpdate(
      { slug: seed.slug },
      ALLOW_UPDATES ? { $set: toContentDocument(seed) } : { $setOnInsert: toContentDocument(seed) },
      { new: true, upsert: true, runValidators: true },
    )
  }

  const inserted = await Content.find({ slug: { $in: CONTENT.map((item) => item.slug) } }).select('_id slug').lean()
  const idBySlug = new Map(inserted.map((item) => [item.slug, item._id]))

  for (const seed of CONTENT) {
    const relatedContent = (seed.relatedSlugs || []).map((slug) => idBySlug.get(slug)).filter(Boolean)
    await Content.updateOne({ slug: seed.slug }, { $set: { relatedContent } })
  }
}

async function main() {
  const validation = validateSeeds()
  const report = {
    approvedWriteMode: SHOULD_EXECUTE,
    categoryCount: CATEGORIES.length,
    contentCount: CONTENT.length,
    importOrder: ['categories', 'contents', 'content.relatedContent references'],
    perCategoryCounts: validation.counts,
    proposedRecords: CONTENT.map((content) => ({
      categorySlug: content.categorySlug,
      slug: content.slug,
      status: content.status,
      title: content.title,
      type: content.type,
    })),
    validationErrors: validation.errors,
    writeGuard: 'No database writes unless both --execute and --i-understand-this-writes-to-fanhubplus are supplied.',
  }

  console.log(JSON.stringify(report, null, 2))

  if (validation.errors.length) {
    process.exitCode = 1
    return
  }

  if (CHECK_LIVE_CONFLICTS && !SHOULD_EXECUTE) {
    await connectDB()
    const existingCategories = await Category.find({ slug: { $in: CATEGORIES.map((item) => item.slug) } })
      .select('_id name slug status')
      .lean()
    const existingContents = await Content.find({ slug: { $in: CONTENT.map((item) => item.slug) } })
      .select('_id title slug categorySlug status')
      .lean()
    const titleConflicts = await Content.find({ title: { $in: CONTENT.map((item) => item.title) } })
      .select('_id title slug categorySlug status')
      .lean()
    await mongoose.connection.close()

    console.log(JSON.stringify({
      liveConflictReport: {
        existingCategorySlugs: existingCategories,
        existingContentSlugs: existingContents,
        existingContentTitles: titleConflicts,
      },
      mode: 'read-only',
      writesPerformed: false,
    }, null, 2))
    return
  }

  if (!SHOULD_EXECUTE) return

  await connectDB()
  await executeImport()
  await mongoose.connection.close()
}

main().catch(async (error) => {
  console.error(error)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
  }
  process.exit(1)
})
