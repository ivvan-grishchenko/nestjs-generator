import { Module } from '@nestjs/common';

import { GenerateCommandModule } from './generate-command';

@Module({
  imports: [GenerateCommandModule],
})
export class AppModule {}
