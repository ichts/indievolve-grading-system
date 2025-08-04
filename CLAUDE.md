# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a K12 AI-powered grading system (K12 AI智能阅卷系统) designed for Chinese high school teachers to grade subjective questions in Mathematics and English. The system is a frontend-only implementation using vanilla HTML, CSS, and JavaScript.

## Architecture

### Frontend Structure
The system follows a multi-page application architecture with separate HTML files for each major feature:

- **Dashboard**: `index.html` - Main dashboard with overview statistics and quick actions
- **Paper Management**: `papers-list.html`, `papers-create.html`, `papers-preview.html` - Test paper creation and management
- **Grading Center**: `grading-tasks.html`, `grading-upload.html`, `grading-workspace.html`, `grading-review.html` - AI grading workflow
- **Score Management**: Score viewing and analysis (referenced in navigation)
- **Learning Analytics**: Student performance analysis (referenced in navigation)
- **Class Management**: Student and class administration (referenced in navigation)
- **Settings**: System configuration (referenced in navigation)

### File Organization
```
/
├── index.html                 # Main dashboard (renamed from dashboard.html)
├── papers-*.html             # Paper management pages
├── grading-*.html            # Grading workflow pages
├── *.css                     # Corresponding stylesheets for each page
├── *.js                      # JavaScript functionality for interactive pages
└── product-design-docs/      # Comprehensive system design documentation
```

### Core Modules (from design docs)
1. **User Management** - Teacher accounts and permissions
2. **Paper Management** - Test creation with Math/English templates
3. **Answer Processing** - Student answer sheet digitization
4. **AI Grading Engine** - Automated scoring for subjective questions
5. **Score Management** - Grade statistics and analysis
6. **Learning Analytics** - Student performance insights
7. **Report Generation** - Automated analysis reports
8. **Error Analysis** - Wrong answer collection and analysis
9. **Data Dashboard** - Real-time system metrics
10. **System Settings** - Configuration and administration

## Development Commands

This is a static HTML/CSS/JavaScript project with no build system. Development is done by:

1. **Local Development**: Open HTML files directly in browser or use a simple HTTP server
2. **Testing**: Manual testing in browser (no automated test framework)
3. **Deployment**: Direct file deployment to web server

Common development workflow:
```bash
# Serve locally (if Python available)
python -m http.server 8000

# Or use any simple HTTP server
# Then navigate to http://localhost:8000
```

## Key Technologies

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: None (custom CSS with Font Awesome icons)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome 6.0.0
- **Responsive**: Custom CSS media queries

## Navigation Structure

The system uses a unified top navigation bar with 7 main modules:
1. 工作台 (Dashboard) - `/` or `/dashboard`
2. 试卷管理 (Paper Management) - `/papers`
3. 阅卷中心 (Grading Center) - `/grading`
4. 成绩管理 (Score Management) - `/scores`
5. 学情分析 (Learning Analytics) - `/analysis`
6. 班级管理 (Class Management) - `/classes`
7. 系统设置 (Settings) - `/settings`

## Design Principles

### User Experience
- **Simplified Interface**: Designed for teacher ease-of-use
- **Batch Operations**: Support for processing multiple answer sheets
- **Progress Tracking**: Real-time status updates for grading tasks
- **Mobile Responsive**: Adapts to tablet and mobile devices

### AI Grading Workflow
1. **Upload Phase**: Batch upload of scanned answer sheets
2. **Preprocessing**: Image quality check and student info recognition
3. **AI Analysis**: Subject-specific grading (Math formulas/English essays)
4. **Human Review**: Manual verification for low-confidence scores
5. **Results**: Final grades with detailed analysis

### Data Flow
- **Input**: Scanned answer sheet images
- **Processing**: OCR → AI Analysis → Scoring
- **Output**: Grades, analytics, and learning insights
- **Storage**: Local browser storage (no backend specified)

## Important Notes

- **Language**: Primary interface in Chinese (Simplified)
- **Target Users**: Chinese high school teachers
- **Subjects**: Mathematics and English subjective questions
- **No Backend**: Currently frontend-only implementation
- **No Package Manager**: No npm, webpack, or build tools
- **Static Assets**: Uses CDN for external libraries (Chart.js, Font Awesome)

## File Editing Guidelines

When modifying files:
- Maintain consistent Chinese/English mixed terminology as used in existing files
- Follow existing CSS naming conventions (kebab-case with descriptive names)
- Keep responsive design patterns consistent across pages
- Preserve Chart.js integration patterns from dashboard.js
- Maintain the color scheme and UI component consistency