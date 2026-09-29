ALTER TABLE `accounts` ADD `access_token_expires_at` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `refresh_token_expires_at` integer;--> statement-breakpoint
ALTER TABLE `accounts` ADD `scope` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `id_token` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `token` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `ip_address` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `user_agent` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `updated_at` text NOT NULL;--> statement-breakpoint
ALTER TABLE `verifications` ADD `updated_at` text NOT NULL;