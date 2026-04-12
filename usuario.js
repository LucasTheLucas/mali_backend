const db = require("./db") 

const Usuario = db.sequelize.define('usuario',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        },
        sexo:
        {
            type: db.Sequelize.TEXT
        },
        telefone:
        {
            type: db.Sequelize.TEXT
        },
        email:
        {
            type: db.Sequelize.TEXT
        },
        senha:
        {
            type: db.Sequelize.TEXT
        },
        funcao:
        {
            type: db.Sequelize.TEXT
        }
    })

        Usuario.sequelize.sync({ force: false })

//module.exports = Usuario;