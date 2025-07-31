// Content script for LinkedIn Comment Purge extension
console.log('LinkedIn Comment Purge content script loaded');

// Prevent multiple initialization
if (window.linkedinCommentFilterInitialized) {
  console.log('Content script already initialized');
} else {
  window.linkedinCommentFilterInitialized = true;

// Dictionary of pre-canned phrases to filter out
const preCannedPhrases = [
  'Congrats!',
  'Congratulations!',
  'Well done!',
  'Amazing!',
  'Awesome!',
  'Great job!',
  'Nice work!',
  'Fantastic!',
  'Well deserved!',
  'So proud!',
  'Way to go!',
  'Outstanding!',
  'Brilliant!',
  'Impressive!',
  'Wonderful!',
  'Excellent!',
  'Superb!',
  'Perfect!',
  'Incredible!',
  'Phenomenal!',
  '👏',
  '🎉',
  '💪',
  '🔥',
  '👍',
  '❤️',
  '💯'
];


let isFilteringEnabled = false;
let hiddenComments = [];

// Initialize but don't start filtering - wait for user to enable
initializeExtension();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleFilter') {
    toggleCommentFiltering();
    sendResponse({status: isFilteringEnabled ? 'enabled' : 'disabled'});
  } else if (request.action === 'getStatus') {
    sendResponse({
      status: isFilteringEnabled ? 'enabled' : 'disabled',
      hiddenCount: hiddenComments.length
    });
  }
});

function initializeExtension() {
  // Start with filtering disabled
  isFilteringEnabled = false;
  
  // Notify background script of initial disabled state
  chrome.runtime.sendMessage({action: 'updateIcon', status: 'disabled'});
  
  // Set up observer to handle dynamically loaded comments
  const observer = new MutationObserver((mutations) => {
    if (isFilteringEnabled) {
      let shouldFilter = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          shouldFilter = true;
        }
      });
      if (shouldFilter) {
        setTimeout(filterComments, 100);
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function filterComments() {
  // Target the main comment articles that contain everything
  const commentArticles = document.querySelectorAll('article.comments-comment-entity');
  
  console.log(`Found ${commentArticles.length} comment articles`);
  
  commentArticles.forEach(article => {
    // Find the actual comment text within the article
    const commentTextElement = article.querySelector('.comments-comment-item__main-content, .update-components-text');
    
    if (commentTextElement) {
      const commentText = commentTextElement.innerText || commentTextElement.textContent || '';
      
      if (isPrecannedComment(commentText.trim())) {
        hideComment(article); // Hide the entire article, not just the text
      }
    }
  });
  
  // Also check for other comment structures as fallback
  const otherCommentSelectors = [
    '.comments-comment-item',
    '.social-details-social-activity__comment'
  ];
  
  otherCommentSelectors.forEach(selector => {
    const comments = document.querySelectorAll(selector);
    comments.forEach(comment => {
      // Skip if this comment is already inside an article we've processed
      if (!comment.closest('article.comments-comment-entity')) {
        const commentText = comment.innerText || comment.textContent || '';
        
        if (isPrecannedComment(commentText.trim())) {
          hideComment(comment);
        }
      }
    });
  });
  
  console.log(`Hidden ${hiddenComments.length} pre-canned comments`);
}

function isPrecannedComment(commentText) {
  if (!commentText) return false;
  
  // Check for exact matches or comments that only contain pre-canned phrases
  const normalizedText = commentText.toLowerCase().trim();
  
  // Check for exact matches with pre-canned phrases
  for (const phrase of preCannedPhrases) {
    if (normalizedText === phrase.toLowerCase() || 
        normalizedText === phrase || 
        (phrase.length === 1 && normalizedText === phrase)) { // For emojis
      return true;
    }
  }
  
  
  // Check for simple name patterns (1-3 words that look like names)
  const words = normalizedText.split(/\s+/);
  if (words.length >= 1 && words.length <= 3) {
    // Check if it's just names (capitalized words, no common words)
    const isLikelyName = words.every(word => {
      const cleanWord = word.replace(/[!.,]$/, ''); // Remove trailing punctuation
      return /^[A-Za-z]+$/.test(cleanWord) && cleanWord.length >= 2;
    });
    
    if (isLikelyName) {
      // Additional check: avoid filtering common English words that might be names
      const commonWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 
                          'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 
                          'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 
                          'put', 'say', 'she', 'too', 'use'];
      const hasCommonWords = words.some(word => 
        commonWords.includes(word.toLowerCase().replace(/[!.,]$/, ''))
      );
      
      if (!hasCommonWords) {
        return true;
      }
    }
  }
  
  // Check for "Congrats [name]" pattern - starts with congrats followed by name/punctuation/emojis
  if (normalizedText.startsWith('congrats ') || normalizedText.startsWith('congratulations ')) {
    // Remove emojis and extra punctuation to get the core text
    const cleanText = normalizedText.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanWords = cleanText.split(' ');
    
    // If after cleaning it's just "congrats name" or "congratulations name lastname", filter it
    if (cleanWords.length >= 2 && cleanWords.length <= 4) {
      return true;
    }
  }
  
  // Check for other congratulatory patterns followed by names
  const congratsPatterns = [
    /^well done \w+!?$/,
    /^great job \w+!?$/,
    /^nice work \w+!?$/,
    /^way to go \w+!?$/,
    /^amazing \w+!?$/,
    /^awesome \w+!?$/
  ];
  
  for (const pattern of congratsPatterns) {
    if (pattern.test(normalizedText)) {
      return true;
    }
  }
  
  // Check for comments that are only emojis/short phrases (likely pre-canned)
  if (normalizedText.length <= 20) {
    for (const phrase of preCannedPhrases) {
      if (normalizedText.includes(phrase.toLowerCase())) {
        return true;
      }
    }
  }
  
  return false;
}

function hideComment(commentElement) {
  if (!hiddenComments.includes(commentElement)) {
    commentElement.style.display = 'none';
    hiddenComments.push(commentElement);
  }
}

function showComment(commentElement) {
  commentElement.style.display = '';
  const index = hiddenComments.indexOf(commentElement);
  if (index > -1) {
    hiddenComments.splice(index, 1);
  }
}

function toggleCommentFiltering() {
  isFilteringEnabled = !isFilteringEnabled;
  
  if (isFilteringEnabled) {
    filterComments();
  } else {
    // Show all hidden comments
    hiddenComments.forEach(comment => {
      comment.style.display = '';
    });
    hiddenComments = [];
  }
  
  // Notify background script of state change
  chrome.runtime.sendMessage({
    action: 'updateIcon', 
    status: isFilteringEnabled ? 'enabled' : 'disabled'
  });
}

} // End of initialization check