const express = require('express')
const app = express()
const crypto = require('crypto');

const LixeiraMovimento = require("./lixeiramovimento");
const Lixeira = require("./lixeira");
const Bairro = require("./bairro");
const Cidade = require("./cidade");
const Coleta = require("./coleta");
const Estado = require("./estado");
const Pais = require("./pais");
const Rua = require("./rua");
const Usuario = require("./usuario");

const db = require("./db");

app.use(express.json());

app.get("/teste", async function(req, res) 
{
        res.send("Teste de conexão! OK");
})

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

//ROTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
            res.status(401).json({status: "FALHA", mensagem: "Senha e email devem ser preenchidos!"});
    }

    try {
        const hashMD5 = crypto.createHash('md5').update(senha).digest('hex');

        const contas = await db.sequelize.query(
            `SELECT email, senha FROM usuarios WHERE email = :emailSolicitado AND senha = :senhaHash AND ativo = 'T'`,
            {
                replacements: { emailSolicitado: email, senhaHash: hashMD5 },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        
        if (contas.length > 0) {
            console.log(contas[0].email)
            res.status(200).json({status: "SUCESSO"});
        } else {
            res.status(401).json({status: "FALHA", mensagem: "Senha ou email incorreto!"});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({status: "FALHA", mensagem: "Erro não catálogado"});
    }
});

//ROTA PARA PEGAR OS CADASTROS DE FUNCIONÁRIOS
app.get("/usuarios", async function(req, res) {
    try {
            const [usuarios] = await db.sequelize.query(`
                SELECT 
                    id, 
                    nome, 
                    email, 
                    CASE 
                        WHEN funcao = 'M' THEN 'ACESSO MOTORISTA'  
                        WHEN funcao = 'A' THEN 'ACESSO ADMINISTRATIVO'
                        WHEN funcao = 'C' THEN 'ACESSO COMPLETO'
                    END AS funcao,
                    funcao AS tipofuncao,
                    sexo,
                    telefone

                    FROM usuarios WHERE ativo = 'T'`
            );
            res.status(200).json(usuarios);
        } catch (error) {console.error("Falha ao consultar usuarios:", error);}
});

app.post('/cadastrarfuncionario', async (req, res) => {
    try {
        const { nome, email, telefone, funcao } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ 
                status: "FALHA", 
                mensagem: "Nome e Email são obrigatórios." 
            });
        }

        const novoFuncionario = await Usuario.create({
            nome: nome,
            email: email,
            telefone: telefone,
            funcao: funcao,
            ativo: 'T',
            senha: 'e336b9c97042858882436f5466487739',
            trocarsenha: 'T'
        });

        return res.status(201).json({
            status: "SUCESSO",
            mensagem: "Funcionário cadastrado com sucesso!",
            dados: novoFuncionario
        });

    } catch (error) {
        console.error("Erro ao cadastrar funcionário:", error);
        return res.status(500).json({
            status: "FALHA",
            mensagem: "Erro interno no servidor."
        });
    }
});

app.get("/movimento-lixeira/:codlixeira", async function(req, res) {
    try {

        const movimentos = await LixeiraMovimento.findAll({
            where: {
                codlixeira: req.params.codlixeira
            },
            order: [["data", "DESC"]]
        });

        res.status(200).json(movimentos);

    } catch (error) {

        console.error("Erro ao buscar movimentos:", error);

        res.status(500).json({
            status: "FALHA",
            mensagem: "Erro ao buscar movimentos"
        });

    }
});

app.listen(8082)