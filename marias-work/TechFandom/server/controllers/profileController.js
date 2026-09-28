import User from '../models/User.js';

// ============================================
// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
// ============================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      favoriteFandoms,
      interests,
      displayPreferences,
      avatarUrl,
    } = req.body;

    if (name) user.name = name;
    if (favoriteFandoms) user.favoriteFandoms = favoriteFandoms;
    if (interests) user.interests = interests;
    if (displayPreferences) {
      user.displayPreferences = {
        ...user.displayPreferences,
        ...displayPreferences,
      };
    }
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    user.lastActive = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        favoriteFandoms: user.favoriteFandoms,
        interests: user.interests,
        displayPreferences: user.displayPreferences,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};