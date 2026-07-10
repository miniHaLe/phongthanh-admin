import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  type Type,
} from '@nestjs/common'
import type { ZodTypeAny } from 'zod'
import { CurrentUser } from '../auth/current-user.decorator'
import type { AuthenticatedUser } from '../auth/jwt-payload'
import { ZodValidationPipe } from '../common/zod-validation.pipe'
import type { CrudService } from './crud.service'
import { listParamsQuerySchema } from './list-params.dto'

/**
 * Builds a `@Controller(path)` class bound to a given `CrudService` instance
 * (injected via `serviceToken`, provided by the caller's module — see
 * `khach-hang.module.ts` for the wiring). Each resource (khach-hang today;
 * ~37 more in Phase 3) gets its own generated controller class + its own Zod
 * create/update schemas; the engine (`CrudService`) is shared code, the
 * per-resource wiring is one function call.
 */
export function createCrudController(options: {
  path: string
  serviceToken: symbol
  createSchema: ZodTypeAny
  updateSchema: ZodTypeAny
}): Type<unknown> {
  const { path, serviceToken, createSchema, updateSchema } = options
  const listParamsPipe = new ZodValidationPipe(listParamsQuerySchema)
  const createPipe = new ZodValidationPipe(createSchema)
  const updatePipe = new ZodValidationPipe(updateSchema)

  @Controller(path)
  class GeneratedCrudController {
    constructor(@Inject(serviceToken) private readonly service: CrudService) {}

    @Get()
    list(@Query() query: unknown, @CurrentUser() user: AuthenticatedUser) {
      const parsed = listParamsPipe.transform(query)
      return this.service.list(parsed, user)
    }

    @Get(':id')
    get(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
      return this.service.get(id, user)
    }

    @Post()
    create(@Body() body: unknown, @CurrentUser() user: AuthenticatedUser) {
      const parsed = createPipe.transform(body)
      return this.service.create(parsed as Record<string, unknown>, user)
    }

    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() body: unknown,
      @CurrentUser() user: AuthenticatedUser,
    ) {
      const parsed = updatePipe.transform(body)
      return this.service.update(id, parsed as Record<string, unknown>, user)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
      return this.service.remove(id, user)
    }
  }

  return GeneratedCrudController
}
