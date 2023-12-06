var express = require('express')
var app = express()
const redis = require('redis');

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', './views')

const cli = redis.createClient({
    password: 'GKnlklxiwgVtaJ1VCAQIFlTbNEsPXHGw',
    socket: {
        host: 'redis-16354.c323.us-east-1-2.ec2.cloud.redislabs.com',
        port: 16354
    }
});

var senhaAtual

app.get("/", async (req, res) => {
    let fila = await cli.lRange('fila', 0, -1)
    res.render('index', { senhaAtual: senhaAtual, fila: fila });
})

app.get("/proximo", async (req, res) => {
    senhaAtual = await cli.lPop('fila')
    res.render('proximo', {senhaAtual:senhaAtual});
})

app.get("/retirar", async (req, res) => {
    let ultimaSenha = await cli.lIndex('ListaSenha', -1)
    let novaSenha = parseInt(ultimaSenha) + 1
    await cli.rPush('ListaSenha', novaSenha.toString())
    await cli.rPush('fila', novaSenha.toString())
    res.render('retirarsenha', {senhaAtual:novaSenha});
});

async function start() {
    await cli.connect()
    console.log('Conectado ao redis')
    app.listen(8888, async () => {
        console.log('Servidor iniciado porta 8888')
        await cli.del('fila')
        await cli.del('ListaSenha')
        await cli.rPush('ListaSenha', ['0'])
        senhaAtual = await cli.lIndex('ListaSenha', 0)
    });
}

start()


