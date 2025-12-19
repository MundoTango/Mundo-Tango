import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestPost } from './fixtures/test-data';
import { waitForApiResponse, verifyToast } from './helpers/test-helpers';

test.describe('Social Engagement Journey', () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Register and login
    testUser = generateTestUser();
    await page.request.post('/api/auth/register', {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      },
    });
    
    await page.goto('/login');
    await page.getByTestId('input-username').fill(testUser.username);
    await page.getByTestId('input-password').fill(testUser.password);
    await page.getByTestId('button-login').click();
    await page.waitForURL('**/feed');
  });

  test('should create a new post', async ({ page }) => {
    const post = generateTestPost();
    
    // Open create post form
    await page.getByTestId('textarea-create-post').fill(post.content);
    
    // Submit post
    const responsePromise = waitForApiResponse(page, '/api/posts');
    await page.getByTestId('button-create-post').click();
    await responsePromise;
    
    // Verify post appears in feed
    await expect(page.getByText(post.content)).toBeVisible();
  });

  test('should like a post', async ({ page }) => {
    // Create a post first
    const post = generateTestPost();
    await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    
    await page.reload();
    
    // Find and like the post
    const postCard = page.getByTestId('post-card').first();
    const likeButton = postCard.getByTestId('button-like-post');
    
    await likeButton.click();
    await page.waitForTimeout(500);
    
    // Verify like count increased
    await expect(likeButton).toHaveAttribute('data-liked', 'true');
  });

  test('should comment on a post', async ({ page }) => {
    // Create a post first
    const post = generateTestPost();
    const postResponse = await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    const postData = await postResponse.json();
    
    await page.reload();
    
    // Open comment section
    const postCard = page.getByTestId(`post-card-${postData.id}`);
    await postCard.getByTestId('button-comment').click();
    
    // Add comment
    const commentText = 'Great post! 💃';
    await page.getByTestId('input-comment').fill(commentText);
    await page.getByTestId('button-submit-comment').click();
    
    // Verify comment appears
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test('should use @mentions in comments', async ({ page }) => {
    // Create a post
    const post = generateTestPost();
    await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    
    await page.reload();
    
    // Open comment section
    const postCard = page.getByTestId('post-card').first();
    await postCard.getByTestId('button-comment').click();
    
    // Type @ to trigger autocomplete
    const commentInput = page.getByTestId('input-comment');
    await commentInput.fill('@');
    await commentInput.type('test');
    
    // Verify autocomplete appears
    await expect(page.getByTestId('mentions-autocomplete')).toBeVisible();
    
    // Select first user from autocomplete
    await page.getByTestId('mention-option').first().click();
    
    // Submit comment
    await page.getByTestId('button-submit-comment').click();
    
    // Verify mention is rendered
    await expect(page.getByTestId('mention-link')).toBeVisible();
  });

  test('should share a post', async ({ page }) => {
    // Create a post
    const post = generateTestPost();
    const postResponse = await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    const postData = await postResponse.json();
    
    await page.reload();
    
    // Open share dialog
    const postCard = page.getByTestId(`post-card-${postData.id}`);
    await postCard.getByTestId('button-share-post').click();
    
    // Verify share dialog
    await expect(page.getByTestId('dialog-share-post')).toBeVisible();
    
    // Share to community
    await page.getByTestId('button-share-community').click();
    
    // Verify success message
    await verifyToast(page, /shared successfully/i);
  });

  test('should bookmark a post', async ({ page }) => {
    // Create a post
    const post = generateTestPost();
    const postResponse = await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    const postData = await postResponse.json();
    
    await page.reload();
    
    // Bookmark the post
    const postCard = page.getByTestId(`post-card-${postData.id}`);
    await postCard.getByTestId('button-bookmark-post').click();
    
    await page.waitForTimeout(500);
    
    // Verify bookmark icon changed
    const bookmarkButton = postCard.getByTestId('button-bookmark-post');
    await expect(bookmarkButton).toHaveAttribute('data-bookmarked', 'true');
    
    // Navigate to saved posts
    await page.goto('/saved-posts');
    
    // Verify post appears in saved
    await expect(page.getByText(post.content)).toBeVisible();
  });

  test('should reply to a comment', async ({ page }) => {
    // Create post and comment
    const post = generateTestPost();
    const postResponse = await page.request.post('/api/posts', {
      data: { content: post.content },
    });
    const postData = await postResponse.json();
    
    const commentResponse = await page.request.post(`/api/posts/${postData.id}/comments`, {
      data: { content: 'Original comment' },
    });
    
    await page.reload();
    
    // Click reply on comment
    const comment = page.getByTestId('comment-card').first();
    await comment.getByTestId('button-reply-comment').click();
    
    // Add reply
    const replyText = 'This is a reply';
    await page.getByTestId('input-reply').fill(replyText);
    await page.getByTestId('button-submit-reply').click();
    
    // Verify reply appears nested
    await expect(page.getByText(replyText)).toBeVisible();
    await expect(page.getByTestId('reply-card')).toBeVisible();
  });
});
