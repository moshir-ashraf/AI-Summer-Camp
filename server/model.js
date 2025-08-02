const Result = require("./result");
const crudInterface = require("./crud");
const jsonToObject = require("./mapper");


class User {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;

  constructor(userJSON, role = "STUDENT") {
    User.jsonToObject(this, userJSON, !userJSON.role ? {role: role }: null);
  }
  static async get(key, by="name") {
    const result = await User.crudInterface.get(key,  by);
    if (result.success.status) result.data =  new User(result.data, result.data.role);
    return result
  }
  static async getAll(sortBy=null) {
    const result = await User.crudInterface.getAllFilteredSorted('STUDENT', 'role', sortBy);
    if (result.success.status) result.data =  result.data.map(user => new User(user, user.role));
    return result
  }
  static async login(name, password) {
    const result = await User.get(name);
    if (!result.success.status) return result;
    if (password != null) {
      if (password !== result.data.password) {
        return new Result(0, null, "Incorrect name or Password.");
      }
    }
    return new Result(1, new User(result.data, result.data.role), "User Logged In Successfully.");
  }

   static async removeAll() {
    return await User.crudInterface.removeAll(this.role, "STUDENT");
  }

  static async updateScore(userId, scoreToAdd) {
    try {
      const result = await User.get(userId, '_id');
      if (!result.success.status) {
        return new Result(0, null, "User not found.");
      }

      const user = result.data;
      user.score = (user.score || 0) + scoreToAdd;

      // Update the user in database
      const updateResult = await User.crudInterface.update(userId, { score: user.score }, '_id');
      if (updateResult.success.status) {
        return new Result(1, updateResult.data, `Score updated: +${scoreToAdd} points. Total: ${user.score}`);
      } else {
        return new Result(0, null, "Failed to update score.");
      }
    } catch (error) {
      return new Result(-1, null, `Error updating score: ${error.message}`);
    }
  }

  async create() {
    const result = await User.crudInterface.create(this,  "name");
    if(result.success.status) result.data = User.jsonToObject(this, result.data)
    return result
  }


}

module.exports = User;
