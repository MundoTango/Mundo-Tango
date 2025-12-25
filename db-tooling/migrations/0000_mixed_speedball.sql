CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"text" text NOT NULL,
	"time" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "album_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"album_id" integer NOT NULL,
	"media_id" integer NOT NULL,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"match_reason" text,
	"status" varchar DEFAULT 'pending',
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"rejected_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "blocked_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" integer NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"blocked_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"image" text,
	"published" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer,
	"workshop_id" integer,
	"confirmation_number" varchar NOT NULL,
	"guests" integer DEFAULT 1,
	"total_amount" integer NOT NULL,
	"status" varchar DEFAULT 'confirmed',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_confirmation_number_unique" UNIQUE("confirmation_number")
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"media_url" text,
	"media_type" varchar,
	"read_by" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_room_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"last_read_at" timestamp,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar DEFAULT 'direct' NOT NULL,
	"name" text,
	"avatar" text,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clarifier_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"chat_log" jsonb,
	"detected_signals" text[],
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comment_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"city_name" varchar NOT NULL,
	"country" varchar,
	"cover_photo_url" text,
	"cover_photo_source" varchar,
	"cover_photo_credit" varchar,
	"description" text,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "communities_city_name_unique" UNIQUE("city_name")
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "esa_agent_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"certification_level" integer NOT NULL,
	"certification_date" timestamp NOT NULL,
	"certified_by" varchar,
	"skills" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "esa_agent_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_agent_id" integer NOT NULL,
	"recipient_agent_id" integer NOT NULL,
	"message_type" varchar NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"priority" varchar DEFAULT 'normal',
	"status" varchar DEFAULT 'sent' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "esa_agent_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"metric_type" varchar NOT NULL,
	"metric_value" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "esa_agent_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"task_title" text NOT NULL,
	"task_description" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "esa_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"division" varchar,
	"certification_level" integer DEFAULT 1,
	"specialization" text,
	"status" varchar DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "esa_agents_agent_id_unique" UNIQUE("agent_id")
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"event_type" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"date" text,
	"location" text NOT NULL,
	"venue" varchar,
	"address" text,
	"city" varchar,
	"country" varchar,
	"latitude" text,
	"longitude" text,
	"price" text,
	"currency" varchar,
	"ticket_url" text,
	"max_attendees" integer,
	"is_paid" boolean DEFAULT false,
	"is_online" boolean DEFAULT false,
	"meeting_url" text,
	"recurring" varchar,
	"status" varchar DEFAULT 'published',
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"did_we_dance" boolean DEFAULT false,
	"dance_location" text,
	"dance_event_id" integer,
	"dance_story" text,
	"sender_message" text NOT NULL,
	"sender_private_note" text,
	"receiver_response" text,
	"media_urls" text[],
	"snoozed_until" timestamp,
	"snoozed_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendship_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"friendship_id" integer NOT NULL,
	"activity_type" varchar NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendship_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"friend_request_id" integer,
	"friendship_id" integer,
	"uploader_id" integer NOT NULL,
	"media_url" text NOT NULL,
	"media_type" varchar NOT NULL,
	"caption" text,
	"phase" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"closeness_score" integer DEFAULT 75 NOT NULL,
	"connection_degree" integer DEFAULT 1 NOT NULL,
	"last_interaction_at" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"avatar" text,
	"cover_photo" text,
	"group_type" varchar NOT NULL,
	"category" varchar,
	"location" text,
	"city" varchar,
	"country" varchar,
	"rules" text,
	"member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "h2ac_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_type" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"recipient_type" varchar NOT NULL,
	"recipient_id" varchar NOT NULL,
	"message_type" varchar NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"priority" varchar DEFAULT 'normal',
	"status" varchar DEFAULT 'sent' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "housing_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"guest_id" integer NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"check_out_date" timestamp NOT NULL,
	"guests" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "housing_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"host_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"property_type" varchar NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"max_guests" integer,
	"price_per_night" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"address" text NOT NULL,
	"city" varchar NOT NULL,
	"country" varchar NOT NULL,
	"latitude" text,
	"longitude" text,
	"amenities" text[],
	"house_rules" text,
	"images" text[],
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "life_ceo_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "life_ceo_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"domain" varchar NOT NULL,
	"title" text,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "life_ceo_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "life_ceo_domains_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "life_ceo_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"domain_id" integer,
	"title" text NOT NULL,
	"description" text,
	"target_date" timestamp,
	"status" varchar DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0,
	"priority" varchar DEFAULT 'medium',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "life_ceo_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer NOT NULL,
	"title" text NOT NULL,
	"target_percentage" integer NOT NULL,
	"achieved" boolean DEFAULT false,
	"achieved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "life_ceo_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"domain_id" integer,
	"agent_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"action_url" text,
	"priority" varchar DEFAULT 'medium',
	"status" varchar DEFAULT 'pending' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"dismissed_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "life_ceo_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"goal_id" integer,
	"domain_id" integer,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"estimated_minutes" integer,
	"actual_minutes" integer,
	"recurring" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "live_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"host" varchar NOT NULL,
	"thumbnail" text,
	"is_live" boolean DEFAULT false,
	"viewers" integer DEFAULT 0,
	"scheduled_date" varchar,
	"registrations" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"seller_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"condition" varchar NOT NULL,
	"price" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"images" text[],
	"location" text,
	"city" varchar,
	"country" varchar,
	"status" varchar DEFAULT 'available' NOT NULL,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	"caption" text,
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"cover_image_url" text,
	"media_count" integer DEFAULT 0,
	"privacy" varchar DEFAULT 'public',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"emoji" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" varchar NOT NULL,
	"content_id" integer NOT NULL,
	"reporter_id" integer NOT NULL,
	"reason" varchar NOT NULL,
	"details" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"action" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mr_blue_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mr_blue_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"subscribed" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_id" integer,
	"related_type" varchar,
	"action_url" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"page_path" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_address" varchar,
	"session_id" varchar,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"booking_id" integer,
	"amount" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"status" varchar DEFAULT 'pending',
	"transaction_id" varchar,
	"payment_method" varchar,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "post_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"collection_name" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_edits" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"previous_content" text NOT NULL,
	"new_content" text NOT NULL,
	"edit_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"reporter_id" integer NOT NULL,
	"reason" varchar NOT NULL,
	"details" text,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"action" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_share_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"share_type" varchar NOT NULL,
	"platform" varchar,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"share_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_id" integer,
	"content" text NOT NULL,
	"rich_content" jsonb,
	"plain_text" text,
	"image_url" text,
	"video_url" text,
	"media_embeds" jsonb,
	"mentions" text[],
	"hashtags" text[],
	"tags" text[],
	"location" text,
	"coordinates" jsonb,
	"place_id" text,
	"formatted_address" text,
	"visibility" varchar DEFAULT 'public',
	"post_type" varchar DEFAULT 'post',
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" serial PRIMARY KEY NOT NULL,
	"volunteer_id" integer NOT NULL,
	"filename" text,
	"file_url" text,
	"parsed_text" text,
	"links" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"verified" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"search_count" integer DEFAULT 1,
	"avg_result_count" integer,
	"click_through_rate" integer,
	"last_searched_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"query" text NOT NULL,
	"result_count" integer,
	"clicked" boolean DEFAULT false,
	"clicked_result_type" varchar,
	"clicked_result_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"domain" varchar,
	"phase" varchar,
	"estimated_hours" integer,
	"required_skills" text[],
	"status" varchar DEFAULT 'open',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" text,
	"experience" varchar,
	"specialties" text[],
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "teachers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "tutorial_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"tutorial_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"order" integer NOT NULL,
	"content_type" varchar NOT NULL,
	"content_url" text,
	"duration_minutes" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"instructor" varchar NOT NULL,
	"level" varchar NOT NULL,
	"duration" varchar NOT NULL,
	"price" integer NOT NULL,
	"thumbnail" text,
	"students" integer DEFAULT 0,
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "two_factor_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text[],
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "two_factor_secrets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" integer NOT NULL,
	"interaction_type" varchar NOT NULL,
	"duration_seconds" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"profile_visibility" varchar DEFAULT 'public',
	"show_online_status" boolean DEFAULT true,
	"allow_messages" varchar DEFAULT 'everyone',
	"language" varchar DEFAULT 'en',
	"theme" varchar DEFAULT 'system',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" text NOT NULL,
	"mobile_no" varchar,
	"profile_image" text,
	"background_image" text,
	"bio" text,
	"first_name" varchar,
	"last_name" varchar,
	"country" varchar,
	"city" varchar,
	"facebook_url" text,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"suspended" boolean DEFAULT false,
	"device_type" varchar,
	"device_token" text,
	"api_token" text,
	"replit_id" varchar,
	"nickname" varchar,
	"languages" text[],
	"tango_roles" text[],
	"leader_level" integer DEFAULT 0,
	"follower_level" integer DEFAULT 0,
	"years_of_dancing" integer DEFAULT 0,
	"started_dancing_year" integer,
	"state" varchar,
	"country_code" varchar,
	"state_code" varchar,
	"form_status" integer DEFAULT 0,
	"is_onboarding_complete" boolean DEFAULT false,
	"code_of_conduct_accepted" boolean DEFAULT false,
	"occupation" varchar,
	"terms_accepted" boolean DEFAULT false,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_status" varchar,
	"subscription_tier" varchar DEFAULT 'free',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"two_factor_enabled" boolean DEFAULT false,
	"last_login_at" timestamp,
	"last_login_ip" varchar,
	"customer_journey_state" varchar DEFAULT 'J1',
	"last_journey_update" timestamp,
	"role" varchar DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" varchar NOT NULL,
	"country" varchar NOT NULL,
	"phone" varchar,
	"email" varchar,
	"hours" text,
	"image" text,
	"rating" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"video_url" text NOT NULL,
	"thumbnail_url" text,
	"duration_seconds" integer,
	"views" integer DEFAULT 0,
	"likes" integer DEFAULT 0,
	"privacy" varchar DEFAULT 'public',
	"processing_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"profile" jsonb,
	"skills" text[],
	"availability" varchar,
	"hours_per_week" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"instructor" varchar NOT NULL,
	"image" text,
	"date" varchar NOT NULL,
	"location" text NOT NULL,
	"duration" varchar,
	"price" integer NOT NULL,
	"capacity" integer NOT NULL,
	"registered" integer DEFAULT 0 NOT NULL,
	"spots_left" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"methodology" varchar(100) NOT NULL,
	"level" integer NOT NULL,
	"requirements_met" jsonb,
	"verified_by" integer,
	"certification_date" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"performance_score" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"communication_type" varchar(20) NOT NULL,
	"from_agent_id" integer,
	"to_agent_id" integer,
	"from_user_id" integer,
	"to_user_id" integer,
	"message_type" varchar(50) NOT NULL,
	"subject" varchar(255),
	"message" text NOT NULL,
	"task_id" integer,
	"priority" varchar(20) DEFAULT 'normal',
	"requires_response" boolean DEFAULT false,
	"response_id" integer,
	"responded_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"task_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"assigned_by" integer,
	"dependencies" jsonb,
	"result" text,
	"artifacts" jsonb,
	"error_message" text,
	"estimated_duration" integer,
	"actual_duration" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_name" varchar(255) NOT NULL,
	"methodology" varchar(100) NOT NULL,
	"agent_ids" jsonb NOT NULL,
	"batch_size" integer DEFAULT 1,
	"training_modules" jsonb,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"agents_certified" integer DEFAULT 0,
	"average_score" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_minutes" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"event_type" varchar(50) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"metadata" jsonb,
	"deployment_id" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cicd_pipelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"triggers" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"last_run_id" integer,
	"last_run_status" varchar(20),
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cicd_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pipeline_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"trigger_type" varchar(20) NOT NULL,
	"git_commit_sha" varchar(40),
	"git_branch" varchar(255),
	"logs" text,
	"error_message" text,
	"deployment_id" integer,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cost_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" varchar(50) NOT NULL,
	"service" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"billing_period_start" timestamp NOT NULL,
	"billing_period_end" timestamp NOT NULL,
	"usage_metrics" jsonb,
	"deployment_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"domain" varchar(255) NOT NULL,
	"subdomain" varchar(255),
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"verification_token" varchar(255) NOT NULL,
	"verification_method" varchar(50) NOT NULL,
	"verified_at" timestamp,
	"ssl_status" varchar(20) DEFAULT 'pending',
	"ssl_issued_at" timestamp,
	"deployment_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "database_backups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"size_bytes" integer,
	"backup_url" text,
	"storage_provider" varchar(50) NOT NULL,
	"can_restore" boolean DEFAULT true,
	"last_restored_at" timestamp,
	"error_message" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"git_commit_sha" varchar(40),
	"git_branch" varchar(255) NOT NULL,
	"git_commit_message" text,
	"vercel_url" text,
	"railway_url" text,
	"vercel_deployment_id" varchar(255),
	"railway_deployment_id" varchar(255),
	"build_logs" text,
	"error_message" text,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "environment_variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" text NOT NULL,
	"environment" varchar(20) NOT NULL,
	"synced_to_vercel" boolean DEFAULT false,
	"synced_to_railway" boolean DEFAULT false,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"settings" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "preview_deployments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"git_commit_sha" varchar(40),
	"git_branch" varchar(255) NOT NULL,
	"preview_url" text,
	"deployment_id" integer,
	"expires_at" timestamp NOT NULL,
	"expired_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"member_id" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"permissions" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"invited_by" integer NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_album_id_media_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."media_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_media" ADD CONSTRAINT "album_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_content" ADD CONSTRAINT "blocked_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blocked_user_id_users_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_users" ADD CONSTRAINT "chat_room_users_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_users" ADD CONSTRAINT "chat_room_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarifier_sessions" ADD CONSTRAINT "clarifier_sessions_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_comment_id_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esa_agent_certifications" ADD CONSTRAINT "esa_agent_certifications_agent_id_esa_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esa_agent_communications" ADD CONSTRAINT "esa_agent_communications_sender_agent_id_esa_agents_id_fk" FOREIGN KEY ("sender_agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esa_agent_communications" ADD CONSTRAINT "esa_agent_communications_recipient_agent_id_esa_agents_id_fk" FOREIGN KEY ("recipient_agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esa_agent_metrics" ADD CONSTRAINT "esa_agent_metrics_agent_id_esa_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "esa_agent_tasks" ADD CONSTRAINT "esa_agent_tasks_agent_id_esa_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_dance_event_id_events_id_fk" FOREIGN KEY ("dance_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_activities" ADD CONSTRAINT "friendship_activities_friendship_id_friendships_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friendships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_friend_request_id_friend_requests_id_fk" FOREIGN KEY ("friend_request_id") REFERENCES "public"."friend_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_friendship_id_friendships_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friendships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendship_media" ADD CONSTRAINT "friendship_media_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housing_bookings" ADD CONSTRAINT "housing_bookings_listing_id_housing_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."housing_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housing_bookings" ADD CONSTRAINT "housing_bookings_guest_id_users_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housing_listings" ADD CONSTRAINT "housing_listings_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_chat_messages" ADD CONSTRAINT "life_ceo_chat_messages_conversation_id_life_ceo_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."life_ceo_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_conversations" ADD CONSTRAINT "life_ceo_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_goals" ADD CONSTRAINT "life_ceo_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_goals" ADD CONSTRAINT "life_ceo_goals_domain_id_life_ceo_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."life_ceo_domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_milestones" ADD CONSTRAINT "life_ceo_milestones_goal_id_life_ceo_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."life_ceo_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_recommendations" ADD CONSTRAINT "life_ceo_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_recommendations" ADD CONSTRAINT "life_ceo_recommendations_domain_id_life_ceo_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."life_ceo_domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_tasks" ADD CONSTRAINT "life_ceo_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_tasks" ADD CONSTRAINT "life_ceo_tasks_goal_id_life_ceo_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."life_ceo_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "life_ceo_tasks" ADD CONSTRAINT "life_ceo_tasks_domain_id_life_ceo_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."life_ceo_domains"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_albums" ADD CONSTRAINT "media_albums_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_queue" ADD CONSTRAINT "moderation_queue_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mr_blue_conversations" ADD CONSTRAINT "mr_blue_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mr_blue_messages" ADD CONSTRAINT "mr_blue_messages_conversation_id_mr_blue_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."mr_blue_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_edits" ADD CONSTRAINT "post_edits_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_edits" ADD CONSTRAINT "post_edits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_reports" ADD CONSTRAINT "post_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_share_analytics" ADD CONSTRAINT "post_share_analytics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_volunteer_id_volunteers_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutorial_modules" ADD CONSTRAINT "tutorial_modules_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "public"."tutorials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_secrets" ADD CONSTRAINT "two_factor_secrets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_uploads" ADD CONSTRAINT "video_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_certifications" ADD CONSTRAINT "agent_certifications_agent_id_esa_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_certifications" ADD CONSTRAINT "agent_certifications_verified_by_esa_agents_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_from_agent_id_esa_agents_id_fk" FOREIGN KEY ("from_agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_to_agent_id_esa_agents_id_fk" FOREIGN KEY ("to_agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_task_id_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_communications" ADD CONSTRAINT "agent_communications_response_id_agent_communications_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."agent_communications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agent_id_esa_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_assigned_by_esa_agents_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."esa_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cicd_pipelines" ADD CONSTRAINT "cicd_pipelines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cicd_runs" ADD CONSTRAINT "cicd_runs_pipeline_id_cicd_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."cicd_pipelines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cicd_runs" ADD CONSTRAINT "cicd_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cicd_runs" ADD CONSTRAINT "cicd_runs_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_records" ADD CONSTRAINT "cost_records_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "database_backups" ADD CONSTRAINT "database_backups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_variables" ADD CONSTRAINT "environment_variables_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_integrations" ADD CONSTRAINT "platform_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_deployments" ADD CONSTRAINT "preview_deployments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_deployments" ADD CONSTRAINT "preview_deployments_deployment_id_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "album_media_album_idx" ON "album_media" USING btree ("album_id");--> statement-breakpoint
CREATE INDEX "album_media_media_idx" ON "album_media" USING btree ("media_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_album_media" ON "album_media" USING btree ("album_id","media_id");--> statement-breakpoint
CREATE INDEX "assignments_volunteer_idx" ON "assignments" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "assignments_task_idx" ON "assignments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "assignments_status_idx" ON "assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blocked_content_user_idx" ON "blocked_content" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blocked_content_content_idx" ON "blocked_content" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "blocked_users_user_idx" ON "blocked_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "blocked_users_blocked_idx" ON "blocked_users" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_blocked_user" ON "blocked_users" USING btree ("user_id","blocked_user_id");--> statement-breakpoint
CREATE INDEX "blog_posts_author_idx" ON "blog_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "bookings_user_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bookings_confirmation_idx" ON "bookings" USING btree ("confirmation_number");--> statement-breakpoint
CREATE INDEX "chat_messages_room_idx" ON "chat_messages" USING btree ("chat_room_id");--> statement-breakpoint
CREATE INDEX "chat_messages_user_idx" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_room_users_room_idx" ON "chat_room_users" USING btree ("chat_room_id");--> statement-breakpoint
CREATE INDEX "chat_room_users_user_idx" ON "chat_room_users" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_chat_participant" ON "chat_room_users" USING btree ("chat_room_id","user_id");--> statement-breakpoint
CREATE INDEX "clarifier_sessions_volunteer_idx" ON "clarifier_sessions" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "comment_likes_comment_idx" ON "comment_likes" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "comment_likes_user_idx" ON "comment_likes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_comment_like" ON "comment_likes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "communities_city_idx" ON "communities" USING btree ("city_name");--> statement-breakpoint
CREATE INDEX "community_members_community_idx" ON "community_members" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "community_members_user_idx" ON "community_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_community_member" ON "community_members" USING btree ("community_id","user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "esa_certifications_agent_idx" ON "esa_agent_certifications" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "esa_certifications_level_idx" ON "esa_agent_certifications" USING btree ("certification_level");--> statement-breakpoint
CREATE INDEX "esa_comms_sender_idx" ON "esa_agent_communications" USING btree ("sender_agent_id");--> statement-breakpoint
CREATE INDEX "esa_comms_recipient_idx" ON "esa_agent_communications" USING btree ("recipient_agent_id");--> statement-breakpoint
CREATE INDEX "esa_comms_status_idx" ON "esa_agent_communications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "esa_comms_created_at_idx" ON "esa_agent_communications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "esa_metrics_agent_idx" ON "esa_agent_metrics" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "esa_metrics_type_idx" ON "esa_agent_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "esa_metrics_timestamp_idx" ON "esa_agent_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "esa_tasks_agent_idx" ON "esa_agent_tasks" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "esa_tasks_status_idx" ON "esa_agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "esa_tasks_due_date_idx" ON "esa_agent_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "esa_agents_agent_id_idx" ON "esa_agents" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "esa_agents_type_idx" ON "esa_agents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "esa_agents_division_idx" ON "esa_agents" USING btree ("division");--> statement-breakpoint
CREATE INDEX "esa_agents_status_idx" ON "esa_agents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_rsvps_event_idx" ON "event_rsvps" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_rsvps_user_idx" ON "event_rsvps" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_rsvp" ON "event_rsvps" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "events_user_idx" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_city_idx" ON "events" USING btree ("city");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_follow" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "friend_requests_sender_idx" ON "friend_requests" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "friend_requests_receiver_idx" ON "friend_requests" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "friend_requests_status_idx" ON "friend_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "friend_requests_snoozed_idx" ON "friend_requests" USING btree ("snoozed_until");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_friend_request" ON "friend_requests" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "friendship_activities_friendship_idx" ON "friendship_activities" USING btree ("friendship_id");--> statement-breakpoint
CREATE INDEX "friendship_activities_type_idx" ON "friendship_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "friendship_activities_date_idx" ON "friendship_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "friendship_media_request_idx" ON "friendship_media" USING btree ("friend_request_id");--> statement-breakpoint
CREATE INDEX "friendship_media_friendship_idx" ON "friendship_media" USING btree ("friendship_id");--> statement-breakpoint
CREATE INDEX "friendship_media_uploader_idx" ON "friendship_media" USING btree ("uploader_id");--> statement-breakpoint
CREATE INDEX "friendships_user_idx" ON "friendships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_friend_idx" ON "friendships" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "friendships_closeness_idx" ON "friendships" USING btree ("closeness_score");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_friendship" ON "friendships" USING btree ("user_id","friend_id");--> statement-breakpoint
CREATE INDEX "group_members_group_idx" ON "group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_member" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "groups_creator_idx" ON "groups" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "groups_name_idx" ON "groups" USING btree ("name");--> statement-breakpoint
CREATE INDEX "h2ac_messages_sender_idx" ON "h2ac_messages" USING btree ("sender_type","sender_id");--> statement-breakpoint
CREATE INDEX "h2ac_messages_recipient_idx" ON "h2ac_messages" USING btree ("recipient_type","recipient_id");--> statement-breakpoint
CREATE INDEX "h2ac_messages_status_idx" ON "h2ac_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "h2ac_messages_created_at_idx" ON "h2ac_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "housing_bookings_listing_idx" ON "housing_bookings" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "housing_bookings_guest_idx" ON "housing_bookings" USING btree ("guest_id");--> statement-breakpoint
CREATE INDEX "housing_bookings_status_idx" ON "housing_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "housing_host_idx" ON "housing_listings" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "housing_city_idx" ON "housing_listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "housing_status_idx" ON "housing_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "housing_created_at_idx" ON "housing_listings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "life_ceo_messages_conversation_idx" ON "life_ceo_chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "life_ceo_conversations_user_idx" ON "life_ceo_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "life_ceo_goals_user_idx" ON "life_ceo_goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "life_ceo_goals_domain_idx" ON "life_ceo_goals" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "life_ceo_goals_status_idx" ON "life_ceo_goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "life_ceo_milestones_goal_idx" ON "life_ceo_milestones" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "life_ceo_recommendations_user_idx" ON "life_ceo_recommendations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "life_ceo_recommendations_domain_idx" ON "life_ceo_recommendations" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "life_ceo_recommendations_status_idx" ON "life_ceo_recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "life_ceo_tasks_user_idx" ON "life_ceo_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "life_ceo_tasks_goal_idx" ON "life_ceo_tasks" USING btree ("goal_id");--> statement-breakpoint
CREATE INDEX "life_ceo_tasks_domain_idx" ON "life_ceo_tasks" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "life_ceo_tasks_status_idx" ON "life_ceo_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "life_ceo_tasks_due_date_idx" ON "life_ceo_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "live_streams_live_idx" ON "live_streams" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "marketplace_seller_idx" ON "marketplace_items" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "marketplace_category_idx" ON "marketplace_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketplace_status_idx" ON "marketplace_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "marketplace_city_idx" ON "marketplace_items" USING btree ("city");--> statement-breakpoint
CREATE INDEX "media_user_idx" ON "media" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "media_type_idx" ON "media" USING btree ("type");--> statement-breakpoint
CREATE INDEX "media_albums_user_idx" ON "media_albums" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "media_albums_created_at_idx" ON "media_albums" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "message_reactions_message_idx" ON "message_reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reactions_user_idx" ON "message_reactions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_message_reaction" ON "message_reactions" USING btree ("message_id","user_id","emoji");--> statement-breakpoint
CREATE INDEX "moderation_queue_content_idx" ON "moderation_queue" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE INDEX "moderation_queue_reporter_idx" ON "moderation_queue" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "moderation_queue_status_idx" ON "moderation_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mr_blue_conversations_user_idx" ON "mr_blue_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mr_blue_messages_conversation_idx" ON "mr_blue_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "newsletter_subscriptions_email_idx" ON "newsletter_subscriptions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_user_idx" ON "page_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "page_views_page_path_idx" ON "page_views" USING btree ("page_path");--> statement-breakpoint
CREATE INDEX "page_views_session_idx" ON "page_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_transaction_idx" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "post_bookmarks_user_idx" ON "post_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_bookmarks_post_idx" ON "post_bookmarks" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_bookmarks_collection_idx" ON "post_bookmarks" USING btree ("collection_name");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_post_bookmark" ON "post_bookmarks" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "post_comments_post_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_comments_user_idx" ON "post_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_comments_parent_idx" ON "post_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "post_edits_post_idx" ON "post_edits" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_edits_user_idx" ON "post_edits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "post_edits_created_at_idx" ON "post_edits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_likes_post_idx" ON "post_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_likes_user_idx" ON "post_likes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_post_like" ON "post_likes" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "post_reports_post_idx" ON "post_reports" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_reports_reporter_idx" ON "post_reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "post_reports_status_idx" ON "post_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "post_share_analytics_post_idx" ON "post_share_analytics" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_share_analytics_type_idx" ON "post_share_analytics" USING btree ("share_type");--> statement-breakpoint
CREATE INDEX "post_share_analytics_created_at_idx" ON "post_share_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "post_shares_post_idx" ON "post_shares" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_shares_user_idx" ON "post_shares" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_post_share" ON "post_shares" USING btree ("post_id","user_id","share_type");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_event_idx" ON "posts" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "resumes_volunteer_idx" ON "resumes" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_target_idx" ON "reviews" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "saved_posts_user_idx" ON "saved_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_posts_post_idx" ON "saved_posts" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_saved_post" ON "saved_posts" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "search_analytics_query_idx" ON "search_analytics" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_analytics_count_idx" ON "search_analytics" USING btree ("search_count");--> statement-breakpoint
CREATE INDEX "search_history_user_idx" ON "search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_history_query_idx" ON "search_history" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_history_created_at_idx" ON "search_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_domain_idx" ON "tasks" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "teachers_user_idx" ON "teachers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tutorial_modules_tutorial_idx" ON "tutorial_modules" USING btree ("tutorial_id");--> statement-breakpoint
CREATE INDEX "tutorial_modules_order_idx" ON "tutorial_modules" USING btree ("order");--> statement-breakpoint
CREATE INDEX "tutorials_instructor_idx" ON "tutorials" USING btree ("instructor");--> statement-breakpoint
CREATE INDEX "two_factor_secrets_user_idx" ON "two_factor_secrets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_interactions_user_idx" ON "user_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_interactions_target_idx" ON "user_interactions" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "user_interactions_type_idx" ON "user_interactions" USING btree ("interaction_type");--> statement-breakpoint
CREATE INDEX "user_interactions_created_at_idx" ON "user_interactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_settings_user_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "venues_city_idx" ON "venues" USING btree ("city");--> statement-breakpoint
CREATE INDEX "video_uploads_user_idx" ON "video_uploads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "video_uploads_status_idx" ON "video_uploads" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "video_uploads_created_at_idx" ON "video_uploads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "volunteers_user_idx" ON "volunteers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workshops_date_idx" ON "workshops" USING btree ("date");--> statement-breakpoint
CREATE INDEX "agent_certifications_agent_id_idx" ON "agent_certifications" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_certifications_methodology_idx" ON "agent_certifications" USING btree ("methodology");--> statement-breakpoint
CREATE INDEX "agent_certifications_level_idx" ON "agent_certifications" USING btree ("level");--> statement-breakpoint
CREATE INDEX "agent_communications_type_idx" ON "agent_communications" USING btree ("communication_type");--> statement-breakpoint
CREATE INDEX "agent_communications_from_agent_idx" ON "agent_communications" USING btree ("from_agent_id");--> statement-breakpoint
CREATE INDEX "agent_communications_to_agent_idx" ON "agent_communications" USING btree ("to_agent_id");--> statement-breakpoint
CREATE INDEX "agent_communications_task_id_idx" ON "agent_communications" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "agent_communications_created_at_idx" ON "agent_communications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agent_tasks_agent_id_idx" ON "agent_tasks" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_tasks_status_idx" ON "agent_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agent_tasks_priority_idx" ON "agent_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "agent_tasks_created_at_idx" ON "agent_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "agent_training_sessions_status_idx" ON "agent_training_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agent_training_sessions_methodology_idx" ON "agent_training_sessions" USING btree ("methodology");--> statement-breakpoint
CREATE INDEX "agent_training_sessions_created_at_idx" ON "agent_training_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "analytics_events_deployment_id_idx" ON "analytics_events" USING btree ("deployment_id");--> statement-breakpoint
CREATE INDEX "cicd_pipelines_user_id_idx" ON "cicd_pipelines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cicd_pipelines_is_active_idx" ON "cicd_pipelines" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "cicd_runs_pipeline_id_idx" ON "cicd_runs" USING btree ("pipeline_id");--> statement-breakpoint
CREATE INDEX "cicd_runs_user_id_idx" ON "cicd_runs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cicd_runs_status_idx" ON "cicd_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cicd_runs_created_at_idx" ON "cicd_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cost_records_user_id_idx" ON "cost_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cost_records_platform_idx" ON "cost_records" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "cost_records_billing_period_idx" ON "cost_records" USING btree ("billing_period_start");--> statement-breakpoint
CREATE INDEX "custom_domains_user_id_idx" ON "custom_domains" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_domains_domain_idx" ON "custom_domains" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "custom_domains_is_active_idx" ON "custom_domains" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "database_backups_user_id_idx" ON "database_backups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "database_backups_status_idx" ON "database_backups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "database_backups_created_at_idx" ON "database_backups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deployments_user_id_idx" ON "deployments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deployments_status_idx" ON "deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deployments_type_idx" ON "deployments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "deployments_created_at_idx" ON "deployments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "environment_variables_user_id_idx" ON "environment_variables" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "environment_variables_environment_idx" ON "environment_variables" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "environment_variables_key_idx" ON "environment_variables" USING btree ("key");--> statement-breakpoint
CREATE INDEX "platform_integrations_user_id_idx" ON "platform_integrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "platform_integrations_platform_idx" ON "platform_integrations" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "platform_integrations_user_platform_idx" ON "platform_integrations" USING btree ("user_id","platform");--> statement-breakpoint
CREATE INDEX "preview_deployments_user_id_idx" ON "preview_deployments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "preview_deployments_status_idx" ON "preview_deployments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "preview_deployments_expires_at_idx" ON "preview_deployments" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "team_members_owner_id_idx" ON "team_members" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "team_members_member_id_idx" ON "team_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "team_members_status_idx" ON "team_members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "team_members_owner_member_idx" ON "team_members" USING btree ("owner_id","member_id");