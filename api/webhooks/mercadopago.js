import { createHandler } from '../../server/commerce.js'
const handler = createHandler()
export default function webhook(req,res) {
 req.commerceAction = 'webhook'
 return handler(req,res)
}
