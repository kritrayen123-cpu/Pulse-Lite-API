import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SourcesModule } from './sources/sources.module';
import { MetricsModule } from './metrics/metrics.module';
import { IngestModule } from './ingest/ingest.module';
import { RulesModule } from './rules/rules.module';
import { IncidentsModule } from './incidents/incidents.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // DEV ONLY, replaced by migrations later
      }),
    }),
    UsersModule,
    SourcesModule,
    MetricsModule,
    IngestModule,
    RulesModule,
    IncidentsModule,
    AuthModule,
  ],
})
export class AppModule {}