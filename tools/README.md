# UI Clone Tools

## 📊 Progress Tracker

The `ui-clone-tracker.js` tool helps track progress of UI cloning work.

### Usage

```bash
# Show dashboard
node tools/ui-clone-tracker.js report

# Update a component
node tools/ui-clone-tracker.js update Profile Header 98.5 "spacing issue"

# Update entire screen
node tools/ui-clone-tracker.js update-screen Profile '{"Header": {"similarity": 99.2}, "Avatar": {"similarity": 100}}'

# Get next task
node tools/ui-clone-tracker.js next
```

### Example

```bash
# Update progress
node tools/ui-clone-tracker.js update Profile Header 99.2 "minor spacing"
node tools/ui-clone-tracker.js update Profile Avatar 100

# View dashboard
node tools/ui-clone-tracker.js report
```

Output:
```
╔════════════════════════════════════════════════════════╗
║          UI CLONE PROGRESS DASHBOARD                   ║
╠════════════════════════════════════════════════════════╣
║ Overall Progress: 99.60%                               ║
║ Completed Screens: 1/1                                  ║
╠════════════════════════════════════════════════════════╣

✅ Profile - 99.60%
  ✓ Header: 99.2%
  ✓ Avatar: 100%
...
```

## 🎯 Integration with Hooks

The progress tracker integrates with:
- `afterFileEdit` hook: Auto-screenshot after UI changes
- `stop` hook: Auto-iterate if similarity < 99%

## 📁 Files

- `ui-clone-progress.json`: Progress data (auto-generated)
- `ui-clone-tracker.js`: CLI tool for managing progress

