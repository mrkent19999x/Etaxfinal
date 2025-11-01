#!/usr/bin/env node

// UI Clone Progress Tracker
const fs = require("fs");
const path = require("path");

class UICloneTracker {
  constructor() {
    this.progressFile = path.join(process.cwd(), "ui-clone-progress.json");
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.progressFile)) {
        this.data = JSON.parse(fs.readFileSync(this.progressFile, "utf8"));
      } else {
        this.data = {
          project: "Mobile App UI Clone",
          started: new Date().toISOString(),
          screens: {},
        };
        this.save();
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      this.data = {
        project: "Mobile App UI Clone",
        started: new Date().toISOString(),
        screens: {},
      };
    }
  }

  save() {
    try {
      fs.writeFileSync(
        this.progressFile,
        JSON.stringify(this.data, null, 2),
        "utf8"
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }

  updateScreen(screenName, components) {
    this.data.screens[screenName] = {
      components,
      lastUpdated: new Date().toISOString(),
      overall: this.calculateOverall(components),
    };
    this.save();
    return this.data.screens[screenName];
  }

  calculateOverall(components) {
    const values = Object.values(components).map((c) =>
      typeof c === "object" ? c.similarity : parseFloat(c)
    );
    if (values.length === 0) return "0.00";
    const sum = values.reduce((a, b) => a + parseFloat(b), 0);
    return (sum / values.length).toFixed(2);
  }

  generateReport() {
    const screens = Object.entries(this.data.screens);
    const totalScreens = screens.length;

    if (totalScreens === 0) {
      return `
╔════════════════════════════════════════════════════════╗
║          UI CLONE PROGRESS DASHBOARD                   ║
╠════════════════════════════════════════════════════════╣
║ No screens tracked yet.                                ║
║ Use: node tools/ui-clone-tracker.js update <screen>    ║
╚════════════════════════════════════════════════════════╝
`;
    }

    const completedScreens = screens.filter(
      ([_, s]) => parseFloat(s.overall) >= 99
    ).length;

    const overallProgress =
      screens.reduce((sum, [_, s]) => sum + parseFloat(s.overall), 0) /
      totalScreens;

    let report = `
╔════════════════════════════════════════════════════════╗
║          UI CLONE PROGRESS DASHBOARD                   ║
╠════════════════════════════════════════════════════════╣
║ Project: ${this.data.project.padEnd(43)}║
║ Started: ${new Date(this.data.started).toLocaleDateString().padEnd(42)}║
║                                                         ║
║ Overall Progress: ${overallProgress.toFixed(2).padStart(6)}%                                    ║
║ Completed Screens: ${completedScreens}/${totalScreens}                                    ║
╠════════════════════════════════════════════════════════╣
`;

    screens.forEach(([screenName, screen]) => {
      const status =
        parseFloat(screen.overall) >= 99
          ? "✅"
          : parseFloat(screen.overall) >= 95
          ? "⚠️"
          : "❌";

      report += `\n${status} ${screenName} - ${screen.overall}%\n`;

      Object.entries(screen.components || {}).forEach(([compName, comp]) => {
        const similarity =
          typeof comp === "object" ? comp.similarity : parseFloat(comp);
        const compStatus =
          similarity >= 99 ? "  ✓" : similarity >= 95 ? "  ~" : "  ✗";
        const issues =
          typeof comp === "object" && comp.issues
            ? ` (${comp.issues.join(", ")})`
            : "";
        report += `${compStatus} ${compName}: ${similarity}%${issues}\n`;
      });
    });

    report += `\n╚════════════════════════════════════════════════════════╝\n`;

    return report;
  }

  getNextTask() {
    const screens = Object.entries(this.data.screens);

    // Find screen with lowest completion
    for (const [screenName, screen] of screens) {
      if (parseFloat(screen.overall) < 99) {
        // Find component with lowest similarity
        const components = Object.entries(screen.components || {})
          .map(([name, comp]) => ({
            name,
            similarity:
              typeof comp === "object"
                ? comp.similarity
                : parseFloat(comp),
            issues: typeof comp === "object" ? comp.issues || [] : [],
          }))
          .sort((a, b) => a.similarity - b.similarity);

        if (components.length > 0) {
          const [compName, comp] = components[0];
          return {
            screen: screenName,
            component: compName,
            currentSimilarity: comp.similarity,
            issues: comp.issues,
          };
        }
      }
    }

    return null;
  }

  updateComponent(screenName, componentName, similarity, issues = []) {
    if (!this.data.screens[screenName]) {
      this.data.screens[screenName] = {
        components: {},
        lastUpdated: new Date().toISOString(),
        overall: "0.00",
      };
    }

    this.data.screens[screenName].components[componentName] = {
      similarity: parseFloat(similarity),
      issues,
      updated: new Date().toISOString(),
    };

    // Recalculate overall
    this.data.screens[screenName].overall = this.calculateOverall(
      this.data.screens[screenName].components
    );
    this.data.screens[screenName].lastUpdated = new Date().toISOString();

    this.save();
    return this.data.screens[screenName];
  }
}

// CLI usage
if (require.main === module) {
  const tracker = new UICloneTracker();
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "report") {
    console.log(tracker.generateReport());
    const nextTask = tracker.getNextTask();
    if (nextTask) {
      console.log(`\n🎯 Next Task: Fix ${nextTask.component} in ${nextTask.screen}`);
      console.log(`Current: ${nextTask.currentSimilarity}%`);
      if (nextTask.issues.length > 0) {
        console.log(`Issues: ${nextTask.issues.join(", ")}`);
      }
    }
  } else if (command === "update") {
    const screenName = args[1];
    const componentName = args[2];
    const similarity = parseFloat(args[3]) || 0;
    const issues = args.slice(4) || [];

    if (!screenName || !componentName) {
      console.error("Usage: node tools/ui-clone-tracker.js update <screen> <component> <similarity> [issues...]");
      process.exit(1);
    }

    tracker.updateComponent(screenName, componentName, similarity, issues);
    console.log(`✅ Updated ${screenName}.${componentName}: ${similarity}%`);
  } else if (command === "update-screen") {
    const screenName = args[1];
    if (!screenName) {
      console.error("Usage: node tools/ui-clone-tracker.js update-screen <screen> <components_json>");
      process.exit(1);
    }

    try {
      const components = JSON.parse(args.slice(2).join(" ") || "{}");
      tracker.updateScreen(screenName, components);
      console.log(`✅ Updated screen: ${screenName}`);
    } catch (error) {
      console.error("Error parsing components JSON:", error.message);
      process.exit(1);
    }
  } else if (command === "next") {
    const nextTask = tracker.getNextTask();
    if (nextTask) {
      console.log(JSON.stringify(nextTask, null, 2));
    } else {
      console.log("✅ All screens completed!");
    }
  } else {
    console.log(`
UI Clone Progress Tracker

Usage:
  node tools/ui-clone-tracker.js report              - Show dashboard
  node tools/ui-clone-tracker.js update <screen> <component> <similarity> [issues...]  - Update component
  node tools/ui-clone-tracker.js update-screen <screen> <json>  - Update entire screen
  node tools/ui-clone-tracker.js next                - Get next task

Examples:
  node tools/ui-clone-tracker.js update Profile Header 98.5 "spacing issue"
  node tools/ui-clone-tracker.js report
`);
  }
}

module.exports = UICloneTracker;

