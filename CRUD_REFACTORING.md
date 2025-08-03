# Generic CRUD System Refactoring

## Overview

The CRUD interface has been refactored to be generic and table-agnostic. This allows both User and GameState models to use the same underlying database operations while maintaining clean, consistent code.

## Key Changes Made

### 1. **Generic CRUD Interface** (`server/crud.js`)

The CRUD interface now accepts a `tableName` parameter for all operations:

```javascript
// Before (table-specific)
CRUDInterface.create(data, compareKey)

// After (generic)
CRUDInterface.create(tableName, data, compareKey)
```

**New Generic Methods:**
- `create(tableName, data, compareKey)`
- `get(tableName, primaryKey, compareKey)`
- `update(tableName, primaryKey, data, compareKey)`
- `removeAll(tableName, primaryKey, compareKey)`
- `getAllFilteredSorted(tableName, primaryKey, compareKey, sortBy)`
- `getAll(tableName, sortBy)` - *New helper method*
- `getById(tableName, id)` - *New helper method*

### 2. **Field Mapping System**

Automatic conversion between camelCase (JavaScript) and snake_case (PostgreSQL):

```javascript
const fieldMappings = {
  users: {
    camelToSnake: { lastTaskCompleted: 'last_task_completed' },
    snakeToCamel: { last_task_completed: 'lastTaskCompleted', ... }
  },
  game_state: {
    camelToSnake: { isPaused: 'is_paused', currentTask: 'current_task', ... },
    snakeToCamel: { is_paused: 'isPaused', current_task: 'currentTask', ... }
  }
}
```

### 3. **Model Updates**

#### **User Model** (`server/user.js` - renamed from `model.js`)

```javascript
class User {
  static tableName = 'users';
  static crudInterface = crudInterface;

  // Updated method calls
  static async get(key, by="name") {
    const result = await User.crudInterface.get(User.tableName, key, by);
    // ...
  }

  async create() {
    const result = await User.crudInterface.create(User.tableName, this, "name");
    // ...
  }
}
```

#### **GameState Model** (`server/gameState.js`)

```javascript
class GameState {
  static tableName = 'game_state';
  static crudInterface = crudInterface;

  // Uses generic CRUD operations
  static async pauseGame(instructorId) {
    const result = await GameState.crudInterface.update(
      GameState.tableName, 
      currentResult.data.id, 
      updateData, 
      'id'
    );
    // ...
  }
}
```

## Benefits

### ✅ **Code Reusability**
- Single CRUD implementation for all tables
- Consistent database operations across models

### ✅ **Maintainability**
- Database logic centralized in one place
- Easy to add new tables/models

### ✅ **Type Safety**
- Automatic field name conversion
- Consistent data formatting

### ✅ **Flexibility**
- Easy to extend with new operations
- Table-specific configurations supported

## Usage Examples

### Creating Records
```javascript
// User creation
const result = await User.crudInterface.create('users', userData, 'name');

// GameState creation  
const result = await GameState.crudInterface.create('game_state', stateData, 'id');
```

### Querying Records
```javascript
// Get user by name
const user = await User.crudInterface.get('users', 'john_doe', 'name');

// Get game state by ID
const state = await GameState.crudInterface.getById('game_state', gameId);

// Get all users sorted by score
const users = await User.crudInterface.getAll('users', { score: -1 });
```

### Updating Records
```javascript
// Update user score
const result = await User.crudInterface.update(
  'users', 
  userId, 
  { score: newScore, lastTaskCompleted: taskNum }, 
  '_id'
);

// Update game state
const result = await GameState.crudInterface.update(
  'game_state',
  stateId,
  { isPaused: true, pauseTime: new Date().toISOString() },
  'id'
);
```

## Field Name Conversion

The system automatically handles field name conversion:

| JavaScript (camelCase) | Database (snake_case) |
|------------------------|----------------------|
| `lastTaskCompleted`    | `last_task_completed` |
| `isPaused`             | `is_paused` |
| `currentTask`          | `current_task` |
| `startTime`            | `start_time` |
| `pauseTime`            | `pause_time` |
| `totalPauseDuration`   | `total_pause_duration` |
| `instructorId`         | `instructor_id` |
| `createdAt`            | `created_at` |
| `updatedAt`            | `updated_at` |

## Files Changed

1. **`server/crud.js`** - Completely refactored for generic table operations
2. **`server/model.js`** → **`server/user.js`** - Renamed and updated to use generic CRUD
3. **`server/gameState.js`** - Updated to use generic CRUD interface
4. **`server/controller.js`** - Updated import from `./model` to `./user`
5. **`server/render.js`** - Updated import from `./model` to `./user`

## Backward Compatibility

- All existing API endpoints work unchanged
- Session management remains the same
- User authentication and authorization preserved
- Database field mappings maintain `_id` for compatibility

The refactoring provides a clean, maintainable foundation for database operations while preserving all existing functionality.
