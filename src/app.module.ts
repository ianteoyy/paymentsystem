import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PaymentsModule,
    MongooseModule.forRoot(
      `mongodb+srv://test2:${process.env.MONGODB_PASSWORD}@orders.dxs0h.mongodb.net/order-system?retryWrites=true&w=majority`,
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
