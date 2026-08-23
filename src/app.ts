import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ZodError } from 'zod'

import authRouter from './modules/auth/auth.router.js'
import fornecedorRouter from './modules/fornecedor/fornecedor.router.js'
import empresasRouter from './modules/empresas/empresa.router.js'
import modelosRouter from './modules/modelos/modelos.router.js'
import coresRouter from './modules/cores/cores.router.js'
import categoriaRouter from './modules/categoria/categoria.router.js'
import tipos_produtoRouter from './modules/tipos_produto/tipos_produtos.router.js'
import produtosRouter from './modules/produtos/produtos.router.js'
import nota_fiscalRouter from './modules/nota_fiscal/nota_fiscal.router.js'
import produto_empresaRouter from './modules/produto_empresa/produto_empresa.router.js'
import empresa_fornecedorRouter from './modules/empresa_fornecedor/empresa_fornecedor.router.js'
import produto_fornecedorRouter from './modules/produto_fornecedor/produto_empresa.router.js'
import estoqueRouter from './modules/estoque/estoque.router.js'
import reserva_estoqueRouter from './modules/reserva_estoque/reserva_estoque.router.js'
import movimentacao_estoqueRouter from './modules/movimentacao_estoque/movimentacao_estoque.router.js'
import ordem_producaoRouter from './modules/ordem_producao/ordem_producao.router.js'
import necessidade_producaoRouter from './modules/necessidade_producao/necessidade_producao.router.js'
import ordem_producao_itemRouter from './modules/ordem_producao_item/ordem_producao_item.router.js'
import locais_estoqueRouter from './modules/locais_estoques/locais_estoque.router.js'
import consumo_producaoRouter from './modules/consumo_producao/consumo_producao.router.js'
import vendaRouter from './modules/venda/venda.router.js'
import item_pedido_compraRouter from './modules/item_pedido_compra/item_pedido_compra.router.js'
import item_requisicao_compraRouter from './modules/item_requisicao_compra/item_requisicao_compra.router.js'
import item_vendaRouter from './modules/item_venda/item_venda.router.js'
import pedido_compraRouter from './modules/pedido_compra/pedido_compra.router.js'
import requisicao_compraRouter from './modules/requisicao_compra/requisicao_compra.router.js'
import compra_itensRouter from './modules/compra_itens/compra_itens.router.js'
import produto_variacoesRouter from './modules/produto_variacoes/produto_variacoes.router.js'

const app = express()

app.use(cors())

app.use(express.json())

app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/fornecedor', fornecedorRouter)
app.use('/empresas', empresasRouter)
app.use('/modelos', modelosRouter)
app.use('/produtos', produtosRouter)
app.use('/cores', coresRouter)
app.use('/nota_fiscal', nota_fiscalRouter)
app.use('/produto_empresa', produto_empresaRouter)
app.use('/empresa_fornecedor', empresa_fornecedorRouter)
app.use('/produto_fornecedor', produto_fornecedorRouter)
app.use('/estoque', estoqueRouter)
app.use('/categoria', categoriaRouter)
app.use('/tipos_produto', tipos_produtoRouter)
app.use('/reserva_estoque', reserva_estoqueRouter)
app.use('/movimentacao_estoque', movimentacao_estoqueRouter)
app.use('/ordem_producao', ordem_producaoRouter)
app.use('/necessidade_producao', necessidade_producaoRouter)
app.use('/ordem_producao_item', ordem_producao_itemRouter)
app.use('/locais_estoque', locais_estoqueRouter)
app.use('/consumo_producao', consumo_producaoRouter)
app.use('/venda', vendaRouter)
app.use('/itens_pedido_compra', item_pedido_compraRouter)
app.use('/itens_requisicao_compra', item_requisicao_compraRouter)
app.use('/itens_venda', item_vendaRouter)
app.use('/pedidos_compra', pedido_compraRouter)
app.use('/requisicoes_compra', requisicao_compraRouter)
app.use('/compra_itens', compra_itensRouter)
app.use('/produto_variacoes', produto_variacoesRouter)



app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'API online',
  })
})

app.use(
  (
    error: Error & {
      statusCode?: number
    },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.issues,
      })
    }

    console.error(error)

    return res
      .status(error.statusCode ?? 500)
      .json({
        error:
          error.message ??
          'Erro interno do servidor',
      })
  }
)

export default app
