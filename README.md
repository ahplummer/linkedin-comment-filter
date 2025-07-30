# LinkedIn Comment Filter Chrome Extension

A Chrome extension that filters out pre-canned congratulatory comments on LinkedIn, helping you see only meaningful, personalized comments on posts.

## Features

- **Smart Filtering**: Hides generic comments, names, job titles, and emoji-only responses
- **One-Click Toggle**: Click the toolbar icon to instantly enable/disable filtering
- **Visual State Indicators**: Blue icon (enabled) vs Gray icon (disabled) with tooltips
- **Complete Comment Hiding**: Removes entire comment including profile pics, names, and text
- **Starts Disabled**: User controls when filtering begins - no automatic filtering
- **Real-time Processing**: Filters comments as they load, including dynamically loaded content
- **Non-destructive**: Comments are only hidden, not deleted - they can be shown again anytime

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The LinkedIn Comment Filter extension should now appear in your extensions list

### Usage

1. Navigate to any LinkedIn post with comments
2. The extension starts **disabled** (gray icon) - no filtering occurs initially
3. **Click the toolbar icon** to enable filtering - icon turns blue and comments are filtered
4. **Click again** to disable filtering - icon turns gray and all comments are shown
5. **Hover over the icon** to see current status and instructions
6. **Right-click the icon** or use Chrome's extension menu to see detailed status popup

#### What Gets Filtered

The extension hides comments that match:

**Pre-canned Congratulatory Phrases:**
- "Congrats!", "Congratulations!"
- "Well done!", "Great job!", "Nice work!"
- "Amazing!", "Awesome!", "Fantastic!"
- "Way to go!", "Outstanding!", "Brilliant!"

**Personalized Congratulations:**
- "Congrats Kirk!", "Well done Sarah!", "Great job Alex!"
- Any congratulatory phrase followed by 1-2 names

**Standalone Elements:**
- Person names only: "John Smith", "Sarah"
- Job titles only: "CEO", "Director", "Engineer"
- Single emoji responses: 👏, 🎉, 💪, 🔥, 👍, ❤️, 💯

**Complete Comment Removal:**
When a comment is filtered, the **entire comment block disappears** including:
- Profile picture and name
- Job title and connection status
- Comment text and timestamp
- Like/Reply buttons

Comments with meaningful content beyond these patterns will remain visible.

## Files Structure

```
linkedin-comment-purge/
├── manifest.json         # Extension configuration and permissions
├── popup.html           # Status popup interface (right-click access)
├── popup.js             # Popup status display
├── content.js           # Main filtering logic for LinkedIn pages
├── background.js        # Handles toolbar icon clicks and state management
├── icon.svg            # Source SVG icon design
├── icon16.png          # 16x16 enabled state icon
├── icon32.png          # 32x32 enabled state icon  
├── icon48.png          # 48x48 enabled state icon
├── icon128.png         # 128x128 enabled state icon
├── icon16_disabled.png  # 16x16 disabled state icon
├── icon32_disabled.png  # 32x32 disabled state icon
├── icon48_disabled.png  # 48x48 disabled state icon
├── icon128_disabled.png # 128x128 disabled state icon
└── README.md           # This file
```

## Development

### Prerequisites

- Google Chrome browser
- Basic knowledge of JavaScript and Chrome Extension APIs

### Key Components

- **manifest.json**: Defines extension permissions and structure (no popup for direct icon clicks)
- **popup.html/js**: Status display interface (accessible via right-click or extension menu)
- **content.js**: Main filtering logic that runs on LinkedIn pages and hides matching comments
- **background.js**: Handles toolbar icon clicks, state management, and icon updates
- **Icon system**: Dual-state icons (blue/gray) that provide visual feedback

### How It Works

1. **Toolbar Icon Click**: Direct toggle without popup - `chrome.action.onClicked` handler
2. **State Management**: Background script manages enabled/disabled state and updates icons
3. **Content Script**: Loads on LinkedIn pages and waits for user to enable filtering
4. **Pattern Matching**: Compares comment text against dictionaries of pre-canned phrases, names, and titles
5. **Complete Element Hiding**: Targets entire `<article>` elements to hide full comment blocks
6. **Dynamic Filtering**: Uses MutationObserver to filter new comments as they load
7. **Visual Feedback**: Icon color and tooltip reflect current state

### Permissions

This extension requires the following permissions:
- `activeTab`: To interact with the current LinkedIn tab
- `scripting`: To inject scripts into LinkedIn pages
- `storage`: To save user preferences and data
- `host_permissions`: Access to LinkedIn domains

## Security & Privacy

- This extension only operates on LinkedIn.com domains
- No personal data is transmitted to external servers
- All operations are performed locally in your browser

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on LinkedIn
5. Submit a pull request

## License

[Add your preferred license here]

## Disclaimer

This extension is for personal use to improve your LinkedIn browsing experience by filtering out generic comments. It does not modify, delete, or interact with LinkedIn's servers - it only changes what you see locally in your browser. Please ensure you comply with LinkedIn's Terms of Service when using this tool.

## Support

For issues, feature requests, or questions, please open an issue in the project repository.