CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64),
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`oldValue` json,
	`newValue` json,
	`ipAddress` varchar(50),
	`userAgent` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bpmnDiagrams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('as-is','to-be') NOT NULL,
	`xmlContent` text NOT NULL,
	`svgPreview` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bpmnDiagrams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`sectionNumber` int,
	`userId` varchar(64) NOT NULL,
	`commentText` text NOT NULL,
	`parentCommentId` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `criteriaMatrix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`criterionName` varchar(255) NOT NULL,
	`criterionType` varchar(50) NOT NULL,
	`description` text,
	`dataSource` varchar(255),
	`validationRule` text,
	`priority` int,
	`normativeBasis` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `criteriaMatrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `normativeActs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(100) NOT NULL,
	`number` varchar(100) NOT NULL,
	`date` datetime NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`url` text,
	`filePath` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `normativeActs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`channel` enum('sms','email','push','portal') NOT NULL,
	`subject` varchar(500),
	`body` text NOT NULL,
	`variables` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notificationTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passportNormativeActs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`normativeActId` int NOT NULL,
	`sectionNumber` int,
	`relevance` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `passportNormativeActs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passportVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`version` int NOT NULL,
	`data` json NOT NULL,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`comment` text,
	CONSTRAINT `passportVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `passportVersions_passportId_version_unique` UNIQUE(`passportId`,`version`)
);
--> statement-breakpoint
CREATE TABLE `passports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceName` varchar(500) NOT NULL,
	`serviceCode` varchar(50),
	`description` text,
	`status` enum('draft','in_review','published','archived') NOT NULL DEFAULT 'draft',
	`version` int NOT NULL DEFAULT 1,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `passports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentFormulas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`formulaName` varchar(255) NOT NULL,
	`formulaExpression` text NOT NULL,
	`variables` json,
	`roundingRule` varchar(100),
	`examples` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `paymentFormulas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`sectionNumber` int NOT NULL,
	`sectionName` varchar(255) NOT NULL,
	`curatorId` varchar(64),
	`data` json,
	`isCompleted` boolean DEFAULT false,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smevIntegrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`serviceCode` varchar(100) NOT NULL,
	`purpose` text,
	`requestExample` text,
	`responseExample` text,
	`fieldMapping` json,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `smevIntegrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusModels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`statusCode` varchar(50) NOT NULL,
	`statusName` varchar(255) NOT NULL,
	`description` text,
	`isInitial` boolean DEFAULT false,
	`isFinal` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `statusModels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusTransitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`passportId` int NOT NULL,
	`fromStatusId` int,
	`toStatusId` int NOT NULL,
	`condition` text,
	`isAutomatic` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `statusTransitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','curator','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `organization` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `position` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `auditLog` ADD CONSTRAINT `auditLog_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bpmnDiagrams` ADD CONSTRAINT `bpmnDiagrams_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentCommentId_comments_id_fk` FOREIGN KEY (`parentCommentId`) REFERENCES `comments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `criteriaMatrix` ADD CONSTRAINT `criteriaMatrix_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificationTemplates` ADD CONSTRAINT `notificationTemplates_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passportNormativeActs` ADD CONSTRAINT `passportNormativeActs_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passportNormativeActs` ADD CONSTRAINT `passportNormativeActs_normativeActId_normativeActs_id_fk` FOREIGN KEY (`normativeActId`) REFERENCES `normativeActs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passportVersions` ADD CONSTRAINT `passportVersions_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passportVersions` ADD CONSTRAINT `passportVersions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `passports` ADD CONSTRAINT `passports_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentFormulas` ADD CONSTRAINT `paymentFormulas_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_curatorId_users_id_fk` FOREIGN KEY (`curatorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smevIntegrations` ADD CONSTRAINT `smevIntegrations_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `statusModels` ADD CONSTRAINT `statusModels_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `statusTransitions` ADD CONSTRAINT `statusTransitions_passportId_passports_id_fk` FOREIGN KEY (`passportId`) REFERENCES `passports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `statusTransitions` ADD CONSTRAINT `statusTransitions_fromStatusId_statusModels_id_fk` FOREIGN KEY (`fromStatusId`) REFERENCES `statusModels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `statusTransitions` ADD CONSTRAINT `statusTransitions_toStatusId_statusModels_id_fk` FOREIGN KEY (`toStatusId`) REFERENCES `statusModels`(`id`) ON DELETE no action ON UPDATE no action;