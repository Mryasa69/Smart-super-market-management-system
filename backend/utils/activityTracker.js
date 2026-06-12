const Activity = require('../models/Activity');

// Helper function to format time ago
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " mins ago";
  }
  return Math.floor(seconds) + " secs ago";
};

/**
 * Log a new activity in the MongoDB collection
 */
const addActivity = async (action, description, user, userId, amount, entityType, entityId) => {
  try {
    const activity = await Activity.create({
      action,
      description,
      user,
      userId,
      amount,
      entityType,
      entityId
    });
    console.log('Activity logged to DB:', activity._id);
    return activity;
  } catch (error) {
    console.error('Error logging activity to DB:', error);
  }
};

/**
 * Fetch last 50 activities from the DB formatted for the dashboard UI
 */
const getActivities = async () => {
  try {
    const dbActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(50);
      
    return dbActivities.map(activity => ({
      action: activity.description, // Map description to action for frontend display compatibility
      time: getTimeAgo(activity.createdAt),
      user: activity.user,
      amount: activity.amount || ''
    }));
  } catch (error) {
    console.error('Error getting activities from DB:', error);
    return [];
  }
};

module.exports = {
  addActivity,
  getActivities
};
