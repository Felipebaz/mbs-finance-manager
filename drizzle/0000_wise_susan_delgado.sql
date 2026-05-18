CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`currency` text(3) NOT NULL,
	`opening_balance_minor` integer DEFAULT 0 NOT NULL,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`color` text DEFAULT '#6b7280' NOT NULL,
	`archived_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`default_currency` text(3) NOT NULL,
	`locale` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`category_id` integer,
	`type` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text(3) NOT NULL,
	`occurred_at` integer NOT NULL,
	`note` text,
	`transfer_group_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `tx_account_idx` ON `transactions` (`account_id`);--> statement-breakpoint
CREATE INDEX `tx_category_idx` ON `transactions` (`category_id`);--> statement-breakpoint
CREATE INDEX `tx_occurred_idx` ON `transactions` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `tx_group_idx` ON `transactions` (`transfer_group_id`);