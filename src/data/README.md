# Content Data Files

This directory contains the external data files that drive the content displayed on the terminal website. This approach separates content from code, making it much easier to maintain and update your CV and other terminal content.

## Files

### `cv.json`
Contains your complete CV/resume data in structured JSON format:
- **Personal Information**: Name, title, about section
- **Experience**: Array of companies with positions, achievements, and skills
- **Core Skills**: List of your main technical competencies  
- **Contact**: Email, GitHub, LinkedIn links

### `terminal-content.json`
Contains the terminal interface content:
- **Welcome Messages**: Greeting and instruction text
- **Help Command**: Available commands and descriptions
- **File Listing**: Files shown by the `ls` command

## Usage

The content is loaded via the `content-loader.ts` utility which provides:
- Type-safe interfaces for all data structures
- Formatting functions that convert JSON data to terminal display format
- Easy access functions for the main TypeScript code

## Benefits

1. **Easy Updates**: Modify CV content without touching TypeScript code
2. **Version Control**: Track content changes separately from code changes
3. **Type Safety**: TypeScript interfaces ensure data structure consistency
4. **Maintainability**: Clear separation of concerns between content and functionality

## Updating Your CV

To update your CV, simply edit the `cv.json` file:
1. Add new positions to the experience array
2. Update skills, achievements, or contact information
3. The changes will automatically appear on the website after deployment

No code changes are required for content updates!
