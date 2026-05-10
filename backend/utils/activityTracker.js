// Simple in-memory activity tracker for immediate functionality
let activities = [];

const addActivity = (action, description, user, amount, entityType, entityId) => {
  const activity = {
    time: getTimeAgo(new Date()),
    action: description,
    amount: amount,
    user: user,
    createdAt: new Date()
  };
  
  activities.unshift(activity); // Add to beginning
  if (activities.length > 50) {
    activities = activities.slice(0, 50); // Keep only last 50 activities
  }
  
  console.log('Activity added:', activity);
};

const getActivities = () => {
  return activities;
};

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

module.exports = {
  addActivity,
  getActivities
};
