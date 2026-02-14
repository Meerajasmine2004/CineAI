import User from '../models/User.js';

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    
    // Find user by ID (from auth middleware)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    // Save updated user
    await user.save();
    
    // Return updated user without password
    const updatedUser = user.toJSON();
    
    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during profile update'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};
