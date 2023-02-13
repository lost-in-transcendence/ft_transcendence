import { Module } from "@nestjs/common";
import { CleanupService } from "./cleanup.service";

@Module({
	providers: [CleanupService],
	exports: [CleanupService]
})
export class CleanupModule {}
