import { Request, Response } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, PUT, DELETE } from '../../decorators/method.decorator';
import { Validate } from '../../decorators/middleware.decorator';
import { CountryService } from '../services/country';
import { 
  createCountrySchema
} from '../rules/country.rules';
import { ApiResult } from '../../utils/api-result';

@Controller('/country')
export class CountryController {
  private countryService: CountryService;

  constructor() {
    this.countryService = new CountryService();
  }


  @POST('/')
  @Validate([createCountrySchema])
  public async createCountry(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.countryService.createCountry(req.body);
      result.send(res);
    } catch (error) {
        console.log("Error in createCountry", error);
         ApiResult.error((error as any).message, 500);
    }
  }

  
} 