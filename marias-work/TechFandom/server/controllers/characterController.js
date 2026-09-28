import Character from '../models/Character.js';

// GET /api/characters
export const getCharacters = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const query = { status: 'published' };

    if (category) query.categorySlug = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    let sortOption = { popularity: -1 };
    if (sort === 'latest') sortOption = { createdAt: -1 };
    if (sort === 'az') sortOption = { name: 1 };

    const characters = await Character.find(query).sort(sortOption);
    res.json({ characters, count: characters.length });
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/characters/:id
export const getCharacterById = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) return res.status(404).json({ message: 'Character not found' });

    character.views += 1;
    await character.save();

    res.json({ character });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/characters
export const createCharacter = async (req, res) => {
  try {
    const character = await Character.create(req.body);
    res.status(201).json({ message: 'Character created', character });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/characters/:id
export const updateCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json({ message: 'Character updated', character });
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/characters/:id
export const deleteCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json({ message: 'Character deleted' });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};