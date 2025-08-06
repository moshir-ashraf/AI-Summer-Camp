const User = require("./user");
const Game = require("./game");
const Task = require("./task");

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
    
    // Get current task mode to determine routing
    const currentMode = await Task.getCurrentMode();
    let nextTask = (user.lastTaskCompleted || 0) + 1;
    let maxTasks = 1; // Default for Python Recap
    
    if (currentMode === 'Model Mimic') {
      maxTasks = 5; // Sequential tasks 1-5
      
      // In Model Mimic mode, check the game's current task (admin-controlled)
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          // Use the game's current task instead of user's progress
          nextTask = gameResult.data.currentQuestion || 1;
        }
      } catch (gameError) {
        console.error('Error getting game state for Model Mimic mode:', gameError);
        // Fallback to user progress if game state unavailable
        nextTask = (user.lastTaskCompleted || 0) + 1;
      }
    }
    
    // Check if user has completed all available tasks
    let taskCompleted = false;
    if (currentMode === 'Model Mimic') {
      // In Model Mimic mode, check if student has completed the current admin-controlled task
      taskCompleted = user.lastTaskCompleted >= nextTask;
      
      // Only redirect to final for Model Mimic mode when all tasks are completed
      if (user.lastTaskCompleted >= 5) {
        return res.redirect('/final');
      }
    }
    // Python Recap mode should never redirect to final - it's a repeatable real-time quiz
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask,
      currentMode: currentMode || 'Python Recap', // Default if no task set
      taskCompleted: taskCompleted
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    const user = req.session.user;
    let nextTask = (user.lastTaskCompleted || 0) + 1;
    
    // Even in error case, try to get current task for Model Mimic mode
    let currentMode = 'Python Recap'; // Default
    try {
      currentMode = await Task.getCurrentMode() || 'Python Recap';
      if (currentMode === 'Model Mimic') {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          nextTask = gameResult.data.currentQuestion || 1;
        }
      }
    } catch (fallbackError) {
      console.error('Error in fallback game state check:', fallbackError);
    }
    
    // Check if user has completed the current task
    let taskCompleted = false;
    if (currentMode === 'Model Mimic') {
      taskCompleted = user.lastTaskCompleted >= nextTask;
      
      // Only redirect to final for Model Mimic mode when all tasks are completed
      if (user.lastTaskCompleted >= 5) {
        return res.redirect('/final');
      }
    }
    // Python Recap mode should never redirect to final - it's a repeatable real-time quiz
    
    res.render('lobby', { 
      user: user,
      nextTask: nextTask,
      currentMode: currentMode, // Default fallback
      taskCompleted: taskCompleted
    });
  }
}

const renderAdmin = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'INSTRUCTOR') {
    return res.redirect('/');
  }
  
  try {
    // Get leaderboard data and current task mode
    const leaderboardResult = await User.getAll({score: -1});
    const students = leaderboardResult.success.status ? leaderboardResult.data : [];
    const currentMode = await Task.getCurrentMode();
    
    
    res.render('admin', { 
      user: req.session.user,
      students: students,
      currentMode: currentMode
    });
  } catch (error) {
    res.render('admin', { 
      user: req.session.user,
      students: [],
      currentMode: null
    });
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

const renderTask1Realtime = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  try {
    // Refresh user data from database to get latest score
    const userResult = await User.get(req.session.user._id, '_id');
    
    let user = req.session.user;
    if (userResult.success.status) {
      req.session.user.score = userResult.data.score;
      user = req.session.user;
    }
    
    res.render('task1-realtime', { user: user });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    // Fallback to session data
    const user = req.session.user;
    res.render('task1-realtime', { user: user });
  }
}

const handleDefaultRoute = (req, res) => {
  if (req.session.user) {
    return res.redirect('/lobby');
  }
  res.redirect('/');
}

// Individual task render functions for Model Mimic mode
const renderTask1 = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    const currentMode = await Task.getCurrentMode();
    
    // Only allow access if current mode is Model Mimic
    if (currentMode !== 'Model Mimic') {
      // If instructor, redirect to admin; if student, redirect to lobby
      if (req.session.user.role === 'INSTRUCTOR') {
        return res.redirect('/admin');
      }
      return res.redirect('/lobby');
    }

    // For students, check if they can access this specific task
    if (req.session.user.role === 'STUDENT') {
      // Refresh user data to get latest progress
      const userResult = await User.get(req.session.user._id, '_id');
      let user = req.session.user;
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }

      // Check if student has already completed this task
      if (user.lastTaskCompleted >= 1) {
        // Student has already completed this task, redirect to lobby
        return res.redirect('/lobby');
      }

      // Check if this is the current admin-controlled task
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          const currentTask = gameResult.data.currentQuestion || 1;
          if (currentTask !== 1) {
            // Admin is on a different task, redirect to lobby
            return res.redirect('/lobby');
          }
        }
      } catch (gameError) {
        console.error('Error checking game state:', gameError);
      }
    }

    // Refresh user data to get latest progress (only for students)
    let user = req.session.user;
    if (req.session.user.role === 'STUDENT') {
      const userResult = await User.get(req.session.user._id, '_id');
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }
    }

    res.render('task1-recap', { 
      user: user,
      taskNumber: 1,
      currentMode: currentMode
    });
  } catch (error) {
    console.error('Error in renderTask1:', error);
    if (req.session.user.role === 'INSTRUCTOR') {
      return res.redirect('/admin');
    }
    return res.redirect('/lobby');
  }
};

const renderTask2 = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    const currentMode = await Task.getCurrentMode();
    
    // Only allow access if current mode is Model Mimic
    if (currentMode !== 'Model Mimic') {
      // If instructor, redirect to admin; if student, redirect to lobby
      if (req.session.user.role === 'INSTRUCTOR') {
        return res.redirect('/admin');
      }
      return res.redirect('/lobby');
    }

    // For students, check if they can access this specific task
    if (req.session.user.role === 'STUDENT') {
      // Refresh user data to get latest progress
      const userResult = await User.get(req.session.user._id, '_id');
      let user = req.session.user;
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }

      // Check if student has already completed this task
      if (user.lastTaskCompleted >= 2) {
        // Student has already completed this task, redirect to lobby
        return res.redirect('/lobby');
      }

      // Check if this is the current admin-controlled task
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          const currentTask = gameResult.data.currentQuestion || 1;
          if (currentTask !== 2) {
            // Admin is on a different task, redirect to lobby
            return res.redirect('/lobby');
          }
        }
      } catch (gameError) {
        console.error('Error checking game state:', gameError);
      }
    }

    // Refresh user data to get latest progress (only for students)
    let user = req.session.user;
    if (req.session.user.role === 'STUDENT') {
      const userResult = await User.get(req.session.user._id, '_id');
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }
    }

    res.render('task2-recap', { 
      user: user,
      taskNumber: 2,
      currentMode: currentMode
    });
  } catch (error) {
    console.error('Error in renderTask2:', error);
    if (req.session.user.role === 'INSTRUCTOR') {
      return res.redirect('/admin');
    }
    return res.redirect('/lobby');
  }
};

const renderTask3 = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    const currentMode = await Task.getCurrentMode();
    
    // Only allow access if current mode is Model Mimic
    if (currentMode !== 'Model Mimic') {
      // If instructor, redirect to admin; if student, redirect to lobby
      if (req.session.user.role === 'INSTRUCTOR') {
        return res.redirect('/admin');
      }
      return res.redirect('/lobby');
    }

    // For students, check if they can access this specific task
    if (req.session.user.role === 'STUDENT') {
      // Refresh user data to get latest progress
      const userResult = await User.get(req.session.user._id, '_id');
      let user = req.session.user;
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }

      // Check if student has already completed this task
      if (user.lastTaskCompleted >= 3) {
        // Student has already completed this task, redirect to lobby
        return res.redirect('/lobby');
      }

      // Check if this is the current admin-controlled task
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          const currentTask = gameResult.data.currentQuestion || 1;
          if (currentTask !== 3) {
            // Admin is on a different task, redirect to lobby
            return res.redirect('/lobby');
          }
        }
      } catch (gameError) {
        console.error('Error checking game state:', gameError);
      }
    }

    // Refresh user data to get latest progress (only for students)
    let user = req.session.user;
    if (req.session.user.role === 'STUDENT') {
      const userResult = await User.get(req.session.user._id, '_id');
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }
    }

    res.render('task3-recap', { 
      user: user,
      taskNumber: 3,
      currentMode: currentMode
    });
  } catch (error) {
    console.error('Error in renderTask3:', error);
    if (req.session.user.role === 'INSTRUCTOR') {
      return res.redirect('/admin');
    }
    return res.redirect('/lobby');
  }
};

const renderTask4 = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    const currentMode = await Task.getCurrentMode();
    
    // Only allow access if current mode is Model Mimic
    if (currentMode !== 'Model Mimic') {
      // If instructor, redirect to admin; if student, redirect to lobby
      if (req.session.user.role === 'INSTRUCTOR') {
        return res.redirect('/admin');
      }
      return res.redirect('/lobby');
    }

    // For students, check if they can access this specific task
    if (req.session.user.role === 'STUDENT') {
      // Refresh user data to get latest progress
      const userResult = await User.get(req.session.user._id, '_id');
      let user = req.session.user;
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }

      // Check if student has already completed this task
      if (user.lastTaskCompleted >= 4) {
        // Student has already completed this task, redirect to lobby
        return res.redirect('/lobby');
      }

      // Check if this is the current admin-controlled task
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          const currentTask = gameResult.data.currentQuestion || 1;
          if (currentTask !== 4) {
            // Admin is on a different task, redirect to lobby
            return res.redirect('/lobby');
          }
        }
      } catch (gameError) {
        console.error('Error checking game state:', gameError);
      }
    }

    // Refresh user data to get latest progress (only for students)
    let user = req.session.user;
    if (req.session.user.role === 'STUDENT') {
      const userResult = await User.get(req.session.user._id, '_id');
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }
    }

    res.render('task4-recap', { 
      user: user,
      taskNumber: 4,
      currentMode: currentMode
    });
  } catch (error) {
    console.error('Error in renderTask4:', error);
    if (req.session.user.role === 'INSTRUCTOR') {
      return res.redirect('/admin');
    }
    return res.redirect('/lobby');
  }
};

const renderTask5 = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }

  try {
    const currentMode = await Task.getCurrentMode();
    
    // Only allow access if current mode is Model Mimic
    if (currentMode !== 'Model Mimic') {
      // If instructor, redirect to admin; if student, redirect to lobby
      if (req.session.user.role === 'INSTRUCTOR') {
        return res.redirect('/admin');
      }
      return res.redirect('/lobby');
    }

    // For students, check if they can access this specific task
    if (req.session.user.role === 'STUDENT') {
      // Refresh user data to get latest progress
      const userResult = await User.get(req.session.user._id, '_id');
      let user = req.session.user;
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }

      // Check if student has already completed this task
      if (user.lastTaskCompleted >= 5) {
        // Student has already completed this task, redirect to lobby
        return res.redirect('/lobby');
      }

      // Check if this is the current admin-controlled task
      try {
        const gameResult = await Game.getCurrentGame();
        if (gameResult.success.status && gameResult.data) {
          const currentTask = gameResult.data.currentQuestion || 1;
          if (currentTask !== 5) {
            // Admin is on a different task, redirect to lobby
            return res.redirect('/lobby');
          }
        }
      } catch (gameError) {
        console.error('Error checking game state:', gameError);
      }
    }

    // Refresh user data to get latest progress (only for students)
    let user = req.session.user;
    if (req.session.user.role === 'STUDENT') {
      const userResult = await User.get(req.session.user._id, '_id');
      if (userResult.success.status) {
        req.session.user.lastTaskCompleted = userResult.data.lastTaskCompleted;
        req.session.user.score = userResult.data.score;
        user = req.session.user;
      }
    }

    res.render('task5-recap', { 
      user: user,
      taskNumber: 5,
      currentMode: currentMode
    });
  } catch (error) {
    console.error('Error in renderTask5:', error);
    if (req.session.user.role === 'INSTRUCTOR') {
      return res.redirect('/admin');
    }
    return res.redirect('/lobby');
  }
};

module.exports = {
  renderIntro,
  renderLobby,
  renderAdmin,
  renderTask1Realtime,
  renderTask1,
  renderTask2,
  renderTask3,
  renderTask4,
  renderTask5,
  renderFinal,
  handleDefaultRoute
};