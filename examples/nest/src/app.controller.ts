import type { Response } from 'express';

import { Get, Controller, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    return res.render(this.appService.getViewName(), {
      isAbout: false,
    });
  }

  @Get('/about')
  about(@Res() res: Response) {
    return res.render(this.appService.getViewName(), {
      isAbout: true,
    });
  }
}
