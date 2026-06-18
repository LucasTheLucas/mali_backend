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
            return res.status(401).json({status: "FALHA", mensagem: "Senha e email devem ser preenchidos!"});
    }

    try {
        const hashMD5 = crypto.createHash('md5').update(senha).digest('hex');

        const contas = await db.sequelize.query(
            `SELECT id, email, senha, trocarsenha FROM usuarios WHERE email = :emailSolicitado AND senha = :senhaHash AND ativo = 'T'`,
            {
                replacements: { emailSolicitado: email, senhaHash: hashMD5 },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        
        if (contas.length > 0) {
            const usuario = contas[0];
            res.status(200).json({status: "SUCESSO", trocarsenha: usuario.trocarsenha, id: usuario.id});
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
                    funcao,
                    sexo,
                    telefone

                    FROM usuarios WHERE ativo = 'T'`
            );
            res.status(200).json(usuarios);
        } catch (error) {console.error("Falha ao consultar usuarios:", error);}
});

//ROTA PARA CADASTRAR FUNCIONARIOS
app.post('/cadastrarfuncionario', async (req, res) => {
    try {
        const { nome, email, telefone, funcao, genero } = req.body;

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
            senha: '2359ade1bd4b44bd123cfca7bc853e33',
            trocarsenha: 'T',
            sexo: genero
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

//ROTA PARA PEGAR OS MOVIMENTOS FEITOS PELA LIXEIRAS
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

//TROCAR SENHA DO USUÁRIO DEPOIS DE RESETADA OU PELA PRIMEIRA VEZ CADASTRADO
app.post('/trocarsenha', async (req, res) => {
    try {
        const { id, novaSenha } = req.body;

        if (!id || !novaSenha) {
            return res.status(400).json({ 
                status: "FALHA", 
                mensagem: "Identificação e senha são obrigatórios" 
            });
        }

        const hashMD5 = crypto.createHash('md5').update(novaSenha).digest('hex');

        const resultado = await Usuario.update(
            {
                senha: hashMD5,
                trocarsenha: 'F'
            },
            {
                where: {
                    id: id 
                }
            }
        );

        if (resultado[0] > 0) {
            return res.status(201).json({
            status: "SUCESSO",
            mensagem: "Senha atualizada com sucesso!",
            });
        } else {
            return res.status(404).json({
            status: "FALHA",
            mensagem: "Houve um problema ao salvar a senha!",
            });
        }
    } catch (error) {
        console.error("Erro ao atualizar a senha!", error);
        return res.status(500).json({
            status: "FALHA",
            mensagem: "Erro interno no servidor."
        });
    }
});

//ROTA PARA RESETAR SENHA PARA A PADRÂO
app.post('/resetarsenha', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ 
                status: "FALHA", 
                mensagem: "Identificação e senha são obrigatórios" 
            });
        }

        const resultado = await Usuario.update(
            {
                senha: '2359ade1bd4b44bd123cfca7bc853e33',
                trocarsenha: 'T'
            },
            {
                where: {
                    id: id 
                }
            }
        );

        if (resultado[0] > 0) {
            return res.status(201).json({
            status: "SUCESSO",
            mensagem: "Senha resetada com sucesso!",
            });
        } else {
            return res.status(404).json({
            status: "FALHA",
            mensagem: "Houve um problema ao resetar a senha!",
            });
        }
    } catch (error) {
        console.error("Erro ao resetar a senha!", error);
        return res.status(500).json({
            status: "FALHA",
            mensagem: "Erro interno no servidor."
        });
    }
});

//ROTA PARA 'EXCLUIR' O USUARIO 
app.post('/inativarusuario', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ 
                status: "FALHA", 
                mensagem: "Identificação é obrigatório" 
            });
        }

        const resultado = await Usuario.update(
            {
                ativo: 'F'
            },
            {
                where: {
                    id: id 
                }
            }
        );

        if (resultado[0] > 0) {
            return res.status(201).json({
            status: "SUCESSO",
            mensagem: "Usuário inativado com sucesso!",
            });
        } else {
            return res.status(404).json({
            status: "FALHA",
            mensagem: "Houve um problema ao inativar o usuário!",
            });
        }
    } catch (error) {
        console.error("Erro ao inativar usuário!", error);
        return res.status(500).json({
            status: "FALHA",
            mensagem: "Erro interno no servidor."
        });
    }
});

//ROTA PARA ATUALIZAR USUÁRIO
app.post('/atualizarusuario', async (req, res) => {
    try {
        const { id, nome, email, telefone, genero, funcao } = req.body;

        if (!id || !nome || !email || !telefone || !genero || !funcao) {
            return res.status(400).json({ 
                status: "FALHA", 
                mensagem: "Preencha todos os campos!" 
            });
        }

        const resultado = await Usuario.update(
            {
                nome: nome,
                email: email,
                telefone: telefone,
                sexo: genero,
                funcao: funcao,
            },
            {
                where: {
                    id: id 
                }
            }
        );

        if (resultado[0] > 0) {
            return res.status(201).json({
            status: "SUCESSO",
            mensagem: "Usuário alterado com sucesso!",
            });
        } else {
            return res.status(404).json({
            status: "FALHA",
            mensagem: "Houve um problema ao alterar o usuário!",
            });
        }
    } catch (error) {
        console.error("Erro ao alterar o usuário!", error);
        return res.status(500).json({
            status: "FALHA",
            mensagem: "Erro interno no servidor."
        });
    }
});


app.get("/dashboard", async (req, res) => {

    try {

        const totalLixeiras = await db.query(`
            SELECT COUNT(*) total
            FROM lixeiras
        `);

        const totalUsuarios = await db.query(`
            SELECT COUNT(*) total
            FROM usuarios
        `);

        const lixeirasCriticas = await db.query(`
            SELECT COUNT(*) total
            FROM (
                SELECT
                    codlixeira,
                    porcentagem,
                    ROW_NUMBER() OVER(
                        PARTITION BY codlixeira
                        ORDER BY data DESC
                    ) rnk
                FROM lixeiramovimentos
            ) x
            WHERE rnk = 1
            AND porcentagem >= 80
        `);

        const mediaOcupacao = await db.query(`
            SELECT
                ROUND(AVG(porcentagem),0) media
            FROM (
                SELECT
                    codlixeira,
                    porcentagem,
                    ROW_NUMBER() OVER(
                        PARTITION BY codlixeira
                        ORDER BY data DESC
                    ) rnk
                FROM lixeiramovimentos
            ) x
            WHERE rnk = 1
        `);

        res.json({
            totalLixeiras: Number(totalLixeiras[0][0].total),
            totalUsuarios: Number(totalUsuarios[0][0].total),
            lixeirasCriticas: Number(lixeirasCriticas[0][0].total),
            mediaOcupacao: Number(mediaOcupacao[0][0].media || 0)
        });

    } catch (erro) {

        console.log(erro);

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/dashboard/evolucao", async (req, res) => {

    try {

        const dados = await db.query(`
            SELECT
                DATE(data) dia,
                ROUND(AVG(porcentagem),0) media
            FROM lixeiramovimentos
            GROUP BY DATE(data)
            ORDER BY dia
        `);

        res.json(dados[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/dashboard/top-lixeiras", async (req, res) => {

    try {

        const dados = await db.query(`
            SELECT
                l.id,
                l.referencia,
                ROUND(AVG(lm.porcentagem),0) media
            FROM lixeiras l
            INNER JOIN lixeiramovimentos lm
                ON lm.codlixeira = l.id
            GROUP BY
                l.id,
                l.referencia
            ORDER BY media DESC
            LIMIT 10
        `);

        res.json(dados[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/dashboard/criticas", async (req, res) => {

    try {

        const dados = await db.query(`
            SELECT
                l.id,
                l.referencia,
                x.porcentagem
            FROM lixeiras l
            INNER JOIN (
                SELECT
                    codlixeira,
                    porcentagem,
                    ROW_NUMBER() OVER(
                        PARTITION BY codlixeira
                        ORDER BY data DESC
                    ) rnk
                FROM lixeiramovimentos
            ) x
                ON x.codlixeira = l.id
            WHERE x.rnk = 1
            AND x.porcentagem >= 80
            ORDER BY x.porcentagem DESC
        `);

        res.json(dados[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/dashboard/ultimas-leituras", async (req, res) => {

    try {

        const dados = await db.query(`
            SELECT
                lm.id,
                lm.data,
                lm.porcentagem,
                l.id codlixeira,
                l.referencia
            FROM lixeiramovimentos lm
            INNER JOIN lixeiras l
                ON l.id = lm.codlixeira
            ORDER BY lm.data DESC
            LIMIT 20
        `);

        res.json(dados[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.get("/dashboard/tipos", async (req, res) => {

    try {

        const dados = await db.query(`
            SELECT
                tipolixeira,
                COUNT(*) quantidade
            FROM lixeiras
            GROUP BY tipolixeira
            ORDER BY quantidade DESC
        `);

        res.json(dados[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.listen(8082)