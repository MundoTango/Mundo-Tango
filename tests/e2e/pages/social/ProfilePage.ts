/**
 * PROFILE PAGE OBJECT MODEL
 * Handles user profile viewing and editing
 */

import { Page, Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly editProfileButton: Locator;
  readonly followButton: Locator;
  readonly messageButton: Locator;
  readonly postsTab: Locator;
  readonly aboutTab: Locator;
  readonly friendsTab: Locator;
  readonly profileName: Locator;
  readonly profileBio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editProfileButton = page.getByTestId('button-edit-profile');
    this.followButton = page.getByTestId('button-follow');
    this.messageButton = page.getByTestId('button-message');
    this.postsTab = page.getByTestId('tab-posts');
    this.aboutTab = page.getByTestId('tab-about');
    this.friendsTab = page.getByTestId('tab-friends');
    this.profileName = page.getByTestId('text-profile-name');
    this.profileBio = page.getByTestId('text-profile-bio');
  }

  /**
   * Navigate to user profile
   */
  async goto(username: string): Promise<void> {
    await this.page.goto(`/profile/${username}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Edit profile
   */
  async editProfile(): Promise<void> {
    await this.editProfileButton.click();
  }

  /**
   * Follow/unfollow user
   */
  async toggleFollow(): Promise<void> {
    await this.followButton.click();
  }

  /**
   * Send message to user
   */
  async sendMessage(): Promise<void> {
    await this.messageButton.click();
  }

  /**
   * Switch to posts tab
   */
  async viewPosts(): Promise<void> {
    await this.postsTab.click();
  }

  /**
   * Switch to about tab
   */
  async viewAbout(): Promise<void> {
    await this.aboutTab.click();
  }

  /**
   * Switch to friends tab
   */
  async viewFriends(): Promise<void> {
    await this.friendsTab.click();
  }

  /**
   * Get profile name
   */
  async getProfileName(): Promise<string> {
    return await this.profileName.textContent() || '';
  }
}
