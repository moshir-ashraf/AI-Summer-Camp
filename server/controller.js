const User = require("./model");
const Result = require("./result");

const jsonToObject = (json, role = "STUDENT") => new User(json, role);

const isAjaxRequest = (req) => req.headers.accept && req.headers.accept.includes('application/json');

const register = async (req, res) => {
  try {
    const userJSON = { name: req.body.userName || req.body.name };
    const user = jsonToObject(userJSON);
    const result = await user.create();
    
    if (result.success.status) {
      req.session.user = result.data;
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Registration successful',
          redirectUrl: '/lobby'
        });
      }
      return res.redirect("/lobby");
    } else if (result.data) {
      // User already exists, don't set error message in session
      if (isAjaxRequest(req)) {
        return res.status(409).json({
          success: false,
          message: result.message,
          userExists: true,
          userName: req.body.userName || req.body.name
        });
      }
      return res.redirect("/");
    }
    
    // Only set session message for actual errors (not "user exists")
    if (!result.message.includes('already exists')) {
      req.session.message = result.message;
    }
    
    if (isAjaxRequest(req)) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.redirect("/");
    
  } catch (error) {
    const errorMessage = `Error creating user: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const login = async (req, res) => {
  try {
    const result = await User.login(req.body.name, req.body.password);
    
    if (result.success.status) {
      const user = result.data;
      req.session.user = {
        _id: user._id,
        name: user.name,
        role: user.role,
        password: user.password, 
      };

      const redirectUrl = user.role === 'INSTRUCTOR' ? '/admin' : '/lobby';
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Login successful',
          redirectUrl
        });
      }
      return res.redirect(redirectUrl);
    }
    
    req.session.message = result.message;
    
    if (isAjaxRequest(req)) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    return res.redirect("/");
    
  } catch (error) {
    const errorMessage = `Error during login: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const logout = (req, res) => {
  req.session.user = undefined;
  res.redirect("/");
};

const loginAsStudent = async (req, res) => {
  try {
    const result = await User.get(req.body.name);
    
    if (result.success.status && result.data.role === 'STUDENT') {
      req.session.user = {
        _id: result.data._id,
        name: result.data.name,
        role: result.data.role,
        password: result.data.password
      };
      
      if (isAjaxRequest(req)) {
        return res.json({
          success: true,
          message: 'Welcome back!',
          redirectUrl: '/lobby'
        });
      }
      return res.redirect("/lobby");
    } else {
      const errorMessage = 'User not found or not a student';
      req.session.message = errorMessage;
      
      if (isAjaxRequest(req)) {
        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }
      return res.redirect("/");
    }
  } catch (error) {
    const errorMessage = `Error during student login: ${error.message}`;
    req.session.message = errorMessage;
    
    if (isAjaxRequest(req)) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect("/");
  }
};

const addUser = async (req, res) => {
  try {
    const userJSON = { name: req.body.name, password: req.body.password };
    const user = jsonToObject(userJSON);
    const result = await user.create();
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error creating user: ${error.message}`).toJSON());
  }
};

const getUser = async (req, res) => {
  try {
    const by = req.body.name == undefined ? "_id" : "name";
    const result = await User.get(req.body.name == undefined ? req.body._id : req.body.name, by);
    return result;
  } catch (error) {
    return new Result(-1, null, `Error fetching user: ${error.message}`);
  }
};

const removeAllUsers = async (req, res) => {
  try {
    const result = await User.removeAll();
    if (result.success.status) {
      req.session.users = [];
      return res.json(result.toJSON());
    }
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error removing users: ${error.message}`).toJSON());
  }
}

const getAllUsers = async (req, res) => {
  try {
    const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy) : { score: -1 };
    const result = await User.getAll(sortBy);
    return res.json(result.toJSON());
  } catch (error) {
    return res.json(new Result(-1, null, `Error getting all users: ${error.message}`).toJSON());
  }
}

const updateScore = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const { score, taskNumber } = req.body;
    const userId = req.session.user._id;

    // Update user's score and last completed task in database
    const result = await User.updateScore(userId, score, taskNumber);
    
    if (result.success.status) {
      // Update session data
      req.session.user.score = (req.session.user.score || 0) + score;
      if (taskNumber) {
        req.session.user.lastTaskCompleted = Math.max(req.session.user.lastTaskCompleted || 0, taskNumber);
      }

      return res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error updating score: ${error.message}`
    });
  }
}

module.exports = {
  _jsonToObject: jsonToObject,
  addUser,
  getUser,
  getAllUsers,
  register,
  login,
  loginAsStudent,
  logout,
  removeAllUsers,
  updateScore
};

