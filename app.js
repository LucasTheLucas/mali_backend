const express = require('express')
const app = express()
const LixeiraMovimento = require("./lixeiramovimento");
const Lixeira = require("./lixeira");
const db = require("./db");

app.get("/lixeiramovimento", async function(req, res) 
{
    const { codlixeira, porcentagem } = req.query;

    await LixeiraMovimento.create({
        codlixeira: parseInt(codlixeira),
        porcentagem: parseFloat(porcentagem),
        data: new Date()
    })

    res.send("Dados salvos via parâmetros!");
});

app.get("/lixeirasmapa", async function(req, res) {
    try {
        const [movimentos] = await db.sequelize.query(`
            SELECT 
                id, 
                coordenadax, 
                coordenaday, 
                porcentagem,
                referencia
            FROM (
                SELECT 
                    l.id, 
                    l.coordenadax, 
                    l.coordenaday, 
                    coalesce(lm.porcentagem, 0) as porcentagem,
                    l.referencia,
                    ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY lm.data DESC) as rnk
                FROM lixeiras l
                LEFT JOIN lixeiramovimentos lm ON l.id = lm.codlixeira
            ) AS subquery
            WHERE rnk = 1;`);

        res.json(movimentos);
    } catch (error) {
        console.error("Erro na consulta:", error);
        res.status(500).send("Erro ao buscar estados das lixeiras");
    }
});

app.get("/lixeirasmapa", async function(req, res)
{
    const lixeiras = await Lixeira.findAll();
    res.json(lixeiras);
})

app.listen(8082)