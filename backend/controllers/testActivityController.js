const Activity = require('../models/Activity');

// @desc    Test Activity model
// @route   GET /api/test-activity
// @access  Private
exports.testActivity = async (req, res) => {
  try {
    console.log('Testing Activity model...');
    
    // Test basic Activity creation
    const testActivity = await Activity.create({
      action: 'product_created',
      description: 'Test activity',
      user: 'Test User',
      userId: req.user.id,
      amount: 'Test amount',
      entityType: 'Product',
      entityId: '507f1f77bcf86cd799439011'
    });
    
    console.log('Test activity created:', testActivity);
    
    // Test fetching activities
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName');
    
    console.log('Activities found:', activities.length);
    
    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Test activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: error.stack 
    });
  }
};
