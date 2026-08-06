CREATE INDEX "recordings_class_published_idx" ON "recordings" USING btree ("class_id","published");--> statement-breakpoint
CREATE INDEX "recordings_expires_at_idx" ON "recordings" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "recordings_status_idx" ON "recordings" USING btree ("status");