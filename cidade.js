const db = require("./db") 

const Cidade = db.sequelize.define('cidade',
    {
        nome:
        {
            type: db.Sequelize.TEXT
        },
        codestado:
        {
            type: db.Sequelize.INTEGER
        }
    })

module.exports = Cidade;