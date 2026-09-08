// Local Vite middleware uses the same handler as Vercel functions.
export function commerceDevPlugin(env) {
 return { name:'commerce-local-api', configureServer(server) {
  server.middlewares.use(async (req,res,next)=>{
   if (!req.url?.startsWith('/api/commerce') && !req.url?.startsWith('/api/webhooks/mercadopago')) return next()
   res.status=code=>{res.statusCode=code;return res}
   res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value))}
   res.send=value=>res.end(value)
   let body=''
   try {
    for await (const chunk of req) {body+=chunk;if(body.length>16384){res.status(413).json({error:'Solicitud demasiado grande.'});return}}
    req.body=body?JSON.parse(body):{}
   } catch {res.status(400).json({error:'Solicitud inválida.'});return}
   if(req.url.startsWith('/api/webhooks/mercadopago')) req.commerceAction='webhook'
   const {createHandler}=await import('./commerce.js')
   await createHandler({...env,APP_URL:server.resolvedUrls?.local[0] || env.APP_URL})(req,res)
  })
 } }
}
