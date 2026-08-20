import type {
  Request,
  Response,
} from 'express'

import { ZodError } from 'zod'

import {
  CategoriaService,
  ConflictError,
  NotFoundError,
  ValidationError,
  CATEGORIA_MESSAGES,
} from './categoria.service.js'

import {
  categoriaIdSchema,
  createCategoriaSchema,
  listCategoriaSchema,
  updateCategoriaSchema,
} from './categoria.schema.js'

const service =
  new CategoriaService()

export class CategoriaController {
  async create(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const data =
        createCategoriaSchema.parse(
          req.body
        )

      const categoria =
        await service.create(data)

      res.status(201).json({
        success: true,
        data: categoria,
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  async findAll(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const filters =
        listCategoriaSchema.parse(
          req.query
        )

      const categorias =
        await service.findAll(
          filters
        )

      res.status(200).json({
        success: true,
        data: categorias,
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  async findById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } =
        categoriaIdSchema.parse(
          req.params
        )

      const categoria =
        await service.findById(
          id
        )

      res.status(200).json({
        success: true,
        data: categoria,
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  async update(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } =
        categoriaIdSchema.parse(
          req.params
        )

      const data =
        updateCategoriaSchema.parse(
          req.body
        )

      const categoria =
        await service.update(
          id,
          data
        )

      res.status(200).json({
        success: true,
        data: categoria,
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  async delete(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } =
        categoriaIdSchema.parse(
          req.params
        )

      await service.delete(id)

      res.status(200).json({
        success: true,

        data: {
          message:
            CATEGORIA_MESSAGES.DELETED,
        },
      })
    } catch (error) {
      this.handleError(
        error,
        res
      )
    }
  }

  private handleError(
    error: unknown,
    res: Response
  ): void {
    if (
      error instanceof ZodError
    ) {
      res.status(400).json({
        success: false,
        error:
          'Dados inválidos',

        data: error.issues,
      })

      return
    }

    if (
      error instanceof ValidationError
    ) {
      res.status(400).json({
        success: false,
        error: error.message,
      })

      return
    }

    if (
      error instanceof NotFoundError
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      })

      return
    }

    if (
      error instanceof ConflictError
    ) {
      res.status(409).json({
        success: false,
        error: error.message,
      })

      return
    }

    console.error(
      '[CategoriaController]',
      error
    )

    res.status(500).json({
      success: false,
      error:
        'Erro interno do servidor',
    })
  }
}