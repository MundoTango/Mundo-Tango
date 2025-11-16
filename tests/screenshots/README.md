# Visual Regression Test Baselines

This directory contains baseline screenshots for visual regression testing.

## Structure
- `baselines/` - Reference images for comparison
- `actual/` - Current test run screenshots
- `diffs/` - Difference images when tests fail

## Usage
Run visual tests: `npm test visual-regression`
Update baselines: Copy images from `actual/` to `baselines/` after visual review

## Note
Baseline images are created automatically on first test run.
