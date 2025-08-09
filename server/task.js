const Result = require("./result");
const crudInterface = require("./crud");
const jsonToObject = require("./mapper");

// Task model: handles creating, updating, deleting, and retrieving tasks from storage
class Task {

  static crudInterface = crudInterface;
  static jsonToObject = jsonToObject;
  static tableName = 'task';

  constructor(taskJSON) {
    Task.jsonToObject(this, taskJSON);
  }

  static async get(key, by = "id") {
    const result = await Task.crudInterface.get(Task.tableName, key, by);
    if (result.success.status) {
      result.data = new Task(result.data);
    }
    return result;
  }

  static async getAll(sortBy = null) {
    const result = await Task.crudInterface.getAll(Task.tableName, sortBy);
    if (result.success.status) {
      result.data = result.data.map(task => new Task(task));
    }
    return result;
  }

  static async getCurrent() {
    try {
      const result = await Task.crudInterface.getAll(Task.tableName, {created_at: -1});
      if (result.success.status && result.data.length > 0) {
        result.data = new Task(result.data[0]);
        return result;
      } else if (result.success.status && result.data.length === 0) {
        return new Result(0, null, "No tasks found");
      }
      return result;
    } catch (error) {
      return new Result(0, null, "Failed to get current task: " + error.message);
    }
  }

  static async create(mode) {
    if (!mode || (mode !== 'Python Recap' && mode !== 'Model Mimic' && mode !== 'Deep Learning')) {
      return new Result(0, null, "Invalid mode. Must be 'Python Recap', 'Model Mimic', or 'Deep Learning'");
    }

    try {
      await Task.removeAll();
      const taskData = { mode: mode };
      const result = await Task.crudInterface.create(Task.tableName, taskData);
      if (result.success.status) {
        result.data = new Task(result.data);
      }
      return result;
    } catch (error) {
      console.error('Error creating task:', error);
      return new Result(0, null, "Failed to create task");
    }
  }

  static async update(taskId, updateData) {
    const result = await Task.crudInterface.update(Task.tableName, taskId, updateData, 'id');
    if (result.success.status) {
      result.data = new Task(result.data);
    }
    return result;
  }

  static async setMode(mode) {
    if (!mode || (mode !== 'Python Recap' && mode !== 'Model Mimic' && mode !== 'Deep Learning')) {
      return new Result(0, null, "Invalid mode. Must be 'Python Recap', 'Model Mimic', or 'Deep Learning'");
    }

    try {
      return await Task.create(mode);
    } catch (error) {
      console.error('Error setting task mode:', error);
      return new Result(0, null, "Failed to set task mode");
    }
  }

  static async getCurrentMode() {
    try {
      const result = await Task.getCurrent();
      if (result.success.status) {
        return result.data.mode;
      }
      return null;
    } catch (error) {
      console.error('Error getting current mode:', error);
      return null;
    }
  }

  static async isPythonRecap() {
    const mode = await Task.getCurrentMode();
    return mode === 'Python Recap';
  }

  static async isModelMimic() {
    const mode = await Task.getCurrentMode();
    return mode === 'Model Mimic';
  }

  static async isDeepLearning() {
    const mode = await Task.getCurrentMode();
    return mode === 'Deep Learning';
  }

  static async delete(taskId) {
    return await Task.crudInterface.remove(Task.tableName, taskId, 'id');
  }

  static async removeAll() {
    return await Task.crudInterface.removeAllRecords(Task.tableName);
  }

  async save() {
    if (this.id) {
      return await Task.update(this.id, { mode: this.mode });
    } else {
      return await Task.create(this.mode);
    }
  }

  async remove() {
    if (this.id) {
      return await Task.delete(this.id);
    } else {
      return new Result(0, null, "Cannot delete task without ID");
    }
  }

  toJSON() {
    return {
      id: this.id,
      mode: this.mode,
      created_at: this.created_at
    };
  }
}

module.exports = Task;
