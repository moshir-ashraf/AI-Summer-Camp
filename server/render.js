const User = require("./user");

// Route handler functions
const renderIntro = (req, res) => {
  if (req.session.user) {
    return res.redirect('/lobby');
  }
  
  const message = req.session.message || null;
  req.session.message = null;
  res.render('intro', { message });
}

const renderLobby = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  if (req.session.user.role === 'INSTRUCTOR') {
    return res.redirect('/admin');
  }

  try {
    const userResult = await User.get(req.session.user._id, '_id');
    
    let user = req.session.user;
    if (userResult.success.status) {
      req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
      req.session.user.score = userResult.data.score;
      user = req.session.user;
    }
    
    const nextTask = (user.lastTaskCompleted || 0) + 1;
    
    if (user.lastTaskCompleted >= 1) {
      return res.redirect('/final');
    }
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    const user = req.session.user;
    const nextTask = (user.lastTaskCompleted || 0) + 1;
    
    if (user.lastTaskCompleted >= 1) {
      return res.redirect('/final');
    }
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask
    });
  }
}

const renderAdmin = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'INSTRUCTOR') {
    return res.redirect('/');
  }
  
  try {
    // Get leaderboard data
    const leaderboardResult = await User.getAll({score: -1});
    const students = leaderboardResult.success.status ? leaderboardResult.data : [];
    
    res.render('admin', { 
      user: req.session.user,
      students: students
    });
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    res.render('admin', { 
      user: req.session.user,
      students: []
    });
  }
}

const renderTask1 = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  const user = req.session.user;
  
  // Instructors have access to all tasks
  if (user.role === 'INSTRUCTOR') {
    return res.render('task1', { user: req.session.user });
  }
  
  const lastCompleted = user.lastTaskCompleted || 0;
  
  // Only allow task 1 if no tasks completed or task 1 already completed (allow replay of current task)
  if (lastCompleted >= 1) {
    // Already completed, allow access
    res.render('task1', { user: req.session.user });
  } else if (lastCompleted === 0) {
    // First task, allow access
    res.render('task1', { user: req.session.user });
  } else {
    // Shouldn't happen, but redirect to lobby
    return res.redirect('/lobby');
  }
}

const renderFinal = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  try {
    // Refresh user data from database to get latest score
    const userResult = await User.get(req.session.user._id, '_id');
    
    let user = req.session.user;
    if (userResult.success.status) {
      // Update session with fresh data
      req.session.user.score = userResult.data.score;
      user = req.session.user;
    }
    
    const lastCompleted = user.lastTaskCompleted || 0;
    
    // Only allow final page if task 1 is completed
    if (lastCompleted >= 1) {
      res.render('final', { user: user });
    } else {
      // Redirect to lobby if trying to access final page without completing task 1
      return res.redirect('/lobby');
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
    // Fallback to session data
    const user = req.session.user;
    const lastCompleted = user.lastTaskCompleted || 0;
    
    if (lastCompleted >= 1) {
      res.render('final', { user: user });
    } else {
      return res.redirect('/lobby');
    }
  }
}

const handleDefaultRoute = (req, res) => {
  if (req.session.user) {
    return res.redirect('/lobby');
  }
  res.redirect('/');
}

module.exports = {
  renderIntro,
  renderLobby,
  renderAdmin,
  renderTask1,
  renderFinal,
  handleDefaultRoute
};